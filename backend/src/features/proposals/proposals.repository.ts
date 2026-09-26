import type { Prisma, Proposal } from '@prisma/client';
import { AppError } from '../../common/utils/app-error';
import type { PrismaService } from '../../database/prisma';
import type { ProposalSnapshot } from './proposals.schemas';

export type ProposalRecord = Omit<Proposal, 'tokenHash'>;

const proposalPublicSelect = {
  id: true, ownerId: true, dealId: true, status: true, snapshot: true,
  expiresAt: true, viewedAt: true, respondedAt: true,
  selectedPackageId: true, selectedAddonIds: true, createdAt: true, updatedAt: true
} as const;

export interface IProposalsRepository {
  create(ownerId: string, dealId: string, tokenHash: string, snapshot: ProposalSnapshot, expiresAt: Date): Promise<ProposalRecord>;
  list(ownerId: string, dealId: string): Promise<ProposalRecord[]>;
  findByTokenHash(tokenHash: string): Promise<ProposalRecord | null>;
  markViewed(tokenHash: string, now: Date): Promise<boolean>;
  decline(tokenHash: string, now: Date): Promise<boolean>;
  accept(tokenHash: string, ownerId: string, dealId: string, now: Date, packageId: string | null, addonIds: string[], selectedTotal: number): Promise<boolean>;
}

export class ProposalsRepository implements IProposalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dealId: string, tokenHash: string, snapshot: ProposalSnapshot, expiresAt: Date): Promise<ProposalRecord> {
    return this.prisma.proposal.create({
      data: { ownerId, dealId, tokenHash, snapshot: snapshot as Prisma.InputJsonValue, expiresAt },
      select: proposalPublicSelect
    });
  }

  list(ownerId: string, dealId: string): Promise<ProposalRecord[]> {
    return this.prisma.proposal.findMany({
      where: { ownerId, dealId },
      select: proposalPublicSelect,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  findByTokenHash(tokenHash: string): Promise<ProposalRecord | null> {
    return this.prisma.proposal.findUnique({ where: { tokenHash }, select: proposalPublicSelect });
  }

  async markViewed(tokenHash: string, now: Date): Promise<boolean> {
    const result = await this.prisma.proposal.updateMany({
      where: { tokenHash, expiresAt: { gt: now }, status: 'CREATED' },
      data: { status: 'VIEWED', viewedAt: now }
    });
    return result.count === 1;
  }

  async decline(tokenHash: string, now: Date): Promise<boolean> {
    const result = await this.prisma.proposal.updateMany({
      where: { tokenHash, expiresAt: { gt: now }, status: { in: ['CREATED', 'VIEWED'] } },
      data: { status: 'DECLINED', respondedAt: now, selectedPackageId: null, selectedAddonIds: [] }
    });
    return result.count === 1;
  }

  accept(tokenHash: string, ownerId: string, dealId: string, now: Date, packageId: string | null, addonIds: string[], selectedTotal: number): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findFirst({ where: { id: dealId, ownerId }, select: { stage: true } });
      if (!deal || deal.stage === 'WON' || deal.stage === 'LOST') return false;
      const won = await tx.deal.updateMany({
        where: { id: dealId, ownerId, stage: { in: ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] } },
        data: { stage: 'WON', value: selectedTotal, probability: 100, closedAt: now, lostReason: null }
      });
      if (won.count !== 1) return false;
      const response = await tx.proposal.updateMany({
        where: { tokenHash, ownerId, dealId, expiresAt: { gt: now }, status: { in: ['CREATED', 'VIEWED'] } },
        data: { status: 'ACCEPTED', respondedAt: now, selectedPackageId: packageId, selectedAddonIds: addonIds }
      });
      if (response.count !== 1) throw new AppError(409, 'PROPOSAL_DECIDED', 'This proposal has already been answered');
      const proposal = await tx.proposal.findUnique({ where: { tokenHash }, select: { id: true } });
      if (!proposal) throw new Error('Proposal disappeared during acceptance');
      await tx.auditLog.createMany({ data: [
        { userId: ownerId, action: 'STAGE_CHANGE', entityType: 'DEAL', entityId: dealId, summary: `${deal.stage} → WON (client accepted proposal)` },
        { userId: ownerId, action: 'UPDATE', entityType: 'PROPOSAL', entityId: proposal.id, summary: 'Client accepted proposal' }
      ] });
      return true;
    });
  }
}
