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
  Globe2,
  Building2,
  PanelsTopLeft,
  KeyRound,
  BookOpen,
  MessageSquareQuote,
  CircleHelp,
  BriefcaseBusiness,
  UsersRound,
  Files,
  Users2,
  HeartPulse,
  Ticket,
  BadgePercent,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  requiredPermission?: string;
  children?: NavItem[];
  organisationCodes?: string[];
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
      { label: "Requests", href: "/requests", icon: ClipboardList, requiredPermission: "requests.read", organisationCodes: ["MOKSHA"] },
      { label: "Cases", href: "/cases", icon: FolderKanban, requiredPermission: "cases.read", organisationCodes: ["MOKSHA"] },
      { label: "Volunteers", href: "/volunteers", icon: HandHeart, requiredPermission: "volunteers.read", organisationCodes: ["MOKSHA"] },
      { label: "Donations", href: "/donations", icon: HeartHandshake, requiredPermission: "donations.read", organisationCodes: ["MOKSHA"] },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone, requiredPermission: "campaigns.read", organisationCodes: ["MOKSHA"] },
      { label: "Partners", href: "/partners", icon: Handshake, requiredPermission: "partners.read", organisationCodes: ["MOKSHA"] },
      { label: "Enquiries", href: "/enquiries", icon: Mail, requiredPermission: "enquiries.read", organisationCodes: ["MOKSHA"] },
      { label: "Support Requests", href: "/newsletter", icon: Inbox, requiredPermission: "enquiries.read", organisationCodes: ["MOKSHA"] },
    ],
  },
  {
    title: "Masters",
    items: [
      { label: "Gallery Media", href: "/gallery", icon: Images, requiredPermission: "cms.read", organisationCodes: ["MOKSHA"] },
      { label: "Blog", href: "/blog", icon: BookOpen, requiredPermission: "cms.update", organisationCodes: ["MOKSHA"] },
      { label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote, requiredPermission: "cms.update", organisationCodes: ["MOKSHA"] },
      { label: "FAQs", href: "/faqs", icon: CircleHelp, requiredPermission: "cms.update", organisationCodes: ["MOKSHA"] },
      {
        label: "Website",
        href: "/website",
        icon: Globe2,
        requiredPermission: "cms.read",
        organisationCodes: ["MOKSHA"],
        children: [
          {
            label: "Landing Page",
            href: "/website",
            icon: Globe2,
            children: [
              { label: "Hero Section", href: "/website?section=hero", icon: Globe2 },
              { label: "Who We Help", href: "/website?section=who-we-help", icon: Globe2 },
              { label: "Practical Sewa Support", href: "/website?section=practical-support", icon: Globe2 },
              { label: "Family Need", href: "/website?section=family-need", icon: Globe2 },
              { label: "How Sewa Works", href: "/website?section=how-sewa-works", icon: Globe2 },
              { label: "Compassion Section", href: "/website?section=compassion", icon: Globe2 },
              { label: "Our Humanitarian Commitment", href: "/website?section=humanitarian-commitment", icon: Globe2 },
              { label: "Sewa Stories", href: "/website?section=sewa-stories", icon: Globe2 },
              { label: "Why Your Support Matters", href: "/website?section=support-matters", icon: Globe2 },
              { label: "Join The Mission", href: "/website?section=join-mission", icon: Globe2 },
              { label: "Your Support In Action", href: "/website?section=support-in-action", icon: Globe2 },
              { label: "Trust & Transparency", href: "/website?section=trust-transparency", icon: Globe2 },
              { label: "Glimpse Of Journey", href: "/website?section=journey-glimpse", icon: Globe2 },
              { label: "One Final Act Of Humanity", href: "/website?section=final-act", icon: Globe2 },
              { label: "Frequently Asked Questions", href: "/website?section=faq", icon: Globe2 },
            ],
          },
          { label: "Topbar", href: "/website?section=topbar", icon: Globe2 },
          { label: "Navbar", href: "/website?section=navbar", icon: Globe2 },
          { label: "Footer", href: "/website?section=footer", icon: Globe2 },
        ],
      },
      { label: "Vehicles", href: "/vehicles", icon: Truck, requiredPermission: "masters.read", organisationCodes: ["MOKSHA"] },
      { label: "Service Providers", href: "/service-providers", icon: Wrench, requiredPermission: "masters.read", organisationCodes: ["MOKSHA"] },
      { label: "Expense Categories", href: "/expense-categories", icon: Receipt, requiredPermission: "masters.read", organisationCodes: ["MOKSHA"] },
    ],
  },
  {
    title: "Namo Gange",
    items: [
      { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness, requiredPermission: "jobs.read", organisationCodes: ["NAMOGANGE"] },
      { label: "Members", href: "/members", icon: UsersRound, requiredPermission: "members.read", organisationCodes: ["NAMOGANGE"] },
      { label: "Website CMS", href: "/namo-cms", icon: Files, requiredPermission: "cms.read", organisationCodes: ["NAMOGANGE"] },
      { label: "AGS Delegates", href: "/ags", icon: Users2, requiredPermission: "agsDelegates.read", organisationCodes: ["NAMOGANGE"] },
    ],
  },
  {
    title: "Arogya",
    items: [
      { label: "Website CMS", href: "/arogya-cms", icon: HeartPulse, requiredPermission: "cms.read", organisationCodes: ["AROGYA"] },
      { label: "Delegate Registrations", href: "/arogya-delegates", icon: Users2, requiredPermission: "arogyaDelegates.read", organisationCodes: ["AROGYA"] },
      { label: "Delegate Passes", href: "/arogya-passes", icon: Ticket, requiredPermission: "cms.read", organisationCodes: ["AROGYA"] },
      { label: "Coupons", href: "/arogya-coupons", icon: BadgePercent, requiredPermission: "cms.read", organisationCodes: ["AROGYA"] },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Organisations", href: "/organisations", icon: Building2, requiredPermission: "organisations.read" },
      { label: "Projects", href: "/projects", icon: PanelsTopLeft, requiredPermission: "projects.read" },
      { label: "Access Grants", href: "/access-grants", icon: KeyRound, requiredPermission: "accessGrants.read" },
      { label: "Reports", href: "/reports", icon: BarChart3, requiredPermission: "reports.read" },
      { label: "Roles & Permissions", href: "/roles", icon: ShieldCheck, requiredPermission: "roles.read" },
      { label: "Staff", href: "/staff", icon: UserCog, requiredPermission: "users.read" },
      { label: "Audit Log", href: "/audit-log", icon: History, requiredPermission: "audit.read" },
      { label: "Settings", href: "/settings", icon: Settings, requiredPermission: "settings.read" },
    ],
  },
];
