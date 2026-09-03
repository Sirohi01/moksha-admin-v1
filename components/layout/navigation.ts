import {
  Activity,
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  ClipboardList,
  DatabaseBackup,
  FileSearch,
  FileText,
  GalleryHorizontalEnd,
  Gauge,
  HandHeart,
  Handshake,
  History,
  LayoutDashboard,
  Link2,
  ListTree,
  LockKeyhole,
  Mail,
  Megaphone,
  MessageSquare,
  Receipt,
  Route,
  SearchCheck,
  Settings,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main Navigation",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "Content Management",
    items: [
      { label: "Pages & CMS", href: "/pages", icon: FileText },
      { label: "Services Management", href: "/services", icon: BriefcaseBusiness },
      { label: "Blog & Awareness", href: "/blogs", icon: BookOpenText },
      { label: "Media Library", href: "/gallery", icon: GalleryHorizontalEnd },
      { label: "Testimonials", icon: MessageSquare, disabled: true },
      { label: "FAQs", href: "/faqs", icon: MessageSquare },
      { label: "Navigation Menus", href: "/website?section=navbar", icon: ListTree },
    ],
  },
  {
    title: "Engagement & Leads",
    items: [
      { label: "Forms & Submissions", href: "/enquiries", icon: Mail, badge: "127" },
      { label: "Sewa Help Requests", href: "/requests", icon: ClipboardList, badge: "58" },
      { label: "Cases", href: "/cases", icon: FileSearch },
      { label: "Volunteers", href: "/volunteers", icon: HandHeart, badge: "32" },
      { label: "Donations", href: "/donations", icon: Handshake },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone },
      { label: "Partners & CSR Enquiries", href: "/partners", icon: Handshake, badge: "21" },
      { label: "Newsletter Subscribers", href: "/newsletter", icon: Mail, badge: "342" },
      { label: "Vehicles", href: "/vehicles", icon: Truck },
      { label: "Service Providers", href: "/service-providers", icon: Wrench },
      { label: "Expense Categories", href: "/expense-categories", icon: Receipt },
    ],
  },
  {
    title: "SEO & Performance",
    items: [
      { label: "SEO Center", href: "/reports", icon: SearchCheck, badge: "NEW" },
      { label: "Google Search Console", icon: BarChart3, disabled: true },
      { label: "Analytics Dashboard", icon: Gauge, disabled: true },
      { label: "Performance Center", icon: Activity, disabled: true },
      { label: "Site Health Monitor", icon: ShieldCheck, disabled: true },
      { label: "Schema Manager", icon: FileSearch, disabled: true },
      { label: "Redirects Manager", href: "/redirects", icon: Route },
      { label: "Internal Linking", icon: Link2, disabled: true },
    ],
  },
  {
    title: "System & Security",
    items: [
      { label: "Users & Roles", href: "/roles", icon: Users },
      { label: "Staff Management", href: "/staff", icon: UserCog },
      { label: "Security Center", href: "/system-services", icon: LockKeyhole },
      { label: "Backups & Restore", icon: DatabaseBackup, disabled: true },
      { label: "Audit Logs", href: "/audit-log", icon: History },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
