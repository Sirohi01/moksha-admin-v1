import { normalizeLandingSection, type LandingSectionContent } from "./landingContent";

export type ExtraSectionContent = LandingSectionContent;

// ============================================================================
// 1. SERVICES PAGE SECTIONS
// ============================================================================
export const defaultServicesSections: ExtraSectionContent[] = [
  {
    key: "services-hero",
    name: "Services Hero",
    enabled: true,
    eyebrow: "Sewa & Support Services",
    title: "Comprehensive Final Journey Support With Care & Dignity",
    subtitle: "A humanitarian initiative of Namo Gange Trust.",
    description: "Providing compassionate, end-to-end assistance including hearse vans, priest coordination, funeral samagri, prayer hall arrangements, and family support.",
    image: "/hero-images/dignity-in-every-final-journey-bg.png",
    buttonLabel: "Request Sewa Help",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Call Helpline",
    secondaryButtonHref: "tel:1800123456",
  },
  {
    key: "services-ambulance",
    name: "Ambulance & Hearse Van",
    enabled: true,
    eyebrow: "Transport Sewa",
    title: "Ambulance & Hearse Van Assistance",
    description: "24/7 dignified transport support across Delhi, Noida, Ghaziabad and NCR with trained drivers and hygienic vehicles.",
    image: "/assets/about-optimized/existimage.png",
    buttonLabel: "Book Transport",
    buttonHref: "/request-help",
    items: [
      { title: "24/7 Availability", description: "Prompt response for urgent requirements." },
      { title: "Sanitised & Equipped", description: "Hygienic, respectful transport facilities." },
      { title: "Inter-City Movement", description: "State border clearance & long-distance transport." },
    ],
  },
  {
    key: "services-funeral",
    name: "Funeral Rites & Management",
    enabled: true,
    eyebrow: "Final Rites",
    title: "Dignified Funeral & Cremation Support",
    description: "Assistance with cremation ground bookings, wood or electric rites, and complete ritual management.",
    image: "/assets/about-reference/story-ghat-temple.png",
    buttonLabel: "Learn More",
    buttonHref: "/contact",
    items: [
      { title: "Cremation Ground Slotting", description: "Coordination with electric & traditional ghats." },
      { title: "Complete Ritual Management", description: "Respectful execution as per traditions." },
    ],
  },
  {
    key: "services-pandit",
    name: "Vedic Pandit & Priest",
    enabled: true,
    eyebrow: "Spiritual Guidance",
    title: "Vedic Pandit & Priest Coordination",
    description: "Experienced Vedic priests to perform last rites, antim sanskar, and prayer ceremonies with utmost reverence.",
    image: "/assets/about-reference/who-we-are-background-v2.png",
    items: [
      { title: "Vedic Rites", description: "Customary rituals conducted with sacred precision." },
      { title: "Multilingual Support", description: "Priests versed in regional traditions and languages." },
    ],
  },
  {
    key: "services-prayer-hall",
    name: "Prayer Hall & Samagri",
    enabled: true,
    eyebrow: "Arrangements",
    title: "Prayer Hall Booking & Samagri Kit",
    description: "Providing complete eco-friendly samagri kits and arranging prayer halls for shradhanjali or chautha.",
    image: "/assets/about-reference/story-evening-ghat.png",
  },
  {
    key: "services-harsevan",
    name: "Harsevan & Transport Support",
    enabled: true,
    eyebrow: "Harsevan",
    title: "Harsevan Vehicle Support",
    description: "Specially dedicated vehicles for traditional carrying and respect during the procession.",
    image: "/assets/about-optimized/family-support.webp",
  },
  {
    key: "services-decoration",
    name: "Funeral Floral Decoration",
    enabled: true,
    eyebrow: "Floral Tributes",
    title: "Floral & Vahan Decoration",
    description: "Thoughtfully designed floral tributes and vehicle decorations to honor the memory of the departed.",
    image: "/assets/about-optimized/story-hero.png",
  },
  {
    key: "services-calling-relatives",
    name: "Calling Relatives & Assistance",
    enabled: true,
    eyebrow: "Family Coordination",
    title: "Inform Relatives & Support Center",
    description: "Assisting bereaved families with broadcast notifications, venue guidance, and relative coordination.",
    image: "/assets/about-reference/who-we-are-background-v2.png",
  },
  {
    key: "services-special",
    name: "Special Customized Services",
    enabled: true,
    eyebrow: "Custom Support",
    title: "Special Needs & Custom Assistance",
    description: "Tailored support for out-of-station families, legal documentation help, and emergency assistance.",
    image: "/assets/about-optimized/existimage.png",
  },
];

