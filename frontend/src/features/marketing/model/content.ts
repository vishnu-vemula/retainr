import {
  Bell,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Fingerprint,
  Gauge,
  History,
  KanbanSquare,
  KeyRound,
  Layers,
  ListChecks,
  LockKeyhole,
  MessagesSquare,
  Package,
  Radar,
  Receipt,
  RefreshCcw,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Tags,
  Timer,
  UserCog,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export const siteConfig = {
  name: 'Retainr',
  tagline: 'The CRM for teams that keep their clients.',
  description:
    'Retainr brings contacts, companies, your deal pipeline, quotes and follow-ups into one calm workspace — so client relationships never go cold.',
  contactEmail: 'hello@retainr.app',
}

export interface MarketingLink {
  href: string
  label: string
}

export const marketingNav: MarketingLink[] = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const footerColumns: { title: string; links: MarketingLink[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/security', label: 'Security' },
      { href: '/features#roadmap', label: 'Roadmap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/contact#demo', label: 'Book a demo' },
    ],
  },
  {
    title: 'Workspace',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/signup', label: 'Create account' },
      { href: '/dashboard', label: 'Open dashboard' },
    ],
  },
]

export const capabilityTicker = [
  'Contacts',
  'Companies',
  'Deal pipeline',
  'Quote builder',
  'Tasks',
  'Activity timeline',
  'Notifications',
  'Audit trail',
  'Global search',
  'Tags',
  'Reports',
  'Roles & permissions',
]

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export const coreFeatures: Feature[] = [
  {
    icon: UsersRound,
    title: 'Contacts & companies',
    description: 'Every person and account with status, source, tags and the full history of what happened.',
  },
  {
    icon: KanbanSquare,
    title: 'Drag-and-drop pipeline',
    description: 'Move deals from New to Won across six stages. Probability and close dates update as you go.',
  },
  {
    icon: Receipt,
    title: 'Quote builder',
    description: 'Add products or free-text line items to a deal — its value recalculates automatically.',
  },
  {
    icon: ListChecks,
    title: 'Tasks & follow-ups',
    description: 'Priorities, due dates and one-click completion, linked to the contact or deal they move forward.',
  },
  {
    icon: MessagesSquare,
    title: 'Activity timeline',
    description: 'Log calls, emails, meetings and notes. Every contact shows when you last touched base.',
  },
  {
    icon: Bell,
    title: 'Smart notifications',
    description: 'Overdue-task reminders and won-deal alerts land in one inbox, never duplicated.',
  },
]

export const extraFeatures: Feature[] = [
  { icon: Search, title: 'Global search', description: 'Ctrl K finds contacts, companies and deals from anywhere.' },
  { icon: Tags, title: 'Colour tags', description: 'Segment contacts and deals your way, managed in one place.' },
  { icon: Package, title: 'Product catalog', description: 'Reusable products with SKUs and prices for faster quotes.' },
  { icon: History, title: 'Audit trail', description: 'Every create, update, delete and stage change is recorded.' },
  { icon: Download, title: 'CSV export', description: 'Take your contact list anywhere with a single click.' },
  { icon: UserCog, title: 'Team roles', description: 'Admins manage members and roles from the settings area.' },
  { icon: Gauge, title: 'Live dashboard', description: 'Pipeline value, win revenue and task health at a glance.' },
  { icon: Layers, title: 'Stage rules', description: 'Stage moves set probability and stamp close dates for you.' },
]

export interface FeatureDeepDive {
  id: string
  eyebrow: string
  title: string
  description: string
  points: string[]
  preview: 'contacts' | 'pipeline' | 'quote' | 'tasks' | 'timeline' | 'alerts' | 'dashboard' | 'search'
}

