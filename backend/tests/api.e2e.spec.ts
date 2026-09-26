import { beforeAll, expect, it, vi } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';

vi.mock('../src/database/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: async (token: string) => {
      if (token === 'bad-token') {
        throw new Error('invalid token');
      }
      return { uid: token, email: `${token}@example.com`, name: 'E2E Tester' };
    },
    setCustomUserClaims: vi.fn().mockResolvedValue(undefined)
  }
}));

import { createApp } from '../src/app';

const app = createApp();
const prisma = new PrismaClient();

const as = (token: string) => ({ Authorization: `Bearer ${token}` });

let companyId = '';
let contactId = '';
let tagId = '';
let productId = '';
let dealId = '';
let itemId = '';

beforeAll(async () => {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.dealItem.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.product.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
});

it('reports liveness without auth', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.data.status).toBe('ok');
});

it('rejects requests without a token using the error envelope', async () => {
  const res = await request(app).get('/api/v1/contacts');
  expect(res.status).toBe(401);
  expect(res.body.error.code).toBe('UNAUTHENTICATED');
});

it('maps invalid firebase tokens to 401, not 500', async () => {
  const res = await request(app).get('/api/v1/contacts').set(as('bad-token'));
  expect(res.status).toBe(401);
  expect(res.body.error.code).toBe('UNAUTHENTICATED');
});

it('creates a session and grants bootstrap admin role', async () => {
  const res = await request(app).post('/api/v1/auth/session').set(as('e2e')).send({});
  expect(res.status).toBe(200);
  expect(res.body.data.id).toBe('e2e');
  expect(res.body.data.role).toBe('ADMIN');
});

it('rejects invalid bodies with 422 VALIDATION_ERROR', async () => {
  const res = await request(app).post('/api/v1/contacts').set(as('e2e')).send({});
  expect(res.status).toBe(422);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
});

it('creates a company and returns its detail aggregate', async () => {
  const created = await request(app).post('/api/v1/companies').set(as('e2e')).send({
    name: 'TestCo',
    domain: 'testco.com',
    industry: 'Software',
    employeeCount: 10
  });
  expect(created.status).toBe(201);
  companyId = created.body.data.id;

  const detail = await request(app).get(`/api/v1/companies/${companyId}`).set(as('e2e'));
  expect(detail.status).toBe(200);
  expect(detail.body.data.contacts).toEqual([]);
  expect(detail.body.data.deals).toEqual([]);
});

it('creates and updates contacts, filters by search, and exports CSV', async () => {
  const created = await request(app).post('/api/v1/contacts').set(as('e2e')).send({
    name: 'Ada Lovelace',
    email: 'ada@testco.com',
    companyId,
    source: 'REFERRAL'
  });
  expect(created.status).toBe(201);
  expect(created.body.data.status).toBe('LEAD');
  contactId = created.body.data.id;

  const updated = await request(app).patch(`/api/v1/contacts/${contactId}`).set(as('e2e')).send({ status: 'QUALIFIED' });
  expect(updated.body.data.status).toBe('QUALIFIED');

  const listed = await request(app).get('/api/v1/contacts?search=ada').set(as('e2e'));
  expect(listed.body.data.total).toBe(1);

  const csv = await request(app).get('/contacts/export'.replace('/contacts', '/api/v1/contacts')).set(as('e2e'));
  expect(csv.status).toBe(200);
  expect(csv.headers['content-type']).toContain('text/csv');
  expect(csv.text).toContain('Ada Lovelace');
});

it('manages tags and attaches them to a contact with ownership checks', async () => {
  const created = await request(app).post('/api/v1/tags').set(as('e2e')).send({ name: 'Hot', color: '#ef4444' });
  expect(created.status).toBe(201);
  tagId = created.body.data.id;

  const tagged = await request(app).patch(`/api/v1/contacts/${contactId}/tags`).set(as('e2e')).send({ tagIds: [tagId] });
  expect(tagged.body.data.tags).toHaveLength(1);

  const foreign = await request(app).patch(`/api/v1/contacts/${contactId}/tags`).set(as('e2e')).send({ tagIds: ['not-mine'] });
  expect(foreign.status).toBe(422);
});

