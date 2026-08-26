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
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
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
      {
        label: "Website",
        href: "/website",
        icon: Globe2,
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
          {
            label: "About Page",
            href: "/website?page=about",
            icon: Globe2,
            children: [
              { label: "About Hero", href: "/website?page=about&section=about-hero", icon: Globe2 },
              { label: "Who We Are", href: "/website?page=about&section=about-who-we-are", icon: Globe2 },
              { label: "What Is Moksha Sewa", href: "/website?page=about&section=about-moksha-sewa", icon: Globe2 },
              { label: "What We Do", href: "/website?page=about&section=about-services", icon: Globe2 },
              { label: "Who We Support", href: "/website?page=about&section=about-how-support", icon: Globe2 },
              { label: "Why We Exist", href: "/website?page=about&section=about-why-exist", icon: Globe2 },
              { label: "Mission Video", href: "/website?page=about&section=about-behind-mission", icon: Globe2 },
              { label: "Our Story & Founder Message", href: "/website?page=about&section=about-our-story", icon: Globe2 },
              { label: "Namo Gange Trust", href: "/website?page=about&section=about-namo-gange", icon: Globe2 },
              { label: "Responsible Sewa", href: "/website?page=about&section=about-responsible-sewa", icon: Globe2 },
              { label: "Support The Mission", href: "/website?page=about&section=about-support-mission", icon: Globe2 },
              { label: "Be Part Of The Sewa", href: "/website?page=about&section=about-join-sewa", icon: Globe2 },
              { label: "About FAQ", href: "/website?page=about&section=about-faq", icon: Globe2 },
              { label: "Heart Of Moksha", href: "/website?page=about&section=about-heart", icon: Globe2 },
            ],
          },
          { label: "Topbar", href: "/website?section=topbar", icon: Globe2 },
          { label: "Navbar", href: "/website?section=navbar", icon: Globe2 },
          { label: "Footer", href: "/website?section=footer", icon: Globe2 },
        ],
      },
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
