import { createHash, randomBytes } from 'node:crypto';
import { AppError } from '../../common/utils/app-error';
import type { AuditLogger } from '../../common/utils/audit-logger';
import type { IProposalsRepository, ProposalRecord } from './proposals.repository';
import { proposalSnapshotSchema, type CreateProposalInput, type ProposalSnapshot, type RespondProposalInput } from './proposals.schemas';

export interface ProposalDealSource {
  findDetailByIdAndOwner(id: string, ownerId: string): Promise<{
    id: string;
    title: string;
    currency: string;
    engagementType: 'PROJECT' | 'RETAINER';
    oneTimeValue: number;
    monthlyRecurringValue: number;
    serviceStartDate: Date | null;
    renewalDate: Date | null;
    items: { id: string; description: string; quantity: number; unitPrice: number; kind: 'BASE' | 'PACKAGE' | 'ADD_ON' }[];
  } | null>;
}

export interface ProposalAcceptanceHandler {
  markWon(ownerId: string, dealId: string, selectedTotal: number): Promise<void>;
}

export interface PublicProposal {
  id: string;
  status: ProposalRecord['status'];
  expiresAt: Date;
  snapshot: ProposalSnapshot;
  selectedPackageId: string | null;
  selectedAddonIds: string[];
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export class ProposalsService {
  constructor(
    private readonly repo: IProposalsRepository,
    private readonly deals: ProposalDealSource,
    private readonly acceptance: ProposalAcceptanceHandler,
    private readonly audit: AuditLogger
  ) {}

  async create(ownerId: string, input: CreateProposalInput): Promise<{ proposal: ProposalRecord; shareToken: string }> {
    const deal = await this.deals.findDetailByIdAndOwner(input.dealId, ownerId);
    if (!deal) throw AppError.notFound('Deal');
    if (deal.items.length === 0) throw new AppError(422, 'EMPTY_PROPOSAL', 'Add quote items before creating a proposal');
    const snapshot: ProposalSnapshot = {
      title: deal.title,
      currency: deal.currency,
      engagementType: deal.engagementType,
      oneTimeValue: deal.oneTimeValue,
      monthlyRecurringValue: deal.monthlyRecurringValue,
      serviceStartDate: deal.serviceStartDate?.toISOString() ?? null,
      renewalDate: deal.renewalDate?.toISOString() ?? null,
      items: deal.items.map((item) => ({
        id: item.id, description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, kind: item.kind
      }))
    };
    const shareToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);
    const proposal = await this.repo.create(ownerId, deal.id, hashToken(shareToken), snapshot, expiresAt);
    await this.audit.log(ownerId, 'CREATE', 'PROPOSAL', proposal.id, `Created proposal for "${deal.title}"`);
    return { proposal, shareToken };
  }

  async list(ownerId: string, dealId: string): Promise<ProposalRecord[]> {
    const deal = await this.deals.findDetailByIdAndOwner(dealId, ownerId);
    if (!deal) throw AppError.notFound('Deal');
    return this.repo.list(ownerId, dealId);
  }

  async getPublic(token: string): Promise<PublicProposal> {
    const tokenHash = hashToken(token);
    const proposal = await this.repo.findByTokenHash(tokenHash);
    if (!proposal) throw AppError.notFound('Proposal');
    if (proposal.expiresAt <= new Date()) throw new AppError(410, 'PROPOSAL_EXPIRED', 'This proposal link has expired');
    const firstView = await this.repo.markViewed(tokenHash, new Date());
    if (firstView) await this.audit.log(proposal.ownerId, 'UPDATE', 'PROPOSAL', proposal.id, 'Client viewed proposal');
    const current = await this.repo.findByTokenHash(tokenHash);
    if (!current) throw AppError.notFound('Proposal');
    if (current.expiresAt <= new Date()) throw new AppError(410, 'PROPOSAL_EXPIRED', 'This proposal link has expired');
    return this.toPublic(current);
  }

  async respond(token: string, input: RespondProposalInput): Promise<PublicProposal> {
    const tokenHash = hashToken(token);
    const proposal = await this.repo.findByTokenHash(tokenHash);
    if (!proposal) throw AppError.notFound('Proposal');
    const now = new Date();
    if (proposal.expiresAt <= now) throw new AppError(410, 'PROPOSAL_EXPIRED', 'This proposal link has expired');
    const snapshot = proposalSnapshotSchema.parse(proposal.snapshot);
    const packageId = input.decision === 'ACCEPTED' ? input.selectedPackageId ?? null : null;
    const addonIds = input.decision === 'ACCEPTED' ? input.selectedAddonIds : [];
    if (input.decision === 'ACCEPTED') {
      const packages = snapshot.items.filter((item) => item.kind === 'PACKAGE');
      if (packages.length > 0 && !packages.some((item) => item.id === packageId)) {
        throw new AppError(422, 'INVALID_PACKAGE', 'Choose one package from this proposal');
      }
      if (packages.length === 0 && packageId !== null) throw new AppError(422, 'INVALID_PACKAGE', 'This proposal has no package choices');
      const addons = new Set(snapshot.items.filter((item) => item.kind === 'ADD_ON').map((item) => item.id));
      if (new Set(addonIds).size !== addonIds.length || addonIds.some((id) => !addons.has(id))) {
        throw new AppError(422, 'INVALID_ADD_ON', 'Choose add-ons from this proposal');
      }
    }
    if (proposal.status === 'ACCEPTED' && input.decision === 'ACCEPTED' && proposal.selectedPackageId === packageId &&
      JSON.stringify(proposal.selectedAddonIds) === JSON.stringify(addonIds)) {
      await this.acceptance.markWon(proposal.ownerId, proposal.dealId, this.selectedTotal(snapshot, packageId, addonIds));
      return this.toPublic(proposal);
    }
    if (proposal.status === 'ACCEPTED' || proposal.status === 'DECLINED') {
      throw new AppError(409, 'PROPOSAL_DECIDED', 'This proposal has already been answered');
    }
    const changed = await this.repo.respond(tokenHash, now, input.decision, packageId, addonIds);
    if (!changed) throw new AppError(409, 'PROPOSAL_DECIDED', 'This proposal has already been answered');
    const updated = await this.repo.findByTokenHash(tokenHash);
    if (!updated) throw AppError.notFound('Proposal');
    await this.audit.log(updated.ownerId, 'UPDATE', 'PROPOSAL', updated.id, `Client ${input.decision.toLowerCase()} proposal`);
    if (input.decision === 'ACCEPTED') await this.acceptance.markWon(updated.ownerId, updated.dealId, this.selectedTotal(snapshot, packageId, addonIds));
    return this.toPublic(updated);
  }

  private toPublic(proposal: ProposalRecord): PublicProposal {
    return {
      id: proposal.id,
      status: proposal.status,
      expiresAt: proposal.expiresAt,
      snapshot: proposalSnapshotSchema.parse(proposal.snapshot),
      selectedPackageId: proposal.selectedPackageId,
      selectedAddonIds: proposal.selectedAddonIds
    };
  }

  private selectedTotal(snapshot: ProposalSnapshot, packageId: string | null, addonIds: string[]): number {
    return snapshot.items
      .filter((item) => item.kind === 'BASE' || (item.kind === 'PACKAGE' && item.id === packageId) || (item.kind === 'ADD_ON' && addonIds.includes(item.id)))
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }
}
