import type { Prisma, Proposal } from '@prisma/client';
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
  respond(tokenHash: string, now: Date, decision: 'ACCEPTED' | 'DECLINED', packageId: string | null, addonIds: string[]): Promise<boolean>;
  resetFailedAcceptance(tokenHash: string, respondedAt: Date, priorStatus: 'CREATED' | 'VIEWED'): Promise<void>;
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

  async respond(tokenHash: string, now: Date, decision: 'ACCEPTED' | 'DECLINED', packageId: string | null, addonIds: string[]): Promise<boolean> {
    const result = await this.prisma.proposal.updateMany({
      where: { tokenHash, expiresAt: { gt: now }, status: { in: ['CREATED', 'VIEWED'] } },
      data: { status: decision, respondedAt: now, selectedPackageId: packageId, selectedAddonIds: addonIds }
    });
    return result.count === 1;
  }

  async resetFailedAcceptance(tokenHash: string, respondedAt: Date, priorStatus: 'CREATED' | 'VIEWED'): Promise<void> {
    await this.prisma.proposal.updateMany({
      where: { tokenHash, status: 'ACCEPTED', respondedAt },
      data: { status: priorStatus, respondedAt: null, selectedPackageId: null, selectedAddonIds: [] }
    });
  }
}