export const featureDeepDives: FeatureDeepDive[] = [
  {
    id: 'contacts',
    eyebrow: 'Contacts & companies',
    title: 'One home for every relationship.',
    description:
      'Keep people and the accounts they belong to side by side, with the context your team needs before the next call.',
    points: [
      'Lead → Qualified → Customer → Churned statuses',
      'Company profiles with industry, size and revenue',
      'Search, filters, pagination and CSV export',
      'Tags on contacts and deals for instant segments',
    ],
    preview: 'contacts',
  },
  {
    id: 'pipeline',
    eyebrow: 'Deal pipeline',
    title: 'See every deal. Move it forward.',
    description:
      'A Kanban board across New, Qualified, Proposal, Negotiation, Won and Lost — drag a card and the whole team sees it.',
    points: [
      'Drag-and-drop ordering that persists',
      'Stage changes set default probability automatically',
      'Close dates stamped on Won and Lost',
      'Per-stage totals, by currency',
    ],
    preview: 'pipeline',
  },
  {
    id: 'quotes',
    eyebrow: 'Quote builder',
    title: 'Quotes that add themselves up.',
    description:
      'Build a deal from your product catalog or free-text line items. Quantities and prices edit inline, and the deal value follows.',
    points: [
      'Products with SKUs, prices and currencies',
      'Inline quantity and unit-price editing',
      'Deal value recalculated on every change',
      'Works with USD, EUR, GBP and INR',
    ],
    preview: 'quote',
  },
  {
    id: 'tasks',
    eyebrow: 'Tasks & follow-ups',
    title: 'Follow-ups that never slip.',
    description:
      'Turn every promise into a task linked to the contact or deal it belongs to — then tick it off in one click.',
    points: [
      'To do, in progress and done states',
      'Low → urgent priorities with due dates',
      'Overdue highlighting across the app',
      'Linked to contacts and deals',
    ],
    preview: 'tasks',
  },
  {
    id: 'timeline',
    eyebrow: 'Activity timeline',
    title: 'The whole story, in order.',
    description:
      'Calls, emails, meetings and notes on a timeline for every contact, company and deal, so hand-offs lose nothing.',
    points: [
      'Four activity types with durations',
      'Last-touch recency on every contact',
      'Activity feed across the whole workspace',
      'Edit and remove entries any time',
    ],
    preview: 'timeline',
  },
  {
    id: 'alerts',
    eyebrow: 'Notifications & audit',
    title: 'Know what changed — and who needs you.',
    description:
      'An in-app inbox surfaces overdue tasks and won deals, while the audit trail records every change to every record.',
    points: [
      'Unread counts and mark-all-read',
      'Deduplicated overdue and deal-won alerts',
      'Per-record history on detail pages',
      'Stage changes captured with before and after',
    ],
    preview: 'alerts',
  },
  {
    id: 'insights',
    eyebrow: 'Dashboard & reports',
    title: 'Numbers you can act on.',
    description:
      'Pipeline value, won revenue, average deal size, stage distribution and task health — live, the moment you sign in.',
    points: [
      'Six-month revenue trend',
      'Deals by stage and top companies',
      'Contact status and task health reports',
      'Owner-scoped: you only see your data',
    ],
    preview: 'dashboard',
  },
  {
    id: 'search',
    eyebrow: 'Search & roles',
    title: 'Fast for you. Safe for everyone.',
    description:
      'Press Ctrl K to jump to any contact, company or deal. Admins manage who can do what from one screen.',
    points: [
      'Keyboard-first global search',
      'Admin and member roles',
      'Firebase sign-in with email or Google',
      'Every query scoped to its owner',
    ],
    preview: 'search',
  },
]

export const roadmap: Feature[] = [
  {
    icon: RefreshCcw,
    title: 'Retainers & renewals',
    description: 'Track project vs. retainer work, monthly value and upcoming renewal dates.',
  },
  {
    icon: Radar,
    title: 'Client health',
    description: 'Flag healthy and at-risk accounts before a renewal conversation.',
  },
  {
    icon: ClipboardCheck,
    title: 'Proposals',
    description: 'Publish proposals from a deal and see when they are accepted or declined.',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV import',
    description: 'Bring your existing contacts in from any spreadsheet.',
  },
  {
    icon: CalendarClock,
    title: 'Email reminders',
    description: 'Overdue-task nudges delivered straight to your inbox.',
  },
]

