import { describe, expect, it, vi } from 'vitest';
import { TasksService } from './tasks.service';
import type { ITasksRepository, TaskWithRelations } from './tasks.repository';
import type { ListTasksQuery } from './tasks.schemas';

function buildFakeRepo(overrides: Partial<ITasksRepository> = {}): ITasksRepository {
  const task = { id: 't1', ownerId: 'u1', title: 'Follow up' } as TaskWithRelations;
  return {
    list: vi.fn().mockResolvedValue({ items: [task], total: 1 }),
    findByIdAndOwner: vi.fn().mockResolvedValue(task),
    findOverdue: vi.fn().mockResolvedValue([]),
    relationOwnedByOwner: vi.fn().mockResolvedValue(true),
    create: vi.fn().mockResolvedValue(task),
    update: vi.fn().mockResolvedValue(task),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

const buildAudit = () => ({ log: vi.fn().mockResolvedValue(undefined) });

const baseQuery: ListTasksQuery = { page: 1, pageSize: 25 };

describe('TasksService', () => {
  it('scopes list queries to the requesting owner', async () => {
    const repo = buildFakeRepo();
    const service = new TasksService(repo, buildAudit());

    await service.list('u1', { ...baseQuery, status: 'TODO' });

    expect(repo.list).toHaveBeenCalledWith({ ...baseQuery, status: 'TODO', ownerId: 'u1' });
  });

  it('blocks creating a task linked to a contact owned by someone else', async () => {
    const repo = buildFakeRepo({ relationOwnedByOwner: vi.fn().mockResolvedValue(false) });
    const service = new TasksService(repo, buildAudit());

    await expect(service.create('u1', { title: 'Private follow up', contactId: 'foreign-contact' })).rejects.toMatchObject({
      code: 'NOT_FOUND'
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('does not update a task that is outside the requester\'s workspace', async () => {
    const repo = buildFakeRepo({ findByIdAndOwner: vi.fn().mockResolvedValue(null) });
    const service = new TasksService(repo, buildAudit());

    await expect(service.update('u1', 'foreign-task', { title: 'Changed' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('writes an audit event after updating an owned task', async () => {
    const repo = buildFakeRepo();
    const audit = buildAudit();
    const service = new TasksService(repo, audit);

    await service.update('u1', 't1', { status: 'DONE' });

    expect(repo.update).toHaveBeenCalledWith('t1', 'u1', { status: 'DONE' });
    expect(audit.log).toHaveBeenCalledWith('u1', 'UPDATE', 'TASK', 't1', 'Updated task "Follow up"');
  });
});
