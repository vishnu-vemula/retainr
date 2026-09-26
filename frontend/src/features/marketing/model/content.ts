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
  tagline: 'From agency proposal to renewal.',
  description:
    'Retainr helps performance-marketing agencies scope proposals, onboard clients, and stay ahead of retainer renewals.',
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
  'Agency pipeline',
  'Shareable proposals',
  'Renewal health',
  'Onboarding checklist',
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
    description: 'Move work from Lead and Discovery through Scope sent and Client review to Won. Probability and close dates update as you go.',
  },
  {
    icon: Receipt,
    title: 'Proposals and scope',
    description: 'Build a quote from services or templates, share an expiring link, and track the client’s choice.',
  },
  {
    icon: ListChecks,
    title: 'Tasks & follow-ups',
    description: 'Priorities, due dates and one-click completion. Won deals create a five-step onboarding checklist.',
  },
  {
    icon: MessagesSquare,
    title: 'Activity timeline',
    description: 'Log calls, emails, meetings and notes. Every contact shows when you last touched base.',
  },
  {
    icon: Bell,
    title: 'Smart notifications',
    description: 'Overdue tasks, renewal dates, at-risk retainers and won deals land in one deduplicated inbox.',
  },
]

export const extraFeatures: Feature[] = [
  { icon: Search, title: 'Global search', description: 'Ctrl K finds contacts, companies and deals from anywhere.' },
  { icon: Tags, title: 'Colour tags', description: 'Segment contacts and deals your way, managed in one place.' },
  { icon: Package, title: 'Product catalog', description: 'Reusable products with SKUs and prices for faster quotes.' },
  { icon: History, title: 'Audit trail', description: 'Every create, update, delete and stage change is recorded.' },
  { icon: Download, title: 'CSV export', description: 'Take your contact list anywhere with a single click.' },
  { icon: UserCog, title: 'Account roles', description: 'Admins manage account access and roles from settings.' },
  { icon: Gauge, title: 'Renewal dashboard', description: 'MRR, forecast, client inactivity and renewals due in 30, 60 or 90 days.' },
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
    eyebrow: 'Agency pipeline',
    title: 'See every opportunity. Move it forward.',
    description:
      'A Kanban board across Lead, Discovery, Scope sent, Client review, Won and Lost — drag a card to move the work forward.',
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
      'Build a scope from your services or three agency templates. Share a snapshot, then let the client choose a package and add-ons.',
    points: [
      'Products with SKUs, prices and currencies',
      'Inline quantity and unit-price editing',
      'Deal value recalculated on every change',
      'Expiring share links with viewed, accepted and declined status',
    ],
    preview: 'quote',
  },
  {
    id: 'tasks',
    eyebrow: 'Tasks & follow-ups',
    title: 'Follow-ups that never slip.',
    description:
      'Turn every promise into a task linked to a client or engagement. Winning a deal creates five onboarding handoffs.',
    points: [
      'To do, in progress and done states',
      'Low → urgent priorities with due dates',
      'Overdue highlighting across the app',
      'Reusable won-deal onboarding checklist',
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
      'An in-app inbox surfaces overdue tasks, renewals and at-risk retainers, while the audit trail records changes.',
    points: [
      'Unread counts and mark-all-read',
      'Deduplicated overdue, won and renewal alerts',
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
      'Pipeline, recurring revenue, renewal forecast, inactive accounts and overdue onboarding in one owner-scoped view.',
    points: [
      'Six-month revenue trend',
      'Retainers renewing in 30, 60 and 90 days',
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
    title: 'Agency workspaces',
    description: 'Shared records, membership and agency roles after solo users validate the workflow.',
  },
  {
    icon: Radar,
    title: 'Calendar and email sync',
    description: 'Connect existing calendars and inboxes after the core renewal workflow is proven.',
  },
  {
    icon: ClipboardCheck,
    title: 'Payments and e-signature',
    description: 'Optional integrations after agencies validate proposal and onboarding flow.',
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
    description: 'Create an engagement, build a scope, share a proposal, and move it through the pipeline.',
  },
  {
    title: 'Retain',
    description: 'Onboarding tasks, renewal alerts and account health keep every retainer moving.',
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
      'Shareable proposals and onboarding checklist',
      'Retainer health, renewals and recurring revenue',
      'Tasks, activity timeline and notifications',
      'Dashboard, reports and audit trail',
      'Global search, tags and CSV export',
    ],
  },
  {
    name: 'Studio',
    status: 'soon',
    monthly: null,
    description: 'Planned collaboration tools for growing agencies.',
    cta: { href: '/contact', label: 'Get notified' },
    features: [
      'Everything in Early access',
      'Shared agency workspace',
      'Team membership and account roles',
      'CSV import',
      'Email reminders',
    ],
  },
  {
    name: 'Agency',
    status: 'soon',
    monthly: null,
    description: 'Planned integrations and support for larger teams.',
    cta: { href: '/contact#demo', label: 'Talk to us' },
    features: [
      'Everything in Studio',
      'Calendar and email integrations',
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
  { label: 'Retainers & renewals', values: ['✓', '✓', '✓'] },
  { label: 'Proposals', values: ['✓', '✓', '✓'] },
  { label: 'Shared workspace', values: ['—', 'Planned', 'Planned'] },
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
      'Performance-marketing agencies that need to turn scopes into accepted proposals, onboard clients, and manage recurring retainers.',
  },
  {
    question: 'Is Retainr free?',
    answer:
      'Yes — proposals, onboarding and renewal tools are included during early access. Future team plans are not billed yet.',
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
    answer: 'The live solo-agency workflow, including proposals, onboarding and renewals — no feature gates or credit card.',
  },
  {
    question: 'What happens when paid plans launch?',
    answer:
      'Early-access accounts keep working. We will announce any paid team plans ahead of time.',
  },
  {
    question: 'When will team pricing be available?',
    answer: 'Team plans are not available yet. We will share pricing before they launch.',
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
      'Sign-in runs on Firebase Authentication. Private API routes verify your ID token; public proposal links use expiring random tokens.',
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
    title: 'Agency proposal to renewal',
    description: 'Contacts, scopes, shareable proposals, onboarding tasks, retainer health and renewal alerts.',
  },
  {
    phase: 'Next',
    title: 'Shared agency workspaces',
    description: 'Membership and team permissions after solo agencies validate the workflow.',
  },
]

export const stack = ['Next.js', 'React', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL', 'Firebase Auth', 'React Query']

export const productFacts = [
  { value: '1', label: 'flow from lead to renewal' },
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
