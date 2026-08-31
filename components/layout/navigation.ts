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
  BriefcaseBusiness,
  UsersRound,
  Files,
  Users2,
  HeartPulse,
  Ticket,
  BadgePercent,
  MousePointerClick,
  List,
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
      // Blog / Testimonials / FAQs hidden from nav 2026-08-27 (user request) — the real Moksha
      // public site doesn't read from these models (hardcoded content instead), so no one knew
      // what they were for. Pages/routes/backend are untouched and still reachable directly if
      // needed later — this only removes the sidebar links.
      {
        label: "Website",
        href: "/website",
        icon: Globe2,
        requiredPermission: "cms.read",
        organisationCodes: ["MOKSHA"],
        children: [
          {
            label: "Landing Page",
            href: "/website?page=landing",
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
          {
            label: "Sewa Services Page",
            href: "/website?page=services",
            icon: Globe2,
            children: [
              { label: "Services Hero", href: "/website?page=services&section=services-hero", icon: Globe2 },
              { label: "Ambulance Sewa", href: "/website?page=services&section=services-ambulance", icon: Globe2 },
              { label: "Funeral Management", href: "/website?page=services&section=services-funeral", icon: Globe2 },
              { label: "Vedic Pandit", href: "/website?page=services&section=services-pandit", icon: Globe2 },
              { label: "Prayer Hall & Samagri", href: "/website?page=services&section=services-prayer-hall", icon: Globe2 },
              { label: "Harsevan Support", href: "/website?page=services&section=services-harsevan", icon: Globe2 },
              { label: "Floral Decoration", href: "/website?page=services&section=services-decoration", icon: Globe2 },
              { label: "Calling Relatives", href: "/website?page=services&section=services-calling-relatives", icon: Globe2 },
              { label: "Special Services", href: "/website?page=services&section=services-special", icon: Globe2 },
            ],
          },
          {
            label: "Unclaimed Body Page",
            href: "/website?page=unclaimed-body",
            icon: Globe2,
            children: [
              { label: "Unclaimed Hero", href: "/website?page=unclaimed-body&section=unclaimed-hero", icon: Globe2 },
              { label: "What Is Unclaimed", href: "/website?page=unclaimed-body&section=unclaimed-what-is", icon: Globe2 },
              { label: "Dignity First", href: "/website?page=unclaimed-body&section=unclaimed-dignity-first", icon: Globe2 },
              { label: "Legal Process", href: "/website?page=unclaimed-body&section=unclaimed-process", icon: Globe2 },
              { label: "Final Journey Support", href: "/website?page=unclaimed-body&section=unclaimed-final-journey", icon: Globe2 },
              { label: "Organisation Backing", href: "/website?page=unclaimed-body&section=unclaimed-organisation", icon: Globe2 },
              { label: "Unclaimed FAQ", href: "/website?page=unclaimed-body&section=unclaimed-faq", icon: Globe2 },
              { label: "Request Unclaimed", href: "/website?page=unclaimed-body&section=unclaimed-request", icon: Globe2 },
            ],
          },
          {
            label: "Volunteer Page",
            href: "/website?page=volunteer",
            icon: Globe2,
            children: [
              { label: "Volunteer Hero", href: "/website?page=volunteer&section=volunteer-hero", icon: Globe2 },
              { label: "Code Of Conduct", href: "/website?page=volunteer&section=volunteer-code", icon: Globe2 },
              { label: "Volunteer Roles", href: "/website?page=volunteer&section=volunteer-dashboard", icon: Globe2 },
              { label: "Register Form Section", href: "/website?page=volunteer&section=volunteer-register", icon: Globe2 },
            ],
          },
          {
            label: "Partnership Page",
            href: "/website?page=partnership",
            icon: Globe2,
            children: [
              { label: "Partnership Hero", href: "/website?page=partnership&section=partnership-hero", icon: Globe2 },
              { label: "How It Works", href: "/website?page=partnership&section=partnership-process", icon: Globe2 },
              { label: "Institutional Responsibility", href: "/website?page=partnership&section=partnership-responsibility", icon: Globe2 },
              { label: "Partnership Network", href: "/website?page=partnership&section=partnership-network", icon: Globe2 },
              { label: "Form Section", href: "/website?page=partnership&section=partnership-enquiry", icon: Globe2 },
              { label: "Partnership FAQ", href: "/website?page=partnership&section=partnership-faq", icon: Globe2 },
              { label: "Partnership CTA", href: "/website?page=partnership&section=partnership-cta", icon: Globe2 },
            ],
          },
          {
            label: "CSR Page",
            href: "/website?page=csr",
            icon: Globe2,
            children: [
              { label: "CSR Hero", href: "/website?page=csr&section=csr-hero", icon: Globe2 },
              { label: "Support Journey", href: "/website?page=csr&section=csr-support-journey", icon: Globe2 },
              { label: "80G Compliance", href: "/website?page=csr&section=csr-compliance", icon: Globe2 },
              { label: "Governance", href: "/website?page=csr&section=csr-responsibility", icon: Globe2 },
              { label: "Engagement Models", href: "/website?page=csr&section=csr-models", icon: Globe2 },
              { label: "CSR Inquiry Form", href: "/website?page=csr&section=csr-enquiry", icon: Globe2 },
              { label: "CSR Final CTA", href: "/website?page=csr&section=csr-cta", icon: Globe2 },
            ],
          },
          {
            label: "Request Help Page",
            href: "/website?page=request-help",
            icon: Globe2,
            children: [
              { label: "Request Help Hero", href: "/website?page=request-help&section=request-help-hero", icon: Globe2 },
              { label: "Request Form Details", href: "/website?page=request-help&section=request-help-form", icon: Globe2 },
              { label: "Request Help FAQ", href: "/website?page=request-help&section=request-help-faq", icon: Globe2 },
            ],
          },
          {
            label: "Donation Page",
            href: "/website?page=donation",
            icon: Globe2,
            children: [
              { label: "Donation Hero", href: "/website?page=donation&section=donation-hero", icon: Globe2 },
              { label: "Donation Causes", href: "/website?page=donation&section=donation-causes", icon: Globe2 },
              { label: "80G Tax Benefits", href: "/website?page=donation&section=donation-tax-benefit", icon: Globe2 },
            ],
          },
          {
            label: "Contact Page",
            href: "/website?page=contact",
            icon: Globe2,
            children: [
              { label: "Contact Hero", href: "/website?page=contact&section=contact-hero", icon: Globe2 },
              { label: "Contact Desks", href: "/website?page=contact&section=contact-info", icon: Globe2 },
              { label: "Contact Form Section", href: "/website?page=contact&section=contact-form", icon: Globe2 },
              { label: "Contact FAQ", href: "/website?page=contact&section=contact-faq", icon: Globe2 },
            ],
          },
          {
            label: "Track Status Page",
            href: "/website?page=track",
            icon: Globe2,
            children: [
              { label: "Track Status Hero", href: "/website?page=track&section=track-hero", icon: Globe2 },
              { label: "Track Info", href: "/website?page=track&section=track-info", icon: Globe2 },
            ],
          },
          {
            label: "Legal & Policies",
            href: "/website?page=privacy-policy",
            icon: Globe2,
            children: [
              { label: "Privacy Policy", href: "/website?page=privacy-policy", icon: Globe2,
                children: [
                  { label: "Privacy Hero", href: "/website?page=privacy-policy&section=privacy-hero", icon: Globe2 },
                  { label: "Privacy Content", href: "/website?page=privacy-policy&section=privacy-content", icon: Globe2 },
                  { label: "Privacy Contact", href: "/website?page=privacy-policy&section=privacy-contact", icon: Globe2 },
                ]
              },
              { label: "Terms & Conditions", href: "/website?page=terms", icon: Globe2,
                children: [
                  { label: "Terms Hero", href: "/website?page=terms&section=terms-hero", icon: Globe2 },
                  { label: "Terms Content", href: "/website?page=terms&section=terms-content", icon: Globe2 },
                  { label: "Terms Contact", href: "/website?page=terms&section=terms-contact", icon: Globe2 },
                ]
              },
              { label: "Refund Policy", href: "/website?page=refund-policy", icon: Globe2,
                children: [
                  { label: "Refund Hero", href: "/website?page=refund-policy&section=refund-hero", icon: Globe2 },
                  { label: "Refund Content", href: "/website?page=refund-policy&section=refund-content", icon: Globe2 },
                  { label: "Refund Contact", href: "/website?page=refund-policy&section=refund-contact", icon: Globe2 },
                ]
              },
              { label: "Code Of Conduct", href: "/website?page=code-of-conduct", icon: Globe2,
                children: [
                  { label: "Conduct Hero", href: "/website?page=code-of-conduct&section=conduct-hero", icon: Globe2 },
                  { label: "Conduct Content", href: "/website?page=code-of-conduct&section=conduct-content", icon: Globe2 },
                  { label: "Conduct Contact", href: "/website?page=code-of-conduct&section=conduct-contact", icon: Globe2 },
                ]
              },
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
      { label: "Career Applications", href: "/namo-job-applications", icon: BriefcaseBusiness, requiredPermission: "namoJobApplications.read", organisationCodes: ["NAMOGANGE"] },
      { label: "Contact Enquiries", href: "/namo-enquiries", icon: Mail, requiredPermission: "namoEnquiries.read", organisationCodes: ["NAMOGANGE"] },
      { label: "Support Requests", href: "/namo-support-requests", icon: HandHeart, requiredPermission: "namoSupportRequests.read", organisationCodes: ["NAMOGANGE"] },
      { label: "Donation Pledges", href: "/namo-donation-leads", icon: HeartHandshake, requiredPermission: "namoDonationLeads.read", organisationCodes: ["NAMOGANGE"] },
      { label: "Click Analytics", href: "/namo-click-analytics", icon: MousePointerClick, requiredPermission: "namoClickAnalytics.read", organisationCodes: ["NAMOGANGE"] },
      { label: "AGS Institution Directory", href: "/namo-ags-colleges", icon: Building2, requiredPermission: "namoAgsColleges.read", organisationCodes: ["NAMOGANGE"] },
      { label: "Lookup / Master Data", href: "/namo-lookups", icon: List, requiredPermission: "namoLookups.read", organisationCodes: ["NAMOGANGE"] },
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
