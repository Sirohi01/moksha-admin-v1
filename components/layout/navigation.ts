import {
  LayoutDashboard,
  HeartHandshake,
  Mail,
  Inbox,
  Settings,
  LucideIcon,
  ClipboardList,
  FolderKanban,
  HandHeart,
  Megaphone,
  BarChart3,
  Truck,
  Wrench,
  Receipt,
  Handshake,
  ShieldCheck,
  UserCog,
  History,
  Images,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// "Volunteers" (replacing the old Services/Pandits/Drivers catalog) lands in M3.
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Requests", href: "/requests", icon: ClipboardList },
      { label: "Cases", href: "/cases", icon: FolderKanban },
      { label: "Volunteers", href: "/volunteers", icon: HandHeart },
      { label: "Donations", href: "/donations", icon: HeartHandshake },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone },
      { label: "Partners", href: "/partners", icon: Handshake },
      { label: "Enquiries", href: "/enquiries", icon: Mail },
      { label: "Support Requests", href: "/newsletter", icon: Inbox },
    ],
  },
  {
    title: "Masters",
    items: [
      { label: "Gallery Media", href: "/gallery", icon: Images },
      { label: "Vehicles", href: "/vehicles", icon: Truck },
      { label: "Service Providers", href: "/service-providers", icon: Wrench },
      { label: "Expense Categories", href: "/expense-categories", icon: Receipt },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Roles & Permissions", href: "/roles", icon: ShieldCheck },
      { label: "Staff", href: "/staff", icon: UserCog },
      { label: "Audit Log", href: "/audit-log", icon: History },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
