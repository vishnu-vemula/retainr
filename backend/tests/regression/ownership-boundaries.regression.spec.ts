import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';

vi.mock('../../src/database/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: async (token: string) => ({ uid: token, email: `${token}@example.com`, name: 'Regression Tester' }),
    setCustomUserClaims: vi.fn().mockResolvedValue(undefined)
  }
}));

import { createApp } from '../../src/app';

let app: ReturnType<typeof createApp>;
const prisma = new PrismaClient();
const as = (token: string) => ({ Authorization: `Bearer ${token}` });
let databaseReady = false;

async function resetDatabase(): Promise<void> {
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
}

beforeEach(async () => {
  await resetDatabase();
  app = createApp();
  databaseReady = true;
});

afterAll(async () => {
  if (databaseReady) await resetDatabase();
  await prisma.$disconnect();
});

describe('ownership and route-order regressions', () => {
  it('keeps CSV export reachable and prevents cross-owner contact access', async () => {
    const owned = await request(app).post('/api/v1/contacts').set(as('owner')).send({ name: 'Owned Contact' });
    const foreign = await request(app).post('/api/v1/contacts').set(as('csv-foreign')).send({ name: 'Private Contact' });

    expect(owned.status).toBe(201);
    expect(foreign.status).toBe(201);

    const exported = await request(app).get('/api/v1/contacts/export').set(as('owner'));
    expect(exported.status).toBe(200);
    expect(exported.headers['content-type']).toContain('text/csv');
    expect(exported.text).toContain('Owned Contact');
    expect(exported.text).not.toContain('Private Contact');

    const deleted = await request(app).delete(`/api/v1/contacts/${foreign.body.data.id}`).set(as('owner'));
    expect(deleted.status).toBe(404);
    expect(deleted.body.error.code).toBe('NOT_FOUND');
  });

  it('exports spreadsheet-looking contact values as inert text', async () => {
    const created = await request(app).post('/api/v1/contacts').set(as('csv-owner')).send({
      name: '=HYPERLINK("https://example.invalid", "Open")',
      email: 'safe@example.com',
      position: '+SUM(1,2)'
    });
    const foreign = await request(app).post('/api/v1/contacts').set(as('other-owner')).send({ name: 'Private Contact' });
    expect(created.status).toBe(201);
    expect(foreign.status).toBe(201);

    const exported = await request(app).get('/api/v1/contacts/export').set(as('csv-owner'));
    expect(exported.status).toBe(200);
    expect(exported.text).toContain(`"'=HYPERLINK(""https://example.invalid"", ""Open"")"`);
    expect(exported.text).toContain(`"'+SUM(1,2)"`);
    expect(exported.text).not.toContain('Private Contact');
  });

  it('keeps contact last activity equal to the latest remaining activity after edits and deletion', async () => {
    const contact = await request(app).post('/api/v1/contacts').set(as('activity-owner')).send({ name: 'Timeline Contact' });
    expect(contact.status).toBe(201);
    const contactId: string = contact.body.data.id;
    const earlier = await request(app).post('/api/v1/activities').set(as('activity-owner')).send({
      type: 'NOTE', title: 'Earlier', contactId, occurredAt: '2026-01-01T00:00:00.000Z'
    });
    const later = await request(app).post('/api/v1/activities').set(as('activity-owner')).send({
      type: 'CALL', title: 'Later', contactId, occurredAt: '2026-02-01T00:00:00.000Z'
    });
    expect(earlier.status).toBe(201);
    expect(later.status).toBe(201);

    const detail = () => request(app).get(`/api/v1/contacts/${contactId}`).set(as('activity-owner'));
    expect((await detail()).body.data.lastActivityAt).toBe('2026-02-01T00:00:00.000Z');

    const moved = await request(app).patch(`/api/v1/activities/${later.body.data.id}`).set(as('activity-owner')).send({
      occurredAt: '2025-12-01T00:00:00.000Z'
    });
    expect(moved.status).toBe(200);
    expect((await detail()).body.data.lastActivityAt).toBe('2026-01-01T00:00:00.000Z');

    const removed = await request(app).delete(`/api/v1/activities/${earlier.body.data.id}`).set(as('activity-owner'));
    expect(removed.status).toBe(204);
    expect((await detail()).body.data.lastActivityAt).toBe('2025-12-01T00:00:00.000Z');

    expect((await request(app).delete(`/api/v1/activities/${later.body.data.id}`).set(as('activity-owner'))).status).toBe(204);
    expect((await detail()).body.data.lastActivityAt).toBeNull();
  });

  it('recalculates both contacts when an activity is moved and rejects foreign links', async () => {
    const first = await request(app).post('/api/v1/contacts').set(as('move-owner')).send({ name: 'First' });
    const second = await request(app).post('/api/v1/contacts').set(as('move-owner')).send({ name: 'Second' });
    const foreign = await request(app).post('/api/v1/contacts').set(as('move-foreign')).send({ name: 'Foreign' });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(foreign.status).toBe(201);

    const activity = await request(app).post('/api/v1/activities').set(as('move-owner')).send({
      type: 'NOTE', title: 'Moved note', contactId: first.body.data.id, occurredAt: '2026-03-01T00:00:00.000Z'
    });
    expect(activity.status).toBe(201);
    const rejected = await request(app).patch(`/api/v1/activities/${activity.body.data.id}`).set(as('move-owner')).send({
      contactId: foreign.body.data.id
    });
    expect(rejected.status).toBe(404);

    const moved = await request(app).patch(`/api/v1/activities/${activity.body.data.id}`).set(as('move-owner')).send({
      contactId: second.body.data.id
    });
    expect(moved.status).toBe(200);
    const firstDetail = await request(app).get(`/api/v1/contacts/${first.body.data.id}`).set(as('move-owner'));
    const secondDetail = await request(app).get(`/api/v1/contacts/${second.body.data.id}`).set(as('move-owner'));
    expect(firstDetail.body.data.lastActivityAt).toBeNull();
    expect(secondDetail.body.data.lastActivityAt).toBe('2026-03-01T00:00:00.000Z');
  });
});
