export type Role = 'ADMIN' | 'MEMBER'
export type ContactStatus = 'LEAD' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED'
export type ContactSource = 'REFERRAL' | 'WEBSITE' | 'CAMPAIGN' | 'COLD_OUTREACH' | 'EVENT' | 'OTHER'
export type DealStage = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'
export type DealSource = 'INBOUND' | 'OUTBOUND' | 'REFERRAL' | 'PARTNER' | 'EVENT' | 'OTHER'
export type EngagementType = 'PROJECT' | 'RETAINER'
export type RenewalHealth = 'HEALTHY' | 'AT_RISK' | 'UNKNOWN'
export type DealItemKind = 'BASE' | 'PACKAGE' | 'ADD_ON'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type ActivityType = 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING'
export type NotificationType = 'TASK_OVERDUE' | 'DEAL_WON' | 'RENEWAL_DUE' | 'RETAINER_AT_RISK'
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STAGE_CHANGE'
export type AuditEntityType = 'CONTACT' | 'COMPANY' | 'DEAL' | 'TASK' | 'ACTIVITY' | 'TAG' | 'PRODUCT' | 'PROPOSAL'

export interface User {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  domain: string | null
  industry: string | null
  phone: string | null
  city: string | null
  country: string | null
  employeeCount: number | null
  annualRevenue: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  status: ContactStatus
  website: string | null
  city: string | null
  country: string | null
  source: ContactSource | null
  notes: string | null
  lastActivityAt: string | null
  companyId: string | null
  company: Company | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  price: number
  currency: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface DealItem {
  id: string
  dealId: string
  productId: string | null
  product: Product | null
  description: string
  quantity: number
  unitPrice: number
  kind: DealItemKind
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  title: string
  value: number
  currency: string
  stage: DealStage
  position: number
  probability: number
  source: DealSource | null
  nextStep: string | null
  lostReason: string | null
  churnReason: string | null
  engagementType: EngagementType
  oneTimeValue: number
  monthlyRecurringValue: number
  serviceStartDate: string | null
  renewalDate: string | null
  renewalHealth: RenewalHealth
  renewalProbability: number | null
  nextReviewDate: string | null
  contactId: string | null
  contact: Contact | null
  companyId: string | null
  company: Company | null
  expectedCloseDate: string | null
  closedAt: string | null
  notes: string | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  status: TaskStatus
  priority: TaskPriority | null
  contactId: string | null
  contact: { id: string; name: string } | null
  dealId: string | null
  deal: { id: string; title: string } | null
  completedAt: string | null
  onboardingKey: string | null
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  body: string | null
  occurredAt: string
  durationMin: number | null
  contactId: string | null
  contact: { id: string; name: string } | null
  dealId: string | null
  deal: { id: string; title: string } | null
  companyId: string | null
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
}

export interface AuditEntry {
  id: string
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  summary: string
  createdAt: string
}

export interface ContactDetail extends Contact {
  deals: Deal[]
  tasks: Task[]
  activities: Activity[]
}

export interface DealDetail extends Deal {
  items: DealItem[]
  activities: Activity[]
}

export type ProposalStatus = 'CREATED' | 'VIEWED' | 'ACCEPTED' | 'DECLINED'

export interface ProposalSnapshot {
  title: string
  currency: string
  engagementType: EngagementType
  oneTimeValue: number
  monthlyRecurringValue: number
  serviceStartDate: string | null
  renewalDate: string | null
  items: { id: string; description: string; quantity: number; unitPrice: number; kind: DealItemKind }[]
}

export interface Proposal {
  id: string
  dealId: string
  status: ProposalStatus
  snapshot: ProposalSnapshot
  expiresAt: string
  viewedAt: string | null
  respondedAt: string | null
  selectedPackageId: string | null
  selectedAddonIds: string[]
  createdAt: string
}

export interface PublicProposal {
  id: string
  status: ProposalStatus
  expiresAt: string
  snapshot: ProposalSnapshot
  selectedPackageId: string | null
  selectedAddonIds: string[]
}

export interface CompanyDetail extends Company {
  contacts: Contact[]
  deals: Deal[]
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface DashboardStats {
  contacts: {
    total: number
    byStatus: Record<ContactStatus, number>
  }
  deals: {
    total: number
    byStage: Record<DealStage, number>
    pipelineValue: number
    wonValue: number
    avgDealSize: number
  }
  revenueByMonth: { month: string; total: number }[]
  topCompanies: { companyId: string | null; name: string; pipelineValue: number; dealCount: number }[]
  tasks: {
    total: number
    open: number
    overdue: number
  }
  renewals: {
    items: {
      id: string
      title: string
      companyName: string | null
      currency: string
      monthlyRecurringValue: number
      renewalDate: string | null
      daysUntilRenewal: number | null
      renewalHealth: RenewalHealth
      accountHealth: 'RED' | 'YELLOW' | 'GREEN'
      daysSinceActivity: number
    }[]
    within30: number
    within60: number
    within90: number
    missed: number
    atRisk: number
    stale14to30: number
    stale30plus: number
    overdueOnboarding: { id: string; title: string; dealId: string | null; dueDate: string | null }[]
    overdueOnboardingCount: number
    byCurrency: { currency: string; monthlyRecurringRevenue: number; forecast90: number }[]
  }
  operations: { averageLeadToAcceptedDays: number | null; averageOnboardingDays: number | null; activeThisWeek: boolean }
}

export interface SearchResults {
  contacts: { id: string; name: string; email: string | null }[]
  companies: { id: string; name: string; domain: string | null }[]
  deals: { id: string; title: string; stage: DealStage; value: number; currency: string }[]
}

export interface ReorderUpdate {
  id: string
  stage: DealStage
  position: number
}

export const DEAL_STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']
export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  NEW: 'Lead',
  QUALIFIED: 'Discovery',
  PROPOSAL: 'Scope sent',
  NEGOTIATION: 'Client review',
  WON: 'Won',
  LOST: 'Lost',
}
export const CONTACT_STATUSES: ContactStatus[] = ['LEAD', 'QUALIFIED', 'CUSTOMER', 'CHURNED']
export const CONTACT_SOURCES: ContactSource[] = ['REFERRAL', 'WEBSITE', 'CAMPAIGN', 'COLD_OUTREACH', 'EVENT', 'OTHER']
export const DEAL_SOURCES: DealSource[] = ['INBOUND', 'OUTBOUND', 'REFERRAL', 'PARTNER', 'EVENT', 'OTHER']
export const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
export const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
export const ACTIVITY_TYPES: ActivityType[] = ['NOTE', 'CALL', 'EMAIL', 'MEETING']
export const CURRENCIES: string[] = ['USD', 'EUR', 'GBP', 'INR']
