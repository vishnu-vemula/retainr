import { describe, expect, it, vi } from 'vitest';
import type { ProposalRecord } from './proposals.repository';
import type { ProposalSnapshot } from './proposals.schemas';
import { ProposalsService } from './proposals.service';

const snapshot: ProposalSnapshot = {
  title: 'Ads management', currency: 'USD', engagementType: 'RETAINER',
  oneTimeValue: 500, monthlyRecurringValue: 1800, serviceStartDate: null, renewalDate: null,
  items: [
    { id: 'base', description: 'Setup', quantity: 1, unitPrice: 500, kind: 'BASE' },
    { id: 'package-a', description: 'Growth', quantity: 1, unitPrice: 1800, kind: 'PACKAGE' },
    { id: 'package-b', description: 'Scale', quantity: 1, unitPrice: 2500, kind: 'PACKAGE' },
    { id: 'addon', description: 'Creative', quantity: 1, unitPrice: 400, kind: 'ADD_ON' }
  ]
};

function buildFixture() {
  let record = {
    id: 'p1', ownerId: 'u1', dealId: 'd1', status: 'CREATED', snapshot,
    expiresAt: new Date(Date.now() + 7 * 86_400_000), selectedPackageId: null, selectedAddonIds: [],
    viewedAt: null, respondedAt: null, createdAt: new Date(), updatedAt: new Date()
  } as ProposalRecord;
  const repo = {
    create: vi.fn().mockImplementation(async (_ownerId: string, _dealId: string, _hash: string, savedSnapshot: ProposalSnapshot) => {
      record = { ...record, snapshot: savedSnapshot };
      return record;
    }),
    list: vi.fn().mockResolvedValue([record]),
    findByTokenHash: vi.fn().mockImplementation(async () => record),
    markViewed: vi.fn().mockResolvedValue(true),
    decline: vi.fn().mockImplementation(async () => {
      record = { ...record, status: 'DECLINED', selectedPackageId: null, selectedAddonIds: [] };
      return true;
    }),
    accept: vi.fn().mockImplementation(async (_hash: string, _ownerId: string, _dealId: string, _now: Date, selectedPackageId: string | null, selectedAddonIds: string[]) => {
      record = { ...record, status: 'ACCEPTED', selectedPackageId, selectedAddonIds };
      return true;
    })
  };
  const deals = { findDetailByIdAndOwner: vi.fn().mockResolvedValue({
    id: 'd1', title: snapshot.title, stage: 'PROPOSAL' as const, currency: snapshot.currency, engagementType: snapshot.engagementType,
    oneTimeValue: snapshot.oneTimeValue, monthlyRecurringValue: snapshot.monthlyRecurringValue,
    serviceStartDate: null, renewalDate: null, items: snapshot.items
  }) };
  const acceptance = { syncWon: vi.fn().mockResolvedValue(undefined) };
  const audit = { log: vi.fn().mockResolvedValue(undefined) };
  const service = new ProposalsService(repo, deals, acceptance, audit);
  return { service, repo, deals, acceptance, audit, setRecord: (patch: Partial<ProposalRecord>) => { record = { ...record, ...patch }; } };
}

