import type { User } from '@prisma/client';
import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { AuthMiddleware } from '../../common/middleware/auth.middleware';
import { errorHandler } from '../../common/middleware/error.middleware';
import type { IUsersRepository, UpsertFromFirebaseInput } from './users.repository';
import { UsersService } from './users.service';

vi.mock('../../config/env', () => ({ bootstrapAdminEmails: ['admin@example.com'] }));
vi.mock('../../database/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: vi.fn(async (token: string) => ({
      uid: token === 'moved' ? 'legacy' : token,
      email: token === 'moved' ? 'other@example.com' : 'admin@example.com',
      email_verified: token !== 'legacy'
    })),
    setCustomUserClaims: vi.fn().mockResolvedValue(undefined)
  },
  hasFullFirebaseCredentials: true
}));

function makeRepo() {
  const users = new Map<string, User>();
  const repo: IUsersRepository = {
    upsertFromFirebase: vi.fn(async (input: UpsertFromFirebaseInput) => {
      const user = {
        id: input.id,
        email: input.forceAdmin ? input.email : users.get(input.id)?.email ?? input.email,
        displayName: input.displayName,
        photoURL: input.photoURL,
        role: input.forceAdmin ? 'ADMIN' : users.get(input.id)?.role ?? 'MEMBER'
      } as User;
      users.set(input.id, user);
      return user;
    }),
    findById: vi.fn(async (id: string) => users.get(id) ?? null),
    list: vi.fn(async () => ({ items: [...users.values()], total: users.size })),
    setRole: vi.fn(async (id: string, role: User['role']) => {
      const user = users.get(id);
      if (!user) throw new Error('Missing user');
      const updated = { ...user, role };
      users.set(id, updated);
      return updated;
    }),
    updateProfile: vi.fn(async (id: string) => {
      const user = users.get(id);
      if (!user) throw new Error('Missing user');
      return user;
    })
  };
  return { repo, users };
}

describe('UsersService authorization', () => {
  it('does not bootstrap an unverified email as admin', async () => {
    const { repo } = makeRepo();
    const service = new UsersService(repo);
    const user = await service.ensureFromToken({ uid: 'attacker', email: 'admin@example.com', emailVerified: false });
    expect(user.role).toBe('MEMBER');
    expect(repo.upsertFromFirebase).toHaveBeenCalledWith(expect.objectContaining({ forceAdmin: false }));
  });

  it('bootstraps a verified email as admin', async () => {
    const { repo } = makeRepo();
    const service = new UsersService(repo);
    const user = await service.ensureFromToken({ uid: 'owner', email: 'admin@example.com', emailVerified: true });
    expect(user.role).toBe('ADMIN');
  });

  it('updates the stored email when a verified account becomes a bootstrap admin', async () => {
    const { repo } = makeRepo();
    const service = new UsersService(repo);
    await service.ensureFromToken({ uid: 'owner', email: 'old@example.com', emailVerified: true });
    const user = await service.ensureFromToken({ uid: 'owner', email: 'admin@example.com', emailVerified: true });
    expect(user).toMatchObject({ email: 'admin@example.com', role: 'ADMIN' });
  });

  it('applies role changes on the next authenticated request', async () => {
    const { repo } = makeRepo();
    const service = new UsersService(repo);
    const token = { uid: 'member', email: 'member@example.com', emailVerified: true };
    await service.ensureFromToken(token);
    await service.setRole('owner', 'member', 'ADMIN');
    expect((await service.ensureFromToken(token)).role).toBe('ADMIN');
    await service.setRole('owner', 'member', 'MEMBER');
    expect((await service.ensureFromToken(token)).role).toBe('MEMBER');
  });

  it('does not retain a role changed by another server instance', async () => {
    const { repo } = makeRepo();
    const service = new UsersService(repo);
    const token = { uid: 'member', email: 'member@example.com', emailVerified: true };
    await service.ensureFromToken(token);
    await repo.setRole('member', 'ADMIN');
    expect((await service.ensureFromToken(token)).role).toBe('ADMIN');
  });

  it('blocks an existing unverified admin from admin routes', async () => {
    const { repo } = makeRepo();
    const service = new UsersService(repo);
    await service.ensureFromToken({ uid: 'legacy', email: 'admin@example.com', emailVerified: false });
    const admin = await repo.setRole('legacy', 'ADMIN');
    const auth = new AuthMiddleware(service);
    const app = express();
    expect(admin.role).toBe('ADMIN');
    app.get('/admin', auth.requireAuth, auth.requireRole('ADMIN'), (_req, res) => res.json({ data: 'ok' }));
    app.use(errorHandler);

    const response = await request(app).get('/admin').set('Authorization', 'Bearer legacy');
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('EMAIL_NOT_VERIFIED');
    const moved = await request(app).get('/admin').set('Authorization', 'Bearer moved');
    expect(moved.status).toBe(403);
    expect(moved.body.error.code).toBe('EMAIL_NOT_VERIFIED');
    const verified = await request(app).get('/admin').set('Authorization', 'Bearer verified');
    expect(verified.status).toBe(200);
  });
});
