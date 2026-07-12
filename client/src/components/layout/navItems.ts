import {
  Briefcase,
  LayoutDashboard,
  ScrollText,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@ijp/shared";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omit to show to every role. */
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Users", href: "/users", icon: Users, roles: ["admin"] },
  {
    label: "Activity Logs",
    href: "/activity-logs",
    icon: ScrollText,
    roles: ["admin"],
  },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: UserCircle },
];