it('creates products and deal line items, recalculating deal value', async () => {
  const product = await request(app).post('/api/v1/products').set(as('e2e')).send({ name: 'Seat', price: 100 });
  expect(product.status).toBe(201);
  productId = product.body.data.id;

  const deal = await request(app).post('/api/v1/deals').set(as('e2e')).send({
    title: 'Big deal',
    value: 0,
    contactId,
    companyId
  });
  expect(deal.status).toBe(201);
  expect(deal.body.data.stage).toBe('NEW');
  expect(deal.body.data.probability).toBe(10);
  dealId = deal.body.data.id;

  const item1 = await request(app).post(`/api/v1/deals/${dealId}/items`).set(as('e2e')).send({
    productId,
    description: 'Seats',
    quantity: 2,
    unitPrice: 100
  });
  expect(item1.status).toBe(201);
  itemId = item1.body.data.id;

  await request(app).post(`/api/v1/deals/${dealId}/items`).set(as('e2e')).send({
    description: 'Onboarding',
    quantity: 1,
    unitPrice: 50
  });

  let detail = await request(app).get(`/api/v1/deals/${dealId}`).set(as('e2e'));
  expect(detail.body.data.value).toBe(250);
  expect(detail.body.data.items).toHaveLength(2);

  await request(app).patch(`/api/v1/deals/${dealId}/items/${itemId}`).set(as('e2e')).send({ quantity: 3 });
  detail = await request(app).get(`/api/v1/deals/${dealId}`).set(as('e2e'));
  expect(detail.body.data.value).toBe(350);

  const items = detail.body.data.items as { id: string; description: string }[];
  const onboarding = items.find((item) => item.description === 'Onboarding');
  expect(onboarding).toBeDefined();
  await request(app).delete(`/api/v1/deals/${dealId}/items/${onboarding!.id}`).set(as('e2e'));
  detail = await request(app).get(`/api/v1/deals/${dealId}`).set(as('e2e'));
  expect(detail.body.data.value).toBe(300);
});

it('enforces quote-item parent and product ownership boundaries', async () => {
  const otherDeal = await request(app).post('/api/v1/deals').set(as('e2e')).send({ title: 'Separate deal', value: 0 });
  expect(otherDeal.status).toBe(201);

  const wrongParent = await request(app)
    .patch(`/api/v1/deals/${otherDeal.body.data.id}/items/${itemId}`)
    .set(as('e2e'))
    .send({ quantity: 9 });
  expect(wrongParent.status).toBe(404);

  const foreignProduct = await request(app).post('/api/v1/products').set(as('member2')).send({ name: 'Private product', price: 99 });
  expect(foreignProduct.status).toBe(201);

  const foreignProductItem = await request(app)
    .post(`/api/v1/deals/${dealId}/items`)
    .set(as('e2e'))
    .send({ productId: foreignProduct.body.data.id, description: 'Private product', quantity: 1, unitPrice: 99 });
  expect(foreignProductItem.status).toBe(404);
});

it('applies stage rules and emits a deduped DEAL_WON notification', async () => {
  const updated = await request(app).patch(`/api/v1/deals/${dealId}`).set(as('e2e')).send({ stage: 'PROPOSAL' });
  expect(updated.body.data.probability).toBe(50);
  expect(updated.body.data.closedAt).toBeNull();

  const won = await request(app).patch(`/api/v1/deals/${dealId}`).set(as('e2e')).send({ stage: 'WON' });
  expect(won.body.data.probability).toBe(100);
  expect(won.body.data.closedAt).not.toBeNull();

  const notifications = await request(app).get('/api/v1/notifications').set(as('e2e'));
  expect(notifications.body.data.unread).toBeGreaterThanOrEqual(1);
  expect(notifications.body.data.items.some((n: { type: string }) => n.type === 'DEAL_WON')).toBe(true);

  const read = await request(app).post('/api/v1/notifications/read').set(as('e2e')).send({ all: true });
  expect(read.body.data.unread).toBe(0);
});

