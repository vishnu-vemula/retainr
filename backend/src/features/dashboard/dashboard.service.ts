import type { ContactStatus, DealStage } from '@prisma/client';
import type { PrismaService } from '../../database/prisma';

const OPEN_STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'];
const CONTACT_STATUSES: ContactStatus[] = ['LEAD', 'QUALIFIED', 'CUSTOMER', 'CHURNED'];
const DEAL_STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const REVENUE_MONTHS = 6;

function countOf(count: boolean | { _all?: number } | undefined): number {
  return typeof count === 'object' ? count._all ?? 0 : 0;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function lastMonthKeys(count: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    keys.push(monthKey(date));
  }
  return keys;
}

export interface DashboardStats {
  contacts: { total: number; byStatus: Record<ContactStatus, number> };
  deals: { total: number; byStage: Record<DealStage, number>; pipelineValue: number; wonValue: number; avgDealSize: number };
  revenueByMonth: { month: string; total: number }[];
  topCompanies: { companyId: string | null; name: string; pipelineValue: number; dealCount: number }[];
  tasks: { total: number; open: number; overdue: number };
  renewals: {
    items: {
      id: string; title: string; companyName: string | null; currency: string;
      monthlyRecurringValue: number; renewalDate: Date | null; daysUntilRenewal: number | null;
      renewalHealth: 'HEALTHY' | 'AT_RISK' | 'UNKNOWN'; accountHealth: 'RED' | 'YELLOW' | 'GREEN';
      daysSinceActivity: number;
    }[];
    within30: number; within60: number; within90: number; missed: number; atRisk: number;
    stale14to30: number; stale30plus: number;
    overdueOnboarding: { id: string; title: string; dealId: string | null; dueDate: Date | null }[];
    overdueOnboardingCount: number;
    byCurrency: { currency: string; monthlyRecurringRevenue: number; forecast90: number }[];
  };
  operations: { averageLeadToAcceptedDays: number | null; averageOnboardingDays: number | null; activeThisWeek: boolean };
}

