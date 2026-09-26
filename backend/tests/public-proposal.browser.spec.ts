import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import type { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

vi.mock('../src/database/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: async (token: string) => ({ uid: token, email: `${token}@example.com`, name: 'Browser Tester' }),
    setCustomUserClaims: vi.fn().mockResolvedValue(undefined)
  }
}));

const prisma = new PrismaClient();
const ownerId = `browser-${randomUUID()}`;
const frontendDir = resolve(process.cwd(), '../frontend');
let chromeProfile: string | undefined;
let api: Express | undefined;
let apiServer: Server | undefined;
let nextServer: ChildProcess | undefined;
let chrome: ChildProcess | undefined;
let browser: CdpClient | undefined;
let frontendLog = '';
let frontendUrl = '';

type CdpResult = { result?: { value?: unknown }; exceptionDetails?: unknown };
type Point = { x: number; y: number };

class CdpClient {
  private nextId = 1;
  private readonly pending = new Map<number, { resolve: (value: CdpResult) => void; reject: (error: Error) => void }>();

  constructor(private readonly socket: WebSocket) {
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as { id?: number; result?: CdpResult; error?: { message: string } };
      if (message.id === undefined) return;
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result ?? {});
    });
    socket.addEventListener('close', () => {
      for (const waiter of this.pending.values()) waiter.reject(new Error('Chrome debugging connection closed'));
      this.pending.clear();
    });
  }

  call(method: string, params: Record<string, unknown> = {}): Promise<CdpResult> {
    const id = this.nextId++;
    return new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Chrome debugging command timed out: ${method}`));
      }, 10_000);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timeout); resolvePromise(value); },
        reject: (error) => { clearTimeout(timeout); reject(error); }
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate<T>(expression: string): Promise<T> {
    const response = await this.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(`Browser evaluation failed: ${JSON.stringify(response.exceptionDetails)}`);
    return response.result?.value as T;
  }

  async click(selector: string, label: string): Promise<void> {
    const point = await this.evaluate<Point | null>(`(async () => {
      const element = Array.from(document.querySelectorAll(${JSON.stringify(selector)}))
        .find((candidate) => candidate.textContent?.includes(${JSON.stringify(label)}));
      if (!element) return null;
      element.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const rect = element.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) return null;
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    if (!point) throw new Error(`Browser element not found: ${selector} containing ${label}`);
    await this.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await this.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  }

  close(): void {
    this.socket.close();
  }
}

async function waitFor<T>(read: () => Promise<T | null>, label: string, timeoutMs = 60_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const result = await read();
      if (result !== null) return result;
    } catch {
      // Startup requests may fail until the HTTP listener or browser target is ready.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Timed out waiting for ${label}. Frontend output: ${frontendLog.slice(-2000)}`);
}

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>((resolvePromise) => probe.listen(0, '127.0.0.1', resolvePromise));
  const address = probe.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a local port');
  await new Promise<void>((resolvePromise) => probe.close(() => resolvePromise()));
  return address.port;
}

function chromeBinary(): string {
  const candidates = [
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  const found = candidates.find((candidate): candidate is string => Boolean(candidate && existsSync(candidate)));
  if (!found) throw new Error('Chrome or Edge is required for test:browser; set CHROME_BIN to its executable');
  return found;
}

async function connectToPage(debugPort: number, url: string): Promise<CdpClient> {
  const target = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`, { signal: AbortSignal.timeout(2000) });
    const pages = await response.json() as { type: string; url: string; webSocketDebuggerUrl: string }[];
    return pages.find((page) => page.type === 'page' && page.url.startsWith(url)) ?? null;
  }, 'Chrome page');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise<void>((resolvePromise, reject) => {
    socket.addEventListener('open', () => resolvePromise(), { once: true });
    socket.addEventListener('error', () => reject(new Error('Chrome debugging connection failed')), { once: true });
  });
  return new CdpClient(socket);
}

beforeAll(async () => {
  const frontendPort = await freePort();
  process.env.CORS_ORIGIN = `http://127.0.0.1:${frontendPort}`;
  const { createApp } = await import('../src/app');
  api = createApp();
  apiServer = api.listen(0, '127.0.0.1');
  await new Promise<void>((resolvePromise) => apiServer?.once('listening', resolvePromise));
  const address = apiServer.address();
  if (!address || typeof address === 'string') throw new Error('API did not bind a local port');

  nextServer = spawn(process.execPath, [join(frontendDir, 'node_modules/next/dist/bin/next'), 'dev', '-p', String(frontendPort), '-H', '127.0.0.1'], {
    cwd: frontendDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${address.port}/api/v1`,
      NEXT_PUBLIC_FIREBASE_API_KEY: '',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: '',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: '',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: '',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '',
      NEXT_PUBLIC_FIREBASE_APP_ID: ''
    },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  nextServer.stdout?.on('data', (chunk: Buffer) => { frontendLog += chunk.toString(); });
  nextServer.stderr?.on('data', (chunk: Buffer) => { frontendLog += chunk.toString(); });
  await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${frontendPort}/`, { signal: AbortSignal.timeout(2000) });
    return response.ok ? true : null;
  }, 'Next.js frontend');
  frontendUrl = `http://127.0.0.1:${frontendPort}`;
});

