import { describe, expect, it, vi } from 'vitest';
import { NotificationsService } from './notifications.service';
import type { INotificationsRepository } from './notifications.repository';

function buildFakeRepo(overrides: Partial<INotificationsRepository> = {}): INotificationsRepository {
  return {
    createIfNotExists: vi.fn().mockResolvedValue({ id: 'n1', readAt: null }),
    listRecent: vi.fn().mockResolvedValue([{ id: 'n1', readAt: null }]),
    countUnread: vi.fn().mockResolvedValue(1),
    markRead: vi.fn().mockResolvedValue(1),
    ...overrides
  };
}

describe('NotificationsService', () => {
  it('creates deduped renewal and risk alerts on demand', async () => {
    const repo = buildFakeRepo();
    const renewalDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const service = new NotificationsService(repo, { findOverdue: vi.fn().mockResolvedValue([]) }, {
      findRenewalAlerts: vi.fn().mockResolvedValue([{
        id: 'd1', title: 'Ads retainer', renewalDate, renewalHealth: 'AT_RISK'
      }])
    });
    await service.syncRenewals('u1');
    expect(repo.createIfNotExists).toHaveBeenCalledWith('u1', expect.objectContaining({
      type: 'RENEWAL_DUE', dedupeKey: `renewal-due:d1:${renewalDate.toISOString().slice(0, 10)}`
    }));
    expect(repo.createIfNotExists).toHaveBeenCalledWith('u1', expect.objectContaining({
      type: 'RETAINER_AT_RISK', dedupeKey: 'retainer-at-risk:d1'
    }));
  });
  it('syncs overdue tasks into deduped notifications on list', async () => {
    const repo = buildFakeRepo();
    const service = new NotificationsService(repo, {
      findOverdue: vi.fn().mockResolvedValue([
        { id: 't1', title: 'Send contract' },
        { id: 't2', title: 'Call Jane' }
      ])
    }, { findRenewalAlerts: vi.fn().mockResolvedValue([]) });
    const result = await service.list('u1');
    expect(repo.createIfNotExists).toHaveBeenCalledTimes(2);
    expect(repo.createIfNotExists).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ type: 'TASK_OVERDUE', dedupeKey: 'task-overdue:t1' })
    );
    expect(result).toEqual({ items: [{ id: 'n1', readAt: null }], unread: 1 });
  });

  it('marks all notifications as read', async () => {
    const repo = buildFakeRepo();
    const service = new NotificationsService(repo, { findOverdue: vi.fn().mockResolvedValue([]) }, { findRenewalAlerts: vi.fn().mockResolvedValue([]) });
    await service.markRead('u1', { all: true });
    expect(repo.markRead).toHaveBeenCalledWith('u1', 'all');
  });

  it('dispatch creates a notification through the repository', async () => {
    const repo = buildFakeRepo();
    const service = new NotificationsService(repo, { findOverdue: vi.fn().mockResolvedValue([]) }, { findRenewalAlerts: vi.fn().mockResolvedValue([]) });
    await service.dispatch('u1', { type: 'DEAL_WON', title: 'Deal won: X', dedupeKey: 'deal-won:d1' });
    expect(repo.createIfNotExists).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ type: 'DEAL_WON', dedupeKey: 'deal-won:d1' })
    );
  });
});