export function mergeServicesSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultServicesSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultServicesSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 2. UNCLAIMED BODY PAGE SECTIONS
// ============================================================================
export const defaultUnclaimedBodySections: ExtraSectionContent[] = [
  {
    key: "unclaimed-hero",
    name: "Unclaimed Body Hero",
    enabled: true,
    eyebrow: "Unclaimed Body Sewa",
    title: "Ensuring Final Dignity  For Every Departed Soul",
    subtitle: "A Sacred Duty Undertaken By Moksha Sewa",
    description: "Standing for those who have no one. We perform final rites for authorised unclaimed bodies after strict police & legal verification.",
    image: "/hero-images/dignity-in-every-final-journey-bg.png",
    buttonLabel: "Report Unclaimed Case",
    buttonHref: "/request-help",
  },
  {
    key: "unclaimed-what-is",
    name: "What Is Unclaimed Sewa",
    enabled: true,
    eyebrow: "Understanding The Mission",
    title: "Standing Beside The Unknown & Forgotten",
    description: "Every human life deserves a respectful farewell. Moksha Sewa coordinates with local police and hospital authorities to perform sacred rites.",
    image: "/assets/about-optimized/a_mission.png",
  },
  {
    key: "unclaimed-dignity-first",
    name: "Dignity Comes First",
    enabled: true,
    eyebrow: "Core Value",
    title: "Humanity Beyond Circumstance",
    description: "We handle every single body with sacred rituals, fresh garments, flowers and complete respect, regardless of identity or background.",
    image: "/assets/about-optimized/existimage.png",
  },
  {
    key: "unclaimed-process",
    name: "Verification & Legal Process",
    enabled: true,
    eyebrow: "Systematic Verification",
    title: "Strict Authorisation & Protocol",
    description: "Support is only initiated after statutory waiting periods, police clearance certificates, and official hospital handovers.",
    items: [
      { title: "Police Clearance", description: "Official NOC and NOC document verification." },
      { title: "Hospital Coordination", description: "Proper post-mortem and identity documentation check." },
      { title: "Sacred Rites Execution", description: "Final cremation performed with full spiritual rites." },
    ],
  },
  {
    key: "unclaimed-final-journey",
    name: "Final Journey Support",
    enabled: true,
    eyebrow: "Full Execution",
    title: "From Mortuary To Sacred Ghats",
    description: "End-to-end execution managed by verified volunteers and dedicated coordinators.",
    image: "/assets/about-reference/story-ghat-temple.png",
  },
  {
    key: "unclaimed-organisation",
    name: "Organisation Behind Mission",
    enabled: true,
    eyebrow: "Institutional Backing",
    title: "Namo Gange Trust Framework",
    description: "Operating under transparent governance and institutional guidelines.",
    image: "/assets/logo-moksha-seva.png",
  },
  {
    key: "unclaimed-faq",
    name: "Unclaimed Body FAQ",
    enabled: true,
    eyebrow: "Questions & Answers",
    title: "Frequently Asked Questions",
    description: "Clarifications regarding legal permissions, reporting process, and volunteer involvement.",
    items: [
      { title: "Who can report an unclaimed body?", description: "Hospital authorities, police officers, or verified social workers can notify us." },
      { title: "Is police permission mandatory?", description: "Yes, 100% legal verification and police authorization is required before any action." },
    ],
  },
  {
    key: "unclaimed-request",
    name: "Request Unclaimed Case Support",
    enabled: true,
    eyebrow: "Official Channel",
    title: "Notify Our Emergency Unclaimed Desk",
    description: "Contact our dedicated coordination team for prompt case assistance.",
    buttonLabel: "Submit Request",
    buttonHref: "/request-help",
  },
];

