import type { Notification } from '@prisma/client';
import type { NotificationDispatcher, NotificationInput } from '../../common/utils/notification-dispatcher';
import type { RenewalAlertSync } from '../../common/utils/renewal-alert-sync';
import type { INotificationsRepository } from './notifications.repository';
import type { MarkReadInput } from './notifications.schemas';

export interface OverdueTaskSource {
  findOverdue(ownerId: string): Promise<{ id: string; title: string }[]>;
}

export interface RenewalAlertSource {
  findRenewalAlerts(ownerId: string, until: Date): Promise<{ id: string; title: string; renewalDate: Date | null; renewalHealth: 'HEALTHY' | 'AT_RISK' | 'UNKNOWN' }[]>;
}

export class NotificationsService implements NotificationDispatcher, RenewalAlertSync {
  constructor(
    private readonly repo: INotificationsRepository,
    private readonly tasksSource: OverdueTaskSource,
    private readonly renewalSource: RenewalAlertSource
  ) {}

  async list(ownerId: string): Promise<{ items: Notification[]; unread: number }> {
    await this.syncOverdueTasks(ownerId);
    await this.syncRenewals(ownerId);
    const [items, unread] = await Promise.all([this.repo.listRecent(ownerId), this.repo.countUnread(ownerId)]);
    return { items, unread };
  }

  async markRead(ownerId: string, input: MarkReadInput): Promise<{ items: Notification[]; unread: number }> {
    if (input.all) {
      await this.repo.markRead(ownerId, 'all');
    } else if (input.ids) {
      await this.repo.markRead(ownerId, input.ids);
    }
    const [items, unread] = await Promise.all([this.repo.listRecent(ownerId), this.repo.countUnread(ownerId)]);
    return { items, unread };
  }

  async dispatch(ownerId: string, input: NotificationInput): Promise<void> {
    await this.repo.createIfNotExists(ownerId, {
      type: input.type,
      title: input.title,
      body: input.body ?? undefined,
      dedupeKey: input.dedupeKey ?? undefined
    });
  }

  private async syncOverdueTasks(ownerId: string): Promise<void> {
    const overdue = await this.tasksSource.findOverdue(ownerId);
    for (const task of overdue) {
      await this.repo.createIfNotExists(ownerId, {
        type: 'TASK_OVERDUE',
        title: `Task overdue: ${task.title}`,
        dedupeKey: `task-overdue:${task.id}`
      });
    }
  }

  async syncRenewals(ownerId: string): Promise<void> {
    const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const renewals = await this.renewalSource.findRenewalAlerts(ownerId, until);
    for (const renewal of renewals) {
      if (renewal.renewalDate && renewal.renewalDate <= until) {
        const date = renewal.renewalDate.toISOString().slice(0, 10);
        await this.repo.createIfNotExists(ownerId, {
          type: 'RENEWAL_DUE',
          title: `Renewal due: ${renewal.title}`,
          body: `Renewal date: ${date}`,
          dedupeKey: `renewal-due:${renewal.id}:${date}`
        });
      }
      if (renewal.renewalHealth === 'AT_RISK') {
        await this.repo.createIfNotExists(ownerId, {
          type: 'RETAINER_AT_RISK',
          title: `Retainer at risk: ${renewal.title}`,
          dedupeKey: `retainer-at-risk:${renewal.id}`
        });
      }
    }
  }
}
