import { describe, expect, it, vi } from 'vitest';
import { DealsService } from './deals.service';
import type { IDealsRepository, DealWithRelations, DealItemWithProduct } from './deals.repository';
import type { ReorderDealsInput } from './deals.schemas';

function buildFakeRepo(overrides: Partial<IDealsRepository> = {}): IDealsRepository {
  const deal = { id: 'd1', ownerId: 'u1', stage: 'NEW', title: 'Deal one' } as DealWithRelations;
  return {
    list: vi.fn(),
    findByIdAndOwner: vi.fn().mockResolvedValue(deal),
    findDetailByIdAndOwner: vi.fn().mockResolvedValue(deal),
    maxPositionInStage: vi.fn().mockResolvedValue(4),
    relationOwnedByOwner: vi.fn().mockResolvedValue(true),
    create: vi.fn().mockImplementation((_ownerId: string, input: { stage?: string; position?: number; probability?: number }) => ({
      ...deal,
      stage: input.stage ?? 'NEW',
      position: input.position ?? 1,
      probability: input.probability ?? 10
    })),
    update: vi.fn().mockImplementation((_id: string, _ownerId: string, input: { stage?: string }) => ({
      ...deal,
      ...(input.stage !== undefined ? { stage: input.stage } : {})
    })),
    delete: vi.fn(),
    reorder: vi.fn().mockResolvedValue([deal]),
    setTags: vi.fn().mockResolvedValue(deal),
    addItem: vi.fn().mockResolvedValue({ id: 'i1', description: 'Item', quantity: 2, unitPrice: 10 } as DealItemWithProduct),
    findItemByIdAndOwner: vi.fn().mockResolvedValue({ id: 'i1', dealId: 'd1', description: 'Item', quantity: 2, unitPrice: 10 } as DealItemWithProduct),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    sumItemTotals: vi.fn().mockResolvedValue(20),
    setValue: vi.fn(),
    addTemplateItems: vi.fn().mockResolvedValue(deal),
    findRenewalAlerts: vi.fn().mockResolvedValue([]),
    ...overrides
  };
}

const buildDeps = () => ({
  audit: { log: vi.fn().mockResolvedValue(undefined) },
  notifications: { dispatch: vi.fn().mockResolvedValue(undefined) },
  tags: { assertAllOwned: vi.fn().mockResolvedValue(undefined) },
  onboarding: { createForWonDeal: vi.fn().mockResolvedValue(undefined) }
});