export function mergeUnclaimedBodySections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultUnclaimedBodySections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultUnclaimedBodySections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 3. VOLUNTEER PAGE SECTIONS
// ============================================================================
export const defaultVolunteerSections: ExtraSectionContent[] = [
  {
    key: "volunteer-hero",
    name: "Volunteer Hero",
    enabled: true,
    eyebrow: "Be Part Of The Sewa",
    title: "Offer Your Time & Heart to Serve the Final Journey",
    subtitle: "Join a Dedicated Network of Compassionate Citizens",
    description: "Volunteers are the backbone of Moksha Sewa. Help coordinate transport, support grieving families, or assist during last rites.",
    image: "/assets/about-optimized/volunteer.png",
    buttonLabel: "Register As Volunteer",
    buttonHref: "/volunteer/register",
  },
  {
    key: "volunteer-code",
    name: "Volunteer Code of Conduct",
    enabled: true,
    eyebrow: "Responsibility & Ethics",
    title: "Principles That Guide Every Moksha Volunteer",
    description: "We uphold strict standards of empathy, privacy, dignity, and zero commercial interest in all our activities.",
    items: [
      { title: "Empathetic Conduct", description: "Be respectful and patient with grieving families." },
      { title: "Confidentiality", description: "Protect family privacy and sensitive details at all times." },
      { title: "No Financial Transactions", description: "Volunteers never accept cash or gifts directly." },
    ],
  },
  {
    key: "volunteer-dashboard",
    name: "Volunteer Roles & System",
    enabled: true,
    eyebrow: "Flexible Ways To Help",
    title: "Choose How You Wish To Serve",
    description: "Whether on-field, on-call for emergencies, or assisting with administrative documentation, every contribution counts.",
    items: [
      { title: "Field Support", description: "Assist on ground during transport and ghat ceremonies." },
      { title: "On-Call Emergency", description: "Available for urgent calls in your local area." },
      { title: "Family Coordination", description: "Provide guidance and emotional comfort." },
    ],
  },
  {
    key: "volunteer-register",
    name: "Volunteer Registration Form Section",
    enabled: true,
    eyebrow: "Get Started Today",
    title: "Complete Your Volunteer Profile",
    description: "Fill out the registration form to be verified and added to our active volunteer roster.",
    buttonLabel: "Submit Registration",
    buttonHref: "/volunteer/register",
  },
];

export function mergeVolunteerSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultVolunteerSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultVolunteerSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 4. PARTNERSHIP PAGE SECTIONS
// ============================================================================
export const defaultPartnershipSections: ExtraSectionContent[] = [
  {
    key: "partnership-hero",
    name: "Partnership Hero",
    enabled: true,
    eyebrow: "Collaborate With Us",
    title: "Partnering To Expand Dignified Last Rites Across Regions",
    subtitle: "Hospitals, NGOs, Municipalities & Social Organizations",
    description: "Join hands with Moksha Sewa to streamline unclaimed body handling, ambulance networks, and subsidised family support.",
    image: "/assets/about-optimized/partner-with-us.png",
    buttonLabel: "Become A Partner",
    buttonHref: "#partner-form",
  },
  {
    key: "partnership-process",
    name: "How Partnership Works",
    enabled: true,
    eyebrow: "Seamless Integration",
    title: "A Transparent & Structured Collaboration Model",
    description: "From MoU signing to real-time case tracking, we ensure accountability and complete compliance.",
    items: [
      { title: "Institutional MoU", description: "Formal agreement outlining roles and ethical guidelines." },
      { title: "Dedicated Desk", description: "Direct helpline & case manager assigned for partners." },
      { title: "Transparent Audit", description: "Regular reporting and case verification logs." },
    ],
  },
  {
    key: "partnership-responsibility",
    name: "Institutional Responsibility",
    enabled: true,
    eyebrow: "Accountability First",
    title: "High Standards Of Compliance & Ethics",
    description: "Every partnership operates within strict legal permissions and transparent auditing frameworks.",
    image: "/assets/about-optimized/existimage.png",
  },
  {
    key: "partnership-network",
    name: "Partnership Network",
    enabled: true,
    eyebrow: "Our Ecosystem",
    title: "Building A Compassionate Network",
    description: "Connecting hospitals, mortuaries, police departments, cremation grounds, and ground volunteers.",
  },
  {
    key: "partnership-enquiry",
    name: "Partnership Form Section",
    enabled: true,
    eyebrow: "Reach Out",
    title: "Submit Your Partnership Proposal",
    description: "Fill in your institution details and our team will get in touch shortly.",
  },
  {
    key: "partnership-faq",
    name: "Partnership FAQ",
    enabled: true,
    eyebrow: "Questions",
    title: "Partnership FAQs",
    items: [
      { title: "What type of organizations can partner?", description: "Hospitals, Municipal Bodies, Police Depts, NGOs, and Cremation Trusts." },
    ],
  },
  {
    key: "partnership-cta",
    name: "Partnership Final CTA",
    enabled: true,
    eyebrow: "Join Hands",
    title: "Ready To Make A Difference Together?",
    buttonLabel: "Contact Partner Cell",
    buttonHref: "/contact",
  },
];