it('keeps the original won date when changing a won deal without changing stage', async () => {
  const closedAt = new Date('2026-08-20T10:00:00.000Z');
  await prisma.deal.update({ where: { id_ownerId: { id: dealId, ownerId: 'e2e' } }, data: { closedAt } });
  const edited = await request(app).patch(`/api/v1/deals/${dealId}`).set(as('e2e')).send({ stage: 'WON', title: 'Big deal renewed' });
  expect(edited.status).toBe(200);
  expect(edited.body.data.closedAt).toBe(closedAt.toISOString());
});

it('takes a retainer from a public proposal to onboarding and renewal alerts', async () => {
  const renewalDate = new Date(Date.now() + 15 * 86_400_000).toISOString();
  const created = await request(app).post('/api/v1/deals').set(as('e2e')).send({
    title: 'Proposal journey', value: 0, companyId, contactId,
    engagementType: 'RETAINER', monthlyRecurringValue: 700, renewalDate
  });
  expect(created.status).toBe(201);
  const proposalDealId = created.body.data.id as string;
  for (const item of [
    { description: 'Setup', kind: 'BASE', unitPrice: 100 },
    { description: 'Growth', kind: 'PACKAGE', unitPrice: 500 },
    { description: 'Scale', kind: 'PACKAGE', unitPrice: 700 },
    { description: 'Creative', kind: 'ADD_ON', unitPrice: 80 }
  ]) {
    const added = await request(app).post(`/api/v1/deals/${proposalDealId}/items`).set(as('e2e')).send(item);
    expect(added.status).toBe(201);
  }
  const foreign = await request(app).post('/api/v1/proposals').set(as('member2')).send({ dealId: proposalDealId });
  expect(foreign.status).toBe(404);

  const made = await request(app).post('/api/v1/proposals').set(as('e2e')).send({ dealId: proposalDealId });
  expect(made.status).toBe(201);
  const token = made.body.data.shareToken as string;
  const staleProposal = await request(app).post('/api/v1/proposals').set(as('e2e')).send({ dealId: proposalDealId });
  expect(staleProposal.status).toBe(201);
  const staleToken = staleProposal.body.data.shareToken as string;
  expect(token.length).toBeGreaterThan(30);
  const listed = await request(app).get(`/api/v1/proposals?dealId=${proposalDealId}`).set(as('e2e'));
  expect(listed.status).toBe(200);
  expect(JSON.stringify(listed.body)).not.toContain(token);

  const viewed = await request(app).get(`/api/v1/proposals/public/${token}`);
  expect(viewed.status).toBe(200);
  expect(viewed.body.data.status).toBe('VIEWED');
  expect(viewed.body.data).not.toHaveProperty('ownerId');
  const snapshotItems = viewed.body.data.snapshot.items as { id: string; description: string }[];
  const scaleId = snapshotItems.find((item) => item.description === 'Scale')?.id;
  const creativeId = snapshotItems.find((item) => item.description === 'Creative')?.id;
  expect(scaleId).toBeTruthy();
  expect(creativeId).toBeTruthy();

  const invalid = await request(app).post(`/api/v1/proposals/public/${token}/respond`).send({
    decision: 'ACCEPTED', selectedPackageId: 'foreign', selectedAddonIds: []
  });
  expect(invalid.status).toBe(422);
  const response = { decision: 'ACCEPTED', selectedPackageId: scaleId, selectedAddonIds: [creativeId] };
  const accepted = await request(app).post(`/api/v1/proposals/public/${token}/respond`).send(response);
  expect(accepted.status).toBe(200);
  expect(accepted.body.data.status).toBe('ACCEPTED');

  const deal = await request(app).get(`/api/v1/deals/${proposalDealId}`).set(as('e2e'));
  expect(deal.body.data.stage).toBe('WON');
  expect(deal.body.data.value).toBe(880);
  expect(deal.body.data.closedAt).not.toBeNull();
  const tasks = await request(app).get(`/api/v1/tasks?dealId=${proposalDealId}`).set(as('e2e'));
  expect(tasks.body.data.items.filter((task: { onboardingKey: string | null }) => task.onboardingKey)).toHaveLength(5);

  const replay = await request(app).post(`/api/v1/proposals/public/${token}/respond`).send(response);
  expect(replay.status).toBe(200);
  const staleAcceptance = await request(app).post(`/api/v1/proposals/public/${staleToken}/respond`).send(response);
  expect(staleAcceptance.status).toBe(409);
  const closedProposal = await request(app).post('/api/v1/proposals').set(as('e2e')).send({ dealId: proposalDealId });
  expect(closedProposal.status).toBe(422);
  const unchanged = await request(app).get(`/api/v1/deals/${proposalDealId}`).set(as('e2e'));
  expect(unchanged.body.data.value).toBe(880);
  const tasksAfterReplay = await request(app).get(`/api/v1/tasks?dealId=${proposalDealId}`).set(as('e2e'));
  expect(tasksAfterReplay.body.data.items.filter((task: { onboardingKey: string | null }) => task.onboardingKey)).toHaveLength(5);
  const renewals = await request(app).get('/api/v1/dashboard/stats').set(as('e2e'));
  expect(renewals.body.data.renewals.items.some((item: { id: string }) => item.id === proposalDealId)).toBe(true);
  expect(renewals.body.data.renewals.within30).toBeGreaterThanOrEqual(1);
  const notifications = await request(app).get('/api/v1/notifications').set(as('e2e'));
  expect(notifications.body.data.items.some((item: { type: string }) => item.type === 'RENEWAL_DUE')).toBe(true);
});

