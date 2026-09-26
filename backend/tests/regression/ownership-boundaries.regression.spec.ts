import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';

vi.mock('../../src/database/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: async (token: string) => ({ uid: token, email: `${token}@example.com`, name: 'Regression Tester' }),
    setCustomUserClaims: vi.fn().mockResolvedValue(undefined)
  }
}));

import { createApp } from '../../src/app';

const app = createApp();
const prisma = new PrismaClient();
const as = (token: string) => ({ Authorization: `Bearer ${token}` });
let databaseReady = false;

async function resetDatabase(): Promise<void> {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.dealItem.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.product.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
}

beforeAll(async () => {
  await resetDatabase();
  databaseReady = true;
});

afterAll(async () => {
  if (databaseReady) await resetDatabase();
  await prisma.$disconnect();
});

describe('ownership and route-order regressions', () => {
  it('keeps CSV export reachable and prevents cross-owner contact access', async () => {
    const owned = await request(app).post('/api/v1/contacts').set(as('owner')).send({ name: 'Owned Contact' });
    const foreign = await request(app).post('/api/v1/contacts').set(as('other-owner')).send({ name: 'Private Contact' });

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
});