describe('DealsService', () => {
  it('rejects a renewal date before the service starts', async () => {
    const repo = buildFakeRepo();
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    await expect(service.create('u1', {
      title: 'Retainer', value: 1000, engagementType: 'RETAINER',
      serviceStartDate: new Date('2026-10-10'), renewalDate: new Date('2026-10-01')
    })).rejects.toMatchObject({ code: 'INVALID_RENEWAL_DATE' });
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('assigns next position in stage on create', async () => {
    const repo = buildFakeRepo();
    const service = new DealsService(repo, buildDeps().audit, buildDeps().notifications, buildDeps().tags, buildDeps().onboarding);
    const created = await service.create('u1', { title: 'New deal', value: 1000, stage: 'NEW' });
    expect(created.position).toBe(5);
    expect(repo.maxPositionInStage).toHaveBeenCalledWith('u1', 'NEW');
  });

  it('defaults probability from the stage on create', async () => {
    const repo = buildFakeRepo();
    const service = new DealsService(repo, buildDeps().audit, buildDeps().notifications, buildDeps().tags, buildDeps().onboarding);
    const created = await service.create('u1', { title: 'Untyped', value: 0, stage: 'PROPOSAL' });
    expect(created.probability).toBe(50);
  });

  it('recalculates deal value from line items after add', async () => {
    const repo = buildFakeRepo();
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    const item = await service.addItem('u1', 'd1', { description: 'Item', quantity: 1, unitPrice: 10, kind: 'BASE' });
    expect(item.quantity).toBe(2);
    expect(repo.sumItemTotals).toHaveBeenCalledWith('d1', 'u1');
    expect(repo.setValue).toHaveBeenCalledWith('d1', 'u1', 20);
  });

  it('rejects quote items that reference a product outside the requester\'s workspace', async () => {
    const repo = buildFakeRepo({
      relationOwnedByOwner: vi.fn().mockImplementation((kind: string) => Promise.resolve(kind !== 'product'))
    });
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);

    await expect(
      service.addItem('u1', 'd1', { productId: 'foreign-product', description: 'Item', quantity: 1, unitPrice: 10, kind: 'BASE' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.addItem).not.toHaveBeenCalled();
  });

  it('rejects nested quote-item requests when the item belongs to another deal', async () => {
    const repo = buildFakeRepo({
      findItemByIdAndOwner: vi.fn().mockResolvedValue({
        id: 'i1',
        dealId: 'another-deal',
        description: 'Item',
        quantity: 2,
        unitPrice: 10
      } as DealItemWithProduct)
    });
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);

    await expect(service.deleteItem('u1', 'd1', 'i1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.deleteItem).not.toHaveBeenCalled();
  });

  it('notifies and audits on stage change to WON', async () => {
    const repo = buildFakeRepo();
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    const updated = await service.update('u1', 'd1', { stage: 'WON' });
    expect(updated.stage).toBe('WON');
    expect(deps.notifications.dispatch).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ type: 'DEAL_WON', dedupeKey: 'deal-won:d1' })
    );
    expect(deps.audit.log).toHaveBeenCalledWith('u1', 'STAGE_CHANGE', 'DEAL', 'd1', 'Lead → Won');
    expect(deps.onboarding.createForWonDeal).toHaveBeenCalledWith('u1', 'd1', undefined);
  });

  it('does not notify when stage stays the same', async () => {
    const repo = buildFakeRepo();
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    await service.update('u1', 'd1', { title: 'Renamed' });
    expect(deps.notifications.dispatch).not.toHaveBeenCalled();
    expect(deps.onboarding.createForWonDeal).not.toHaveBeenCalled();
    expect(deps.audit.log).not.toHaveBeenCalledWith('u1', 'STAGE_CHANGE', 'DEAL', 'd1', expect.anything());
  });

  it('restores deduped won side effects when a won deal is updated again', async () => {
    const won = { id: 'd1', ownerId: 'u1', stage: 'WON', title: 'Won deal' } as DealWithRelations;
    const repo = buildFakeRepo({ findByIdAndOwner: vi.fn().mockResolvedValue(won) });
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    await service.update('u1', 'd1', { stage: 'WON', value: 1200 });
    expect(deps.onboarding.createForWonDeal).toHaveBeenCalledOnce();
    expect(deps.notifications.dispatch).toHaveBeenCalledWith('u1', expect.objectContaining({ dedupeKey: 'deal-won:d1' }));
  });

  it('preserves the original close date when an already won deal is edited', async () => {
    const closedAt = new Date('2026-08-20T10:00:00.000Z');
    const won = { id: 'd1', ownerId: 'u1', stage: 'WON', title: 'Won deal', closedAt } as DealWithRelations;
    const repo = buildFakeRepo({ findByIdAndOwner: vi.fn().mockResolvedValue(won) });
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    await service.update('u1', 'd1', { stage: 'WON', title: 'Renamed' });
    expect(repo.update).toHaveBeenCalledWith('d1', 'u1', expect.not.objectContaining({ stage: 'WON' }));
  });

  it('clears a lost reason when a deal moves to won', async () => {
    const lost = { id: 'd1', ownerId: 'u1', stage: 'LOST', title: 'Lost deal', lostReason: 'Budget' } as DealWithRelations;
    const repo = buildFakeRepo({ findByIdAndOwner: vi.fn().mockResolvedValue(lost) });
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    await service.update('u1', 'd1', { stage: 'WON' });
    expect(repo.update).toHaveBeenCalledWith('d1', 'u1', expect.objectContaining({ lostReason: null }));
  });

  it('rejects reorder when a deal is not owned by the requester', async () => {
    const repo = buildFakeRepo({ findByIdAndOwner: vi.fn().mockResolvedValue(null) });
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    const input: ReorderDealsInput = { updates: [{ id: 'd1', stage: 'WON', position: 0 }] };
    await expect(service.reorder('u1', input)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.reorder).not.toHaveBeenCalled();
  });

  it('applies stage rules, audit events, and won notifications during drag-and-drop moves', async () => {
    const repo = buildFakeRepo();
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);

    await service.reorder('u1', { updates: [{ id: 'd1', stage: 'WON', position: 0 }] });

    expect(repo.reorder).toHaveBeenCalledWith(
      'u1',
      [expect.objectContaining({ id: 'd1', stage: 'WON', position: 0, probability: 100 })]
    );
    expect(deps.audit.log).toHaveBeenCalledWith('u1', 'STAGE_CHANGE', 'DEAL', 'd1', 'Lead → Won');
    expect(deps.notifications.dispatch).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ type: 'DEAL_WON', dedupeKey: 'deal-won:d1' })
    );
    expect(deps.onboarding.createForWonDeal).toHaveBeenCalledWith('u1', 'd1', undefined);
  });

  it('verifies tag ownership before replacing tags', async () => {
    const repo = buildFakeRepo();
    const deps = buildDeps();
    const service = new DealsService(repo, deps.audit, deps.notifications, deps.tags, deps.onboarding);
    await service.setTags('u1', 'd1', { tagIds: ['t1', 't2'] });
    expect(deps.tags.assertAllOwned).toHaveBeenCalledWith(['t1', 't2'], 'u1');
    expect(repo.setTags).toHaveBeenCalledWith('d1', 'u1', ['t1', 't2']);
  });
});