it('allows only one concurrent proposal acceptance for an engagement', async () => {
  const deal = await request(app).post('/api/v1/deals').set(as('e2e')).send({ title: 'Race-safe scope', value: 0 });
  expect(deal.status).toBe(201);
  const raceDealId = deal.body.data.id as string;
  const item = await request(app).post(`/api/v1/deals/${raceDealId}/items`).set(as('e2e')).send({ description: 'Scope', unitPrice: 200 });
  expect(item.status).toBe(201);
  const proposals = await Promise.all([1, 2].map(() => request(app).post('/api/v1/proposals').set(as('e2e')).send({ dealId: raceDealId })));
  expect(proposals.map((response) => response.status)).toEqual([201, 201]);
  const decisions = await Promise.all(proposals.map((proposal) => request(app)
    .post(`/api/v1/proposals/public/${proposal.body.data.shareToken as string}/respond`)
    .send({ decision: 'ACCEPTED', selectedAddonIds: [] })));
  expect(decisions.map((response) => response.status).sort()).toEqual([200, 409]);
  const saved = await request(app).get(`/api/v1/deals/${raceDealId}`).set(as('e2e'));
  expect(saved.body.data.stage).toBe('WON');
  expect(saved.body.data.value).toBe(200);
  const tasks = await request(app).get(`/api/v1/tasks?dealId=${raceDealId}`).set(as('e2e'));
  expect(tasks.body.data.items.filter((task: { onboardingKey: string | null }) => task.onboardingKey)).toHaveLength(5);
});

it('syncs overdue tasks into notifications on read', async () => {
  await request(app).post('/api/v1/tasks').set(as('e2e')).send({
    title: 'Overdue work',
    dueDate: new Date(Date.now() - 86_400_000).toISOString(),
    priority: 'HIGH'
  });

  const notifications = await request(app).get('/api/v1/notifications').set(as('e2e'));
  expect(notifications.body.data.items.some((n: { type: string }) => n.type === 'TASK_OVERDUE')).toBe(true);
});