export const steps = [
  {
    title: 'Capture',
    description: 'Add contacts and companies, tag them, and log the first conversation in seconds.',
  },
  {
    title: 'Move',
    description: 'Create a deal, build the quote, and drag it through the pipeline as it progresses.',
  },
  {
    title: 'Retain',
    description: 'Tasks, reminders and a complete timeline keep every client relationship warm.',
  },
]

export interface Plan {
  name: string
  status: 'available' | 'soon'
  monthly: number | null
  description: string
  cta: MarketingLink
  highlighted?: boolean
  features: string[]
}

export const plans: Plan[] = [
  {
    name: 'Early access',
    status: 'available',
    monthly: 0,
    description: 'Everything in Retainr today, free while we are in early access.',
    cta: { href: '/signup', label: 'Create free account' },
    highlighted: true,
    features: [
      'Unlimited contacts, companies and deals',
      'Drag-and-drop pipeline and quote builder',
      'Tasks, activity timeline and notifications',
      'Dashboard, reports and audit trail',
      'Global search, tags and CSV export',
    ],
  },
  {
    name: 'Studio',
    status: 'soon',
    monthly: 24,
    description: 'For growing agencies that run on retainers.',
    cta: { href: '/contact', label: 'Get notified' },
    features: [
      'Everything in Early access',
      'Retainers, renewals and client health',
      'Proposals with accept / decline tracking',
      'CSV import',
      'Email reminders',
    ],
  },
  {
    name: 'Agency',
    status: 'soon',
    monthly: 49,
    description: 'For multi-team agencies that need more control.',
    cta: { href: '/contact#demo', label: 'Talk to us' },
    features: [
      'Everything in Studio',
      'Advanced roles and permissions',
      'Priority support',
      'Onboarding session',
      'Custom data migration',
    ],
  },
]

export const planComparison: { label: string; values: [string, string, string] }[] = [
  { label: 'Contacts, companies & deals', values: ['Unlimited', 'Unlimited', 'Unlimited'] },
  { label: 'Pipeline & quote builder', values: ['✓', '✓', '✓'] },
  { label: 'Tasks, timeline & notifications', values: ['✓', '✓', '✓'] },
  { label: 'Dashboard & reports', values: ['✓', '✓', '✓'] },
  { label: 'Audit trail', values: ['✓', '✓', '✓'] },
  { label: 'Retainers & renewals', values: ['—', 'Planned', 'Planned'] },
  { label: 'Proposals', values: ['—', 'Planned', 'Planned'] },
  { label: 'Advanced roles', values: ['Admin / member', 'Admin / member', 'Planned'] },
  { label: 'Support', values: ['Community', 'Email', 'Priority'] },
]

export interface Faq {
  question: string
  answer: string
}

export const homeFaqs: Faq[] = [
  {
    question: 'Who is Retainr for?',
    answer:
      'Agencies, consultancies and any client-first team that wins work through relationships and needs contacts, deals and follow-ups in one place.',
  },
  {
    question: 'Is Retainr free?',
    answer:
      'Yes — every feature available today is free during early access. Paid plans will add retainer and proposal tooling later, and we will tell you well in advance.',
  },
  {
    question: 'How do I sign in?',
    answer: 'Create an account with your email and a password, or continue with Google. Sign-in is handled by Firebase Authentication.',
  },
  {
    question: 'Can I get my data out?',
    answer: 'Contacts export to CSV in one click from the Contacts page. More export options are on the roadmap.',
  },
  {
    question: 'Who can see my data?',
    answer:
      'Only you. Every record is tied to its owner and every query is filtered by owner, down to the database constraints.',
  },
]

export const pricingFaqs: Faq[] = [
  {
    question: 'What does early access include?',
    answer: 'Everything that is live in Retainr today — no seat limits, no feature gates, no credit card.',
  },
  {
    question: 'What happens when paid plans launch?',
    answer:
      'Early-access workspaces keep working. We will announce pricing ahead of time, and you choose whether a paid plan is worth it for you.',
  },
  {
    question: 'Are the Studio and Agency prices final?',
    answer: 'No — they are our planned prices and may change before launch. Get notified and we will share the details first.',
  },
  {
    question: 'Can I leave at any time?',
    answer: 'Yes. Export your contacts to CSV whenever you like; there is nothing to cancel during early access.',
  },
]

