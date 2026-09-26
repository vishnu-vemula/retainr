import { AppError } from '../../common/utils/app-error';
import type { AuditLogger } from '../../common/utils/audit-logger';
import type { OnboardingTaskCreator } from '../../common/utils/onboarding-task-creator';
import type { ITasksRepository, TaskWithRelations } from './tasks.repository';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './tasks.schemas';

const ONBOARDING_CHECKLIST = [
  { key: 'collect-assets', title: 'Collect assets and access', days: 1 },
  { key: 'schedule-kickoff', title: 'Schedule kickoff', days: 2 },
  { key: 'confirm-scope', title: 'Confirm scope', days: 3 },
  { key: 'assign-owner', title: 'Assign account owner', days: 5 },
  { key: 'first-review', title: 'Schedule first client review', days: 7 }
] as const;

export class TasksService implements OnboardingTaskCreator {
  constructor(
    private readonly repo: ITasksRepository,
    private readonly audit: AuditLogger
  ) {}

  list(ownerId: string, query: ListTasksQuery): Promise<{ items: TaskWithRelations[]; total: number }> {
    return this.repo.list({ ...query, ownerId });
  }

  async get(ownerId: string, id: string): Promise<TaskWithRelations> {
    const task = await this.repo.findByIdAndOwner(id, ownerId);
    if (!task) throw AppError.notFound('Task');
    return task;
  }

  async create(ownerId: string, input: CreateTaskInput): Promise<TaskWithRelations> {
    await this.assertRelationsOwned(ownerId, input.contactId ?? null, input.dealId ?? null);
    const task = await this.repo.create(ownerId, input);
    await this.audit.log(ownerId, 'CREATE', 'TASK', task.id, `Created task "${task.title}"`);
    return task;
  }

  async update(ownerId: string, id: string, input: UpdateTaskInput): Promise<TaskWithRelations> {
    await this.get(ownerId, id);
    if (input.contactId !== undefined || input.dealId !== undefined) {
      await this.assertRelationsOwned(ownerId, input.contactId ?? null, input.dealId ?? null);
    }
    const task = await this.repo.update(id, ownerId, input);
    await this.audit.log(ownerId, 'UPDATE', 'TASK', id, `Updated task "${task.title}"`);
    return task;
  }

  async delete(ownerId: string, id: string): Promise<void> {
    const task = await this.get(ownerId, id);
    await this.repo.delete(id, ownerId);
    await this.audit.log(ownerId, 'DELETE', 'TASK', id, `Deleted task "${task.title}"`);
  }

  async createForWonDeal(ownerId: string, dealId: string, contactId: string | null): Promise<void> {
    const now = new Date();
    const tasks = ONBOARDING_CHECKLIST.map((item) => ({
      key: item.key,
      title: item.title,
      dueDate: new Date(now.getTime() + item.days * 24 * 60 * 60 * 1000)
    }));
    const created = await this.repo.createOnboardingTasks(ownerId, dealId, contactId, tasks);
    for (const task of created) {
      await this.audit.log(ownerId, 'CREATE', 'TASK', task.id, `Created onboarding task "${task.title}"`);
    }
  }

  private async assertRelationsOwned(ownerId: string, contactId: string | null, dealId: string | null): Promise<void> {
    if (contactId) {
      const owned = await this.repo.relationOwnedByOwner('contact', contactId, ownerId);
      if (!owned) throw AppError.notFound('Contact');
    }
    if (dealId) {
      const owned = await this.repo.relationOwnedByOwner('deal', dealId, ownerId);
      if (!owned) throw AppError.notFound('Deal');
    }
  }
}