export function mergePartnershipSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultPartnershipSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPartnershipSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 5. CSR PAGE SECTIONS
// ============================================================================
export const defaultCSRSections: ExtraSectionContent[] = [
  {
    key: "csr-hero",
    name: "CSR Hero",
    enabled: true,
    eyebrow: "Corporate Social Responsibility",
    title: "Empower Dignified Final Rites Support Through Corporate CSR",
    subtitle: "Fulfilling Social Impact With Complete Tax Exemption & Audits",
    description: "Partner with Namo Gange Trust's Moksha Sewa initiative to sponsor hearse vans, cremation kits, and unclaimed body rites.",
    image: "/assets/about-optimized/csr-image.webp",
    buttonLabel: "Explore CSR Proposal",
    buttonHref: "#csr-form",
  },
  {
    key: "csr-support-journey",
    name: "CSR Support Journey",
    enabled: true,
    eyebrow: "Impact & Journey",
    title: "How Corporate Funding Restores Human Dignity",
    description: "Track how your CSR contribution directly touches lives and ensures dignified farewells.",
  },
  {
    key: "csr-compliance",
    name: "Compliance & 80G Tax Exemption",
    enabled: true,
    eyebrow: "100% Tax Benefit",
    title: "80G & 12A Certified Legal Compliance",
    description: "All corporate donations receive tax deduction benefits under Section 80G with audited utilization certificates.",
    items: [
      { title: "80G & 12A Registered", description: "Tax-exempt receipts provided for every contribution." },
      { title: "CSR Form 1 Compliant", description: "Registered for MCA CSR activities." },
      { title: "Impact Reports", description: "Detailed monthly/quarterly execution reports." },
    ],
  },
  {
    key: "csr-responsibility",
    name: "Institutional Governance",
    enabled: true,
    eyebrow: "Governance",
    title: "Transparent Financial Management & Oversight",
    description: "Governed under the established framework of Namo Gange Trust with independent third-party audits.",
  },
  {
    key: "csr-models",
    name: "CSR Engagement Models",
    enabled: true,
    eyebrow: "Custom Models",
    title: "Flexible Sponsorship & Grant Programs",
    description: "Sponsor a Hearse Van, adopt a cremation zone, or fund unclaimed body support campaigns.",
    items: [
      { title: "Hearse Van Sponsorship", description: "Branded vehicle dedicated to free service." },
      { title: "Unclaimed Rites Fund", description: "Sponsor monthly unclaimed body rites." },
      { title: "E-Crematorium Support", description: "Eco-friendly woodless cremation adoption." },
    ],
  },
  {
    key: "csr-enquiry",
    name: "CSR Enquiry Form Section",
    enabled: true,
    eyebrow: "Corporate Inquiry",
    title: "Connect With Our CSR Leadership Team",
    description: "Share your company's CSR priorities and we will create a tailored proposal.",
  },
  {
    key: "csr-cta",
    name: "CSR Final Call To Action",
    enabled: true,
    eyebrow: "Take Action",
    title: "Make Final Journey Dignity Part Of Your Corporate Legacy",
    buttonLabel: "Request Proposal",
    buttonHref: "#csr-form",
  },
];

export function mergeCSRSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultCSRSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultCSRSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 6. REQUEST HELP PAGE SECTIONS
// ============================================================================
export const defaultRequestHelpSections: ExtraSectionContent[] = [
  {
    key: "request-help-hero",
    name: "Request Help Hero",
    enabled: true,
    eyebrow: "Emergency Assistance",
    title: "Request Immediate Moksha Sewa Assistance",
    subtitle: "We Are Here To Stand Beside You In Your Hour Of Need",
    description: "24/7 helpline and quick assistance form for urgent ambulance, cremation, or priest support.",
    image: "/assets/about-optimized/existimage.png",
    buttonLabel: "Call Helpline Now",
    buttonHref: "tel:1800123456",
  },
  {
    key: "request-help-form",
    name: "Request Form Details",
    enabled: true,
    eyebrow: "Submit Details",
    title: "Assistance Application & Verification Form",
    description: "Please fill in accurate information to help our emergency coordinators dispatch prompt support.",
  },
  {
    key: "request-help-faq",
    name: "Request Help FAQ",
    enabled: true,
    eyebrow: "Quick Answers",
    title: "Need Quick Clarity?",
    items: [
      { title: "How fast is the response?", description: "Emergency requests are reviewed immediately upon call or submission." },
      { title: "Is there any cost involved?", description: "Support is subsidized or free for verified needy families & unclaimed cases." },
    ],
  },
];