it('logs activities and updates the contact last-touch time', async () => {
  const activity = await request(app).post('/api/v1/activities').set(as('e2e')).send({
    type: 'CALL',
    title: 'Intro call',
    contactId,
    durationMin: 30
  });
  expect(activity.status).toBe(201);

  const detail = await request(app).get(`/api/v1/contacts/${contactId}`).set(as('e2e'));
  expect(detail.body.data.lastActivityAt).not.toBeNull();
  expect(detail.body.data.activities).toHaveLength(1);
});

it('reorders deals across stages', async () => {
  const second = await request(app).post('/api/v1/deals').set(as('e2e')).send({ title: 'Second deal', value: 500 });
  const secondId = second.body.data.id;

  const res = await request(app).patch('/api/v1/deals/reorder').set(as('e2e')).send({
    updates: [
      { id: dealId, stage: 'WON', position: 0 },
      { id: secondId, stage: 'QUALIFIED', position: 0 }
    ]
  });
  expect(res.status).toBe(200);
  expect(res.body.data).toHaveLength(2);

  const duplicate = await request(app).patch('/api/v1/deals/reorder').set(as('e2e')).send({
    updates: [
      { id: dealId, stage: 'WON', position: 0 },
      { id: dealId, stage: 'WON', position: 1 }
    ]
  });
  expect(duplicate.status).toBe(422);
});

it('returns audit history with the stage change recorded', async () => {
  const res = await request(app).get(`/api/v1/audit?entityType=DEAL&entityId=${dealId}`).set(as('e2e'));
  expect(res.status).toBe(200);
  expect(res.body.data.items.some((e: { action: string }) => e.action === 'STAGE_CHANGE')).toBe(true);
});

it('finds records through global search', async () => {
  const res = await request(app).get('/api/v1/search?q=TestCo').set(as('e2e'));
  expect(res.body.data.companies).toHaveLength(1);
});

it('computes dashboard stats scoped to the owner', async () => {
  await request(app).post('/api/v1/deals').set(as('e2e')).send({
    title: 'Open pipeline deal',
    value: 7500,
    companyId
  });

  const res = await request(app).get('/api/v1/dashboard/stats').set(as('e2e'));
  expect(res.status).toBe(200);
  expect(res.body.data.contacts.total).toBe(1);
  expect(res.body.data.deals.byStage.WON).toBeGreaterThanOrEqual(1);
  expect(res.body.data.revenueByMonth).toHaveLength(6);
  expect(res.body.data.topCompanies.length).toBeGreaterThanOrEqual(1);
  expect(res.body.data.topCompanies[0].name).toBe('TestCo');
});

it('isolates data between owners', async () => {
  const other = await request(app).post('/api/v1/contacts').set(as('member2')).send({ name: 'Private Person' });
  expect(other.status).toBe(201);

  const mine = await request(app).get('/api/v1/contacts').set(as('e2e'));
  expect(mine.body.data.items.some((c: { name: string }) => c.name === 'Private Person')).toBe(false);

  const res = await request(app).delete(`/api/v1/contacts/${other.body.data.id}`).set(as('e2e'));
  expect(res.status).toBe(404);
});

it('lists users and blocks self-demotion for admins', async () => {
  await request(app).post('/api/v1/auth/session').set(as('member2')).send({});

  const listed = await request(app).get('/api/v1/users').set(as('e2e'));
  expect(listed.body.data.total).toBeGreaterThanOrEqual(2);

  const self = await request(app).patch('/api/v1/users/e2e/role').set(as('e2e')).send({ role: 'MEMBER' });
  expect(self.status).toBe(422);

  const forbidden = await request(app).get('/api/v1/users').set(as('member2'));
  expect(forbidden.status).toBe(403);
});

it('returns the envelope for unknown routes', async () => {
  const res = await request(app).get('/api/v1/nope').set(as('e2e'));
  expect(res.status).toBe(404);
  expect(res.body.error.code).toBe('NOT_FOUND');
});