describe('ProposalsService', () => {
  it('creates an immutable snapshot and stores only a token hash', async () => {
    const { service, repo, deals } = buildFixture();
    const result = await service.create('u1', { dealId: 'd1', expiresInDays: 14 });
    expect(deals.findDetailByIdAndOwner).toHaveBeenCalledWith('d1', 'u1');
    expect(result.shareToken.length).toBeGreaterThan(30);
    expect(repo.create).toHaveBeenCalledWith('u1', 'd1', expect.stringMatching(/^[a-f0-9]{64}$/), snapshot, expect.any(Date));
    expect(vi.mocked(repo.create).mock.calls[0]?.[2]).not.toBe(result.shareToken);
  });

  it('rejects a proposal for a deal outside the owner boundary', async () => {
    const { service, repo, deals } = buildFixture();
    deals.findDetailByIdAndOwner.mockResolvedValue(null);
    await expect(service.create('u1', { dealId: 'foreign', expiresInDays: 14 })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('does not create an unusable proposal for a closed deal', async () => {
    const { service, repo, deals } = buildFixture();
    deals.findDetailByIdAndOwner.mockResolvedValue({ ...(await deals.findDetailByIdAndOwner()), stage: 'WON' });
    await expect(service.create('u1', { dealId: 'd1', expiresInDays: 14 })).rejects.toMatchObject({ code: 'DEAL_CLOSED' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('requires an offered package and validates add-on IDs', async () => {
    const { service, repo } = buildFixture();
    await expect(service.respond('token', { decision: 'ACCEPTED', selectedPackageId: null, selectedAddonIds: [] })).rejects.toMatchObject({ code: 'INVALID_PACKAGE' });
    await expect(service.respond('token', { decision: 'ACCEPTED', selectedPackageId: 'package-a', selectedAddonIds: ['foreign'] })).rejects.toMatchObject({ code: 'INVALID_ADD_ON' });
    expect(repo.accept).not.toHaveBeenCalled();
  });

  it('rejects a selected quote total above the deal value limit', async () => {
    const { service, repo, setRecord } = buildFixture();
    setRecord({ snapshot: { ...snapshot, items: [{ id: 'base', description: 'Large scope', quantity: 2, unitPrice: 1_000_000_000, kind: 'BASE' }] } });
    await expect(service.respond('token', { decision: 'ACCEPTED', selectedPackageId: null, selectedAddonIds: [] }))
      .rejects.toMatchObject({ code: 'QUOTE_TOTAL_OUT_OF_RANGE' });
    expect(repo.accept).not.toHaveBeenCalled();
  });

  it('records a client choice and wins the deal at the selected total', async () => {
    const { service, acceptance, repo } = buildFixture();
    const result = await service.respond('token', { decision: 'ACCEPTED', selectedPackageId: 'package-b', selectedAddonIds: ['addon'] });
    expect(result.status).toBe('ACCEPTED');
    expect(repo.accept).toHaveBeenCalledWith(expect.any(String), 'u1', 'd1', expect.any(Date), 'package-b', ['addon'], 3400);
    expect(acceptance.syncWon).toHaveBeenCalledWith('u1', 'd1');
  });

  it('retries idempotent won side effects when an accepted response is replayed', async () => {
    const { service, acceptance, setRecord } = buildFixture();
    setRecord({ status: 'ACCEPTED', selectedPackageId: 'package-a', selectedAddonIds: [] });
    await service.respond('token', { decision: 'ACCEPTED', selectedPackageId: 'package-a', selectedAddonIds: [] });
    expect(acceptance.syncWon).toHaveBeenCalledWith('u1', 'd1');
  });

  it('keeps an atomic acceptance when a derived side effect fails and repairs it on retry', async () => {
    const { service, acceptance, repo } = buildFixture();
    acceptance.syncWon.mockRejectedValueOnce(new Error('Notification failed'));
    await expect(service.respond('token', { decision: 'ACCEPTED', selectedPackageId: 'package-a', selectedAddonIds: [] }))
      .rejects.toThrow('Notification failed');
    await expect(service.respond('token', { decision: 'ACCEPTED', selectedPackageId: 'package-a', selectedAddonIds: [] }))
      .resolves.toMatchObject({ status: 'ACCEPTED' });
    expect(repo.accept).toHaveBeenCalledOnce();
    expect(acceptance.syncWon).toHaveBeenCalledTimes(2);
  });

  it('does not allow an expired proposal to be viewed or answered', async () => {
    const { service, repo, setRecord } = buildFixture();
    setRecord({ expiresAt: new Date(Date.now() - 1000) });
    await expect(service.getPublic('token')).rejects.toMatchObject({ code: 'PROPOSAL_EXPIRED' });
    await expect(service.respond('token', { decision: 'DECLINED' })).rejects.toMatchObject({ code: 'PROPOSAL_EXPIRED' });
    expect(repo.decline).not.toHaveBeenCalled();
  });

  it('audits the first view without exposing the owner record', async () => {
    const { service, audit, repo } = buildFixture();
    const result = await service.getPublic('token');
    expect(result).toEqual(expect.objectContaining({ id: 'p1', snapshot }));
    expect(result).not.toHaveProperty('ownerId');
    expect(repo.markViewed).toHaveBeenCalledOnce();
    expect(audit.log).toHaveBeenCalledWith('u1', 'UPDATE', 'PROPOSAL', 'p1', 'Client viewed proposal');
  });
});