export function mergeRequestHelpSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultRequestHelpSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultRequestHelpSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 7. DONATION PAGE SECTIONS
// ============================================================================
export const defaultDonationSections: ExtraSectionContent[] = [
  {
    key: "donation-hero",
    name: "Donation Hero",
    enabled: true,
    eyebrow: "Support The Mission",
    title: "Your Contribution Restores Sacred Dignity To Human Life",
    subtitle: "100% Tax Exempted Under Section 80G",
    description: "Support free ambulance movement, woodless cremation, priest samagri kits, and unclaimed body rites.",
    image: "/assets/about-optimized/support_the_mission.png",
    buttonLabel: "Donate Now",
    buttonHref: "#donation-form",
  },
  {
    key: "donation-causes",
    name: "Donation Causes",
    enabled: true,
    eyebrow: "Choose A Cause",
    title: "Direct Impact Causes You Can Support",
    description: "Select specific areas of service to direct your donation.",
    items: [
      { title: "Unclaimed Body Cremation", description: "Sponsor full rites for an authorized unclaimed case." },
      { title: "Ambulance Fuel & Maintenance", description: "Keep emergency hearse vans running 24/7." },
      { title: "Annadan & Family Support", description: "Provide meals and guidance to destitute families." },
    ],
  },
  {
    key: "donation-tax-benefit",
    name: "80G Tax Exemption Info",
    enabled: true,
    eyebrow: "Tax Benefits",
    title: "Save Tax While Serving Humanity",
    description: "Instant 80G tax exemption receipts generated automatically upon successful payment.",
  },
];

export function mergeDonationSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultDonationSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultDonationSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 8. CONTACT PAGE SECTIONS
// ============================================================================
export const defaultContactSections: ExtraSectionContent[] = [
  {
    key: "contact-hero",
    name: "Contact Hero",
    enabled: true,
    eyebrow: "Contact Us",
    title: "We Are Here To Assist You 24 Hours A Day",
    subtitle: "Reach Out For Help, Inquiries, Or Volunteer Guidance",
    description: "Connect with our central coordination desk in Delhi NCR via phone, email, or office visit.",
    image: "/assets/about-reference/who-we-are-background-v2.png",
    phoneLabel: "24/7 Helpline",
    phoneNumber: "1800123456",
    contactEmail: "info@mokshasewa.org",
    contactAddress: "Namo Gange Trust, Delhi • Ghaziabad • Noida",
  },
  {
    key: "contact-info",
    name: "Contact Info & Channels",
    enabled: true,
    eyebrow: "Direct Contact",
    title: "Our Operational Desks",
    description: "Get in touch with specific departments directly.",
    items: [
      { title: "Emergency Helpline", description: "Available 24x7 for immediate support." },
      { title: "Volunteer Desk", description: "For volunteer onboarding and queries." },
      { title: "CSR & Partner Desk", description: "For institutional collaborations." },
    ],
  },
  {
    key: "contact-form",
    name: "Contact Form Section",
    enabled: true,
    eyebrow: "Send Message",
    title: "Leave Us A Message",
    description: "Fill out the contact form and our team will respond within 2 hours.",
  },
  {
    key: "contact-faq",
    name: "Contact FAQ",
    enabled: true,
    eyebrow: "Helpful Info",
    title: "Common Inquiries",
    items: [
      { title: "Where are services available?", description: "Currently serving Delhi, Ghaziabad, Noida and surrounding NCR areas." },
    ],
  },
];

export function mergeContactSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultContactSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultContactSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 9. TRACK PAGE SECTIONS
// ============================================================================
export const defaultTrackSections: ExtraSectionContent[] = [
  {
    key: "track-hero",
    name: "Track Status Hero",
    enabled: true,
    eyebrow: "Track Status",
    title: "Track Case Or Request Progress In Real-Time",
    subtitle: "Transparent & Accountable Verification System",
    description: "Enter your Request Number or Case ID to view live verification, volunteer assignment, and completion status.",
    image: "/assets/about-optimized/existimage.png",
  },
  {
    key: "track-info",
    name: "Track Info & Guidance",
    enabled: true,
    eyebrow: "How It Works",
    title: "Complete Transparency At Every Milestone",
    description: "Every step is logged from initial intake to final certificate upload.",
  },
];

export function mergeTrackSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultTrackSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultTrackSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}