afterAll(async () => {
  browser?.close();
  chrome?.kill();
  nextServer?.kill();
  if (apiServer) await new Promise<void>((resolvePromise) => apiServer?.close(() => resolvePromise()));
  await prisma.auditLog.deleteMany({ where: { userId: ownerId } });
  await prisma.user.deleteMany({ where: { id: ownerId } });
  await prisma.$disconnect();
  if (chromeProfile && dirname(resolve(chromeProfile)) === resolve(tmpdir()) && basename(chromeProfile).startsWith('retainr-chrome-')) {
    await rm(chromeProfile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
});

it('accepts a client-selected retainer package in the browser and persists the complete workflow', async () => {
  if (!api) throw new Error('API was not initialized');
  const auth = { Authorization: `Bearer ${ownerId}` };
  const renewalDate = new Date(Date.now() + 15 * 86_400_000).toISOString();
  const madeDeal = await request(api).post('/api/v1/deals').set(auth).send({
    title: 'Browser journey retainer', value: 0, engagementType: 'RETAINER', monthlyRecurringValue: 700, renewalDate
  });
  expect(madeDeal.status).toBe(201);
  const dealId = madeDeal.body.data.id as string;
  for (const item of [
    { description: 'Setup', kind: 'BASE', unitPrice: 100 },
    { description: 'Growth', kind: 'PACKAGE', unitPrice: 500 },
    { description: 'Scale', kind: 'PACKAGE', unitPrice: 700 },
    { description: 'Creative', kind: 'ADD_ON', unitPrice: 80 }
  ]) {
    const added = await request(api).post(`/api/v1/deals/${dealId}/items`).set(auth).send(item);
    expect(added.status).toBe(201);
  }
  const madeProposal = await request(api).post('/api/v1/proposals').set(auth).send({ dealId });
  expect(madeProposal.status).toBe(201);
  const token = madeProposal.body.data.shareToken as string;
  expect(token).toHaveLength(43);
  if (!frontendUrl) throw new Error('Frontend URL was not initialized');
  const pageUrl = `${frontendUrl}/proposal/${token}`;
  const html = await fetch(pageUrl);
  expect(html.status).toBe(200);
  expect(html.headers.get('referrer-policy')).toBe('no-referrer');
  expect(html.headers.get('x-robots-tag')).toContain('noindex');

  const debugPort = await freePort();
  chromeProfile = await mkdtemp(join(tmpdir(), 'retainr-chrome-'));
  chrome = spawn(chromeBinary(), [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-extensions', '--no-first-run',
    '--disable-background-networking', `--user-data-dir=${chromeProfile}`,
    `--remote-debugging-port=${debugPort}`, '--window-size=1280,1000', pageUrl
  ], { windowsHide: true, stdio: 'ignore' });
  browser = await connectToPage(debugPort, pageUrl);
  await waitFor(async () => {
    const body = await browser?.evaluate<string>('document.body.innerText');
    return body?.includes('Choose a package') && body.includes('Browser journey retainer') ? true : null;
  }, 'proposal choices');

  await browser.click('label', 'Scale');
  await browser.click('label', 'Creative');
  const selected = await browser.evaluate<{ package: boolean; addon: boolean; body: string }>(`(() => ({
    package: Array.from(document.querySelectorAll('label')).find((label) => label.textContent?.includes('Scale'))?.querySelector('input')?.checked ?? false,
    addon: Array.from(document.querySelectorAll('label')).find((label) => label.textContent?.includes('Creative'))?.querySelector('input')?.checked ?? false,
    body: document.body.innerText
  }))()`);
  expect(selected.package).toBe(true);
  expect(selected.addon).toBe(true);
  expect(selected.body).toContain('$880.00');
  await browser.click('button', 'Accept proposal');
  try {
    await waitFor(async () => {
      const body = await browser?.evaluate<string>('document.body.innerText');
      return body?.includes('Proposal accepted.') ? true : null;
    }, 'accepted proposal', 10_000);
  } catch {
    const body = await browser.evaluate<string>('document.body.innerText');
    const proposal = await prisma.proposal.findFirst({ where: { dealId, ownerId }, select: { status: true } });
    throw new Error(`Acceptance did not render. Proposal status: ${proposal?.status}. Page: ${body}`);
  }

  const savedDeal = await prisma.deal.findFirst({ where: { id: dealId, ownerId } });
  expect(savedDeal).toMatchObject({ stage: 'WON', value: 880 });
  const savedProposal = await prisma.proposal.findFirst({ where: { dealId, ownerId } });
  expect(savedProposal?.status).toBe('ACCEPTED');
  expect(savedProposal?.selectedPackageId).toBeTruthy();
  expect(savedProposal?.selectedAddonIds).toHaveLength(1);
  expect(savedProposal?.tokenHash).toBe(createHash('sha256').update(token).digest('hex'));
  expect(await prisma.task.count({ where: { ownerId, dealId, onboardingKey: { not: null } } })).toBe(5);
  expect(await prisma.notification.count({ where: { ownerId, dedupeKey: `deal-won:${dealId}` } })).toBe(1);
  const dashboard = await request(api).get('/api/v1/dashboard/stats').set(auth);
  expect(dashboard.status).toBe(200);
  expect(dashboard.body.data.renewals.items.some((item: { id: string }) => item.id === dealId)).toBe(true);
});
