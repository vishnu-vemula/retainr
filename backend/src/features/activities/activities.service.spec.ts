import { describe, expect, it, vi } from 'vitest';
import { ActivitiesService } from './activities.service';
import type { ActivityWithRelations, IActivitiesRepository } from './activities.repository';

function buildFakeRepo(overrides: Partial<IActivitiesRepository> = {}): IActivitiesRepository {
  const activity = {
    id: 'a1',
    ownerId: 'u1',
    type: 'CALL',
    title: 'Discovery call',
    occurredAt: new Date('2026-01-10T10:00:00Z'),
    contactId: 'c1'
  } as ActivityWithRelations;
  return {
    list: vi.fn().mockResolvedValue({ items: [activity], total: 1 }),
    findByIdAndOwner: vi.fn().mockResolvedValue(activity),
    relationOwnedByOwner: vi.fn().mockResolvedValue(true),
    refreshContactLastActivity: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue(activity),
    update: vi.fn().mockResolvedValue(activity),
    delete: vi.fn(),
    ...overrides
  };
}

const audit = { log: vi.fn().mockResolvedValue(undefined) };

describe('ActivitiesService', () => {
  it('refreshes contact lastActivityAt when the activity links to a contact', async () => {
    const repo = buildFakeRepo();
    const service = new ActivitiesService(repo, audit);
    await service.create('u1', { type: 'CALL', title: 'Discovery call', contactId: 'c1' });
    expect(repo.refreshContactLastActivity).toHaveBeenCalledWith('c1', 'u1');
  });

  it('does not touch contacts when the activity has no contact', async () => {
    const repo = buildFakeRepo();
    const created = { id: 'a2', ownerId: 'u1', type: 'NOTE', title: 'Note', occurredAt: new Date(), contactId: null } as ActivityWithRelations;
    repo.create = vi.fn().mockResolvedValue(created);
    const service = new ActivitiesService(repo, audit);
    await service.create('u1', { type: 'NOTE', title: 'Note' });
    expect(repo.refreshContactLastActivity).not.toHaveBeenCalled();
  });

  it('rejects activities linked to a deal owned by someone else', async () => {
    const repo = buildFakeRepo({ relationOwnedByOwner: vi.fn().mockResolvedValue(false) });
    const service = new ActivitiesService(repo, audit);
    await expect(service.create('u1', { type: 'NOTE', title: 'X', dealId: 'foreign' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('refreshes both contacts when an activity moves between them', async () => {
    const repo = buildFakeRepo();
    repo.update = vi.fn().mockResolvedValue({
      id: 'a1', ownerId: 'u1', type: 'CALL', title: 'Discovery call', contactId: 'c2'
    } as ActivityWithRelations);
    const service = new ActivitiesService(repo, audit);

    await service.update('u1', 'a1', { contactId: 'c2' });

    expect(repo.refreshContactLastActivity).toHaveBeenNthCalledWith(1, 'c1', 'u1');
    expect(repo.refreshContactLastActivity).toHaveBeenNthCalledWith(2, 'c2', 'u1');
  });

  it('refreshes the former contact after removing its last linked activity', async () => {
    const repo = buildFakeRepo();
    const service = new ActivitiesService(repo, audit);

    await service.delete('u1', 'a1');

    expect(repo.delete).toHaveBeenCalledWith('a1', 'u1');
    expect(repo.refreshContactLastActivity).toHaveBeenCalledWith('c1', 'u1');
  });

  it('does not change a foreign activity or its contact timestamp', async () => {
    const repo = buildFakeRepo({ findByIdAndOwner: vi.fn().mockResolvedValue(null) });
    const service = new ActivitiesService(repo, audit);

    await expect(service.delete('u1', 'foreign')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.delete).not.toHaveBeenCalled();
    expect(repo.refreshContactLastActivity).not.toHaveBeenCalled();
  });
});
