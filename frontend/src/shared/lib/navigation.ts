import {
  BarChart3,
  Bell,
  Building2,
  CircleUserRound,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Package,
  CalendarClock,
  Tags,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

export const workspaceNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contacts', label: 'Contacts', icon: UsersRound },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/deals', label: 'Pipeline', icon: KanbanSquare },
  { to: '/renewals', label: 'Renewals', icon: CalendarClock },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/activities', label: 'Activities', icon: MessagesSquare },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export const settingsNav: NavItem[] = [
  { to: '/settings/account', label: 'Account', icon: CircleUserRound },
  { to: '/settings/tags', label: 'Tags', icon: Tags },
  { to: '/settings/products', label: 'Products', icon: Package },
  { to: '/settings/users', label: 'Users', icon: Users, adminOnly: true },
]

export const notificationsNav: NavItem = { to: '/notifications', label: 'Notifications', icon: Bell }

export function isNavActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function visibleFor(items: NavItem[], isAdmin: boolean): NavItem[] {
  return items.filter((item) => !item.adminOnly || isAdmin)
}
