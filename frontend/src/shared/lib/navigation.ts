import {
  Bell,
  Building2,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  Package,
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
  { to: '/deals', label: 'Deals', icon: KanbanSquare },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
]

export const settingsNav: NavItem[] = [
  { to: '/settings/tags', label: 'Tags', icon: Tags },
  { to: '/settings/products', label: 'Products', icon: Package },
  { to: '/settings/users', label: 'Users', icon: Users, adminOnly: true },
]

export const notificationsNav: NavItem = { to: '/notifications', label: 'Notifications', icon: Bell }

export function isNavActive(pathname: string, to: string): boolean {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
}

export function visibleFor(items: NavItem[], isAdmin: boolean): NavItem[] {
  return items.filter((item) => !item.adminOnly || isAdmin)
}