export const securityPillars: Feature[] = [
  {
    icon: Fingerprint,
    title: 'Verified identity on every request',
    description:
      'Sign-in runs on Firebase Authentication. The API verifies your ID token on every single request before anything else happens.',
  },
  {
    icon: LockKeyhole,
    title: 'Your data stays yours',
    description:
      'Every contact, company, deal and task carries an owner. Queries are filtered by owner and the database enforces it with compound keys.',
  },
  {
    icon: KeyRound,
    title: 'Role-based access',
    description: 'Admin and member roles live in signed token claims, and admin-only screens are guarded on both client and server.',
  },
  {
    icon: History,
    title: 'Complete audit trail',
    description: 'Creates, updates, deletes and stage changes are written to an audit log you can review on every record.',
  },
  {
    icon: ShieldCheck,
    title: 'Hardened API',
    description: 'Security headers via Helmet, a strict CORS allow-list and per-IP rate limiting protect every endpoint.',
  },
  {
    icon: ServerCog,
    title: 'Validated at the boundary',
    description: 'Every request body and query is validated with a schema. Unexpected errors are logged, never leaked.',
  },
]

export const securityFaqs: Faq[] = [
  {
    question: 'Where are passwords stored?',
    answer: 'Retainr never sees or stores your password — Firebase Authentication handles credentials and issues short-lived ID tokens.',
  },
  {
    question: 'Can another user see my records?',
    answer: 'No. Every read and write is scoped to the requesting user, and ownership is enforced again by unique keys in the database.',
  },
  {
    question: 'What happens when my role changes?',
    answer: 'Roles are stored as token claims, so a change takes effect the next time your session refreshes — signing out and back in applies it right away.',
  },
]

export const principles: Feature[] = [
  {
    icon: Sparkles,
    title: 'Clarity over clutter',
    description: 'Fewer clicks, calmer screens. If a feature does not help you keep a client, it does not ship.',
  },
  {
    icon: UsersRound,
    title: 'Relationships over records',
    description: 'A CRM should remember the story, not just the row — timelines and follow-ups come first.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust by default',
    description: 'Owner-scoped data, audited changes and verified sessions are the baseline, not an upsell.',
  },
  {
    icon: Timer,
    title: 'Speed is a feature',
    description: 'Keyboard search, instant filters and optimistic updates keep you moving.',
  },
]

export const milestones = [
  {
    phase: 'Where it started',
    title: 'A task manager',
    description: 'Retainr began life as a simple task board for keeping follow-ups on track.',
  },
  {
    phase: 'The rebuild',
    title: 'Typed, tested, production-ready',
    description: 'A full rewrite in TypeScript with Prisma, PostgreSQL, validated APIs and Firebase sign-in.',
  },
  {
    phase: 'Today',
    title: 'A complete CRM',
    description: 'Contacts, companies, pipeline, quotes, tasks, timelines, notifications and an audit trail.',
  },
  {
    phase: 'Next',
    title: 'Built for retainers',
    description: 'Renewals, client health and proposals for agencies that live on recurring work.',
  },
]

export const stack = ['Next.js', 'React', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL', 'Firebase Auth', 'React Query']

export const productFacts = [
  { value: '12', label: 'modules in one workspace' },
  { value: '6', label: 'pipeline stages, drag-and-drop' },
  { value: '4', label: 'activity types on every timeline' },
  { value: '100%', label: 'of changes written to the audit trail' },
]

export const contactTopics = ['Book a demo', 'Pricing & plans', 'Product question', 'Support', 'Partnerships', 'Something else']

export const contactChannels = [
  {
    icon: MessagesSquare,
    title: 'Book a demo',
    description: 'A 20-minute walkthrough of Retainr, tailored to how your team works.',
    anchor: 'demo',
  },
  {
    icon: Building2,
    title: 'Sales & partnerships',
    description: 'Questions about plans, early access or working together.',
    anchor: 'sales',
  },
  {
    icon: ShieldCheck,
    title: 'Support',
    description: 'Something not working? Tell us what happened and we will help.',
    anchor: 'support',
  },
]