export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(ownerId: string): Promise<DashboardStats> {
    const revenueStart = new Date();
    revenueStart.setUTCDate(1);
    revenueStart.setUTCMonth(revenueStart.getUTCMonth() - (REVENUE_MONTHS - 1));

    const [contactTotal, contactGroups, dealTotal, dealGroups, pipelineAgg, wonAgg, wonDeals, companyGroups, taskTotal, taskOpen, taskOverdue] =
      await this.prisma.$transaction([
        this.prisma.contact.count({ where: { ownerId } }),
        this.prisma.contact.groupBy({
          by: ['status'],
          _count: { _all: true },
          where: { ownerId },
          orderBy: { status: 'asc' }
        }),
        this.prisma.deal.count({ where: { ownerId } }),
        this.prisma.deal.groupBy({
          by: ['stage'],
          _count: { _all: true },
          where: { ownerId },
          orderBy: { stage: 'asc' }
        }),
        this.prisma.deal.aggregate({ _sum: { value: true }, where: { ownerId, stage: { in: OPEN_STAGES } } }),
        this.prisma.deal.aggregate({ _sum: { value: true }, where: { ownerId, stage: 'WON' } }),
        this.prisma.deal.findMany({
          where: { ownerId, stage: 'WON', closedAt: { gte: revenueStart } },
          select: { closedAt: true, value: true }
        }),
        this.prisma.deal.groupBy({
          by: ['companyId'],
          _count: { _all: true },
          _sum: { value: true },
          where: { ownerId, stage: { in: OPEN_STAGES }, companyId: { not: null } },
          orderBy: { companyId: 'asc' }
        }),
        this.prisma.task.count({ where: { ownerId } }),
        this.prisma.task.count({ where: { ownerId, status: { not: 'DONE' } } }),
        this.prisma.task.count({
          where: { ownerId, status: { not: 'DONE' }, dueDate: { lt: new Date() } }
        })
      ]);

    const byStatus = Object.fromEntries(CONTACT_STATUSES.map((status) => [status, 0])) as Record<ContactStatus, number>;
    for (const group of contactGroups) {
      byStatus[group.status] = countOf(group._count);
    }

    const byStage = Object.fromEntries(DEAL_STAGES.map((stage) => [stage, 0])) as Record<DealStage, number>;
    for (const group of dealGroups) {
      byStage[group.stage] = countOf(group._count);
    }

    const wonValue = wonAgg._sum.value ?? 0;
    const wonCount = byStage.WON;

    const revenueMap = new Map<string, number>(lastMonthKeys(REVENUE_MONTHS).map((month) => [month, 0]));
    for (const deal of wonDeals) {
      if (!deal.closedAt) continue;
      const key = monthKey(deal.closedAt);
      if (revenueMap.has(key)) {
        revenueMap.set(key, (revenueMap.get(key) ?? 0) + deal.value);
      }
    }
    const revenueByMonth = [...revenueMap.entries()].map(([month, total]) => ({ month, total }));

    const topGroups = [...companyGroups]
      .sort((a, b) => (b._sum?.value ?? 0) - (a._sum?.value ?? 0))
      .slice(0, 5);
    const companyIds = topGroups.map((group) => group.companyId).filter((id): id is string => id !== null);
    const companies = await this.prisma.company.findMany({
      where: { id: { in: companyIds }, ownerId },
      select: { id: true, name: true }
    });
    const companyName = new Map(companies.map((company) => [company.id, company.name]));
    const topCompanies = topGroups.map((group) => ({
      companyId: group.companyId,
      name: group.companyId ? companyName.get(group.companyId) ?? 'Unknown' : 'Unassigned',
      pipelineValue: group._sum?.value ?? 0,
      dealCount: countOf(group._count)
    }));

    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [retainers, overdueOnboarding, overdueOnboardingCount, onboardingTasks, acceptedProposals, recentAudit] = await Promise.all([
      this.prisma.deal.findMany({
        where: { ownerId, stage: 'WON', engagementType: 'RETAINER' },
        select: {
          id: true, title: true, currency: true, monthlyRecurringValue: true, renewalDate: true,
          renewalHealth: true, renewalProbability: true, companyId: true, contactId: true,
          closedAt: true, serviceStartDate: true, createdAt: true,
          company: { select: { name: true } }
        }
      }),
      this.prisma.task.findMany({
        where: { ownerId, onboardingKey: { not: null }, status: { not: 'DONE' }, dueDate: { lt: now } },
        select: { id: true, title: true, dealId: true, dueDate: true },
        orderBy: { dueDate: 'asc' }, take: 20
      }),
      this.prisma.task.count({ where: { ownerId, onboardingKey: { not: null }, status: { not: 'DONE' }, dueDate: { lt: now } } }),
      this.prisma.task.findMany({
        where: { ownerId, onboardingKey: { not: null }, deal: { stage: 'WON' } },
        select: { dealId: true, status: true, completedAt: true, deal: { select: { closedAt: true } } }
      }),
      this.prisma.proposal.findMany({
        where: { ownerId, status: 'ACCEPTED', respondedAt: { not: null } },
        select: { respondedAt: true, deal: { select: { createdAt: true } } }
      }),
      this.prisma.auditLog.count({ where: { userId: ownerId, createdAt: { gte: weekStart } } })
    ]);

    const dealIds = retainers.map((deal) => deal.id);
    const companyIdsForActivity = retainers.map((deal) => deal.companyId).filter((id): id is string => id !== null);
    const contactIdsForActivity = retainers.map((deal) => deal.contactId).filter((id): id is string => id !== null);
    const [dealActivity, companyActivity, contactActivity] = await Promise.all([
      this.prisma.activity.groupBy({ by: ['dealId'], _max: { occurredAt: true }, where: { ownerId, dealId: { in: dealIds } } }),
      this.prisma.activity.groupBy({ by: ['companyId'], _max: { occurredAt: true }, where: { ownerId, companyId: { in: companyIdsForActivity } } }),
      this.prisma.activity.groupBy({ by: ['contactId'], _max: { occurredAt: true }, where: { ownerId, contactId: { in: contactIdsForActivity } } })
    ]);
    const latestDeal = new Map(dealActivity.map((row) => [row.dealId, row._max.occurredAt]));
    const latestCompany = new Map(companyActivity.map((row) => [row.companyId, row._max.occurredAt]));
    const latestContact = new Map(contactActivity.map((row) => [row.contactId, row._max.occurredAt]));
    const overdueDealIds = new Set(onboardingTasks.filter((task) => task.status !== 'DONE' && task.dealId).map((task) => task.dealId));
    const renewalItems = retainers.map((deal) => {
      const last = Math.max(
        deal.createdAt.getTime(), deal.closedAt?.getTime() ?? 0, deal.serviceStartDate?.getTime() ?? 0,
        latestDeal.get(deal.id)?.getTime() ?? 0,
        latestCompany.get(deal.companyId)?.getTime() ?? 0,
        latestContact.get(deal.contactId)?.getTime() ?? 0
      );
      const daysSinceActivity = Math.max(0, Math.floor((now.getTime() - last) / 86_400_000));
      const daysUntilRenewal = deal.renewalDate ? Math.ceil((deal.renewalDate.getTime() - now.getTime()) / 86_400_000) : null;
      const accountHealth = deal.renewalHealth === 'AT_RISK' || (daysUntilRenewal !== null && daysUntilRenewal < 0) || daysSinceActivity >= 30 || overdueDealIds.has(deal.id)
        ? 'RED' as const
        : deal.renewalHealth === 'UNKNOWN' || daysSinceActivity >= 14 || (daysUntilRenewal !== null && daysUntilRenewal <= 30)
          ? 'YELLOW' as const : 'GREEN' as const;
      return { ...deal, companyName: deal.company?.name ?? null, daysUntilRenewal, daysSinceActivity, accountHealth };
    });
    const currencyTotals = new Map<string, { monthlyRecurringRevenue: number; forecast90: number }>();
    for (const deal of renewalItems) {
      const totals = currencyTotals.get(deal.currency) ?? { monthlyRecurringRevenue: 0, forecast90: 0 };
      totals.monthlyRecurringRevenue += deal.monthlyRecurringValue;
      if (deal.daysUntilRenewal !== null && deal.daysUntilRenewal >= 0 && deal.daysUntilRenewal <= 90) {
        const probability = deal.renewalProbability ?? (deal.renewalHealth === 'HEALTHY' ? 80 : deal.renewalHealth === 'AT_RISK' ? 40 : 50);
        totals.forecast90 += deal.monthlyRecurringValue * probability / 100;
      }
      currencyTotals.set(deal.currency, totals);
    }
    const onboardingByDeal = new Map<string, typeof onboardingTasks>();
    for (const task of onboardingTasks) {
      if (!task.dealId) continue;
      const list = onboardingByDeal.get(task.dealId) ?? [];
      list.push(task);
      onboardingByDeal.set(task.dealId, list);
    }
    const onboardingDurations = [...onboardingByDeal.values()].filter((tasks) => tasks.every((task) => task.status === 'DONE' && task.completedAt) && tasks[0]?.deal?.closedAt)
      .map((tasks) => (Math.max(...tasks.map((task) => task.completedAt?.getTime() ?? 0)) - (tasks[0]?.deal?.closedAt?.getTime() ?? 0)) / 86_400_000);
    const proposalDurations = acceptedProposals.filter((proposal) => proposal.respondedAt)
      .map((proposal) => ((proposal.respondedAt?.getTime() ?? 0) - proposal.deal.createdAt.getTime()) / 86_400_000);

    return {
      contacts: { total: contactTotal, byStatus },
      deals: {
        total: dealTotal,
        byStage,
        pipelineValue: pipelineAgg._sum.value ?? 0,
        wonValue,
        avgDealSize: wonCount > 0 ? wonValue / wonCount : 0
      },
      revenueByMonth,
      topCompanies,
      tasks: { total: taskTotal, open: taskOpen, overdue: taskOverdue },
      renewals: {
        items: renewalItems.map((deal) => ({
          id: deal.id, title: deal.title, companyName: deal.companyName, currency: deal.currency,
          monthlyRecurringValue: deal.monthlyRecurringValue, renewalDate: deal.renewalDate,
          daysUntilRenewal: deal.daysUntilRenewal, renewalHealth: deal.renewalHealth,
          accountHealth: deal.accountHealth, daysSinceActivity: deal.daysSinceActivity
        }))
          .sort((a, b) => (a.daysUntilRenewal ?? Number.MAX_SAFE_INTEGER) - (b.daysUntilRenewal ?? Number.MAX_SAFE_INTEGER)),
        within30: renewalItems.filter((deal) => deal.daysUntilRenewal !== null && deal.daysUntilRenewal >= 0 && deal.daysUntilRenewal <= 30).length,
        within60: renewalItems.filter((deal) => deal.daysUntilRenewal !== null && deal.daysUntilRenewal >= 0 && deal.daysUntilRenewal <= 60).length,
        within90: renewalItems.filter((deal) => deal.daysUntilRenewal !== null && deal.daysUntilRenewal >= 0 && deal.daysUntilRenewal <= 90).length,
        missed: renewalItems.filter((deal) => deal.daysUntilRenewal !== null && deal.daysUntilRenewal < 0).length,
        atRisk: renewalItems.filter((deal) => deal.renewalHealth === 'AT_RISK').length,
        stale14to30: renewalItems.filter((deal) => deal.daysSinceActivity >= 14 && deal.daysSinceActivity < 30).length,
        stale30plus: renewalItems.filter((deal) => deal.daysSinceActivity >= 30).length,
        overdueOnboarding,
        overdueOnboardingCount,
        byCurrency: [...currencyTotals.entries()].map(([currency, totals]) => ({ currency, ...totals }))
      },
      operations: {
        averageLeadToAcceptedDays: proposalDurations.length ? proposalDurations.reduce((sum, days) => sum + days, 0) / proposalDurations.length : null,
        averageOnboardingDays: onboardingDurations.length ? onboardingDurations.reduce((sum, days) => sum + days, 0) / onboardingDurations.length : null,
        activeThisWeek: recentAudit > 0
      }
    };
  }
}
