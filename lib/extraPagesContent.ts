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
    title: "Ensuring Final Dignity\nFor Every Departed Soul",
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
    items: [
      { description: "Support proceeds only after the required verification and authorisation from the competent authority." },
      { description: "Police, hospital, municipal and legal procedures must be completed wherever applicable." },
      { description: "Case information and documents are handled responsibly, with privacy and dignity." },
    ],
  },
  {
    key: "unclaimed-process",
    name: "The Sewa Process",
    enabled: true,
    eyebrow: "The Sewa Process",
    title: "How Unclaimed Body Sewa Works",
    description: "",
    items: [
      { title: "Case Referral", description: "Case details are received from an appropriate or verifiable source." },
      { title: "Verification & Authorisation", description: "Available case information, documentation and required authorisation are reviewed before assistance is undertaken." },
      { title: "Sewa Coordination", description: "Eligible assistance is coordinated according to case requirements, applicable process and available resources." },
      { title: "Dignified Final Journey", description: "Approved support is provided with sensitivity, dignity and respect." },
    ],
  },
  {
    key: "unclaimed-final-journey",
    name: "Sewa Support",
    enabled: true,
    eyebrow: "Sewa Support",
    title: "Support for a Dignified Final Journey",
    description: "Depending on the verified case, applicable requirements and available resources, assistance may include:",
    image: "",
    items: [
      { title: "Final-Journey Transport", description: "Appropriate transport coordination where required and permitted." },
      { title: "Cremation & Last-Rites Coordination", description: "Support with eligible final-journey arrangements." },
      { title: "Ritual Essentials", description: "Basic materials required for final rites where applicable." },
      { title: "Priest / Ritual Coordination", description: "Appropriate ritual guidance or coordination where relevant." },
      { title: "On-Ground Sewa", description: "Compassionate presence and practical coordination during the final journey." },
    ],
  },
  {
    key: "unclaimed-dignity-first",
    name: "Sewa With Responsibility",
    enabled: true,
    eyebrow: "Sewa With Responsibility",
    title: "Dignity Comes First.",
    description: "Humanitarian support during a final journey requires sensitivity, privacy and responsible processes.",
    image: "",
    items: [
      { title: "Authorised Support", description: "Required legal and administrative clearances are verified before eligible assistance proceeds." },
      { title: "Privacy & Respect", description: "Sensitive case information is handled responsibly, privately and with dignity at every stage." },
      { title: "Responsible Documentation", description: "Relevant case and activity records are maintained where applicable for clear accountability." },
      { title: "No Exploitation", description: "Human dignity always takes priority over publicity, promotion or unnecessary public exposure." },
    ],
  },
  {
    key: "unclaimed-organisation",
    name: "Organisation Behind Mission",
    enabled: true,
    eyebrow: "Namo Gange Trust",
    title: "The Organisation Behind Moksha Sewa",
    description: "A Humanitarian Initiative of Namo Gange Trust.",
    image: "/assets/logo-moksha-seva.png",
    items: [
      { title: "Governance", description: "Ethical leadership and transparent processes at every step." },
      { title: "Social Service", description: "Working for community welfare and meaningful social impact." },
      { title: "Humanitarian Action", description: "Compassionate action for people who need timely support." },
      { title: "Responsible Sewa", description: "Dignity-first support with accountability and care." },
    ],
  },
  {
    key: "unclaimed-faq",
    name: "Unclaimed Body FAQ",
    enabled: true,
    eyebrow: "Help & Information",
    title: "Frequently Asked Questions",
    description: "About Unclaimed Body Sewa",
    items: [
      { title: "What is an unclaimed body?", description: "The legal or administrative status of a deceased person is determined by competent authorities under applicable procedures. Moksha Sewa does not independently declare a body to be unclaimed." },
      { title: "Who can request Unclaimed Body Sewa?", description: "Hospital authorities, police officers, or verified social workers can notify us." },
      { title: "What documents or authorisation may be required?", description: "Police clearance certificates, official hospital handovers, and statutory waiting periods are verified." },
      { title: "What support can Moksha Sewa provide?", description: "Final-journey transport, cremation coordination, and basic ritual materials." },
      { title: "Does Moksha Sewa declare a body legally unclaimed?", description: "No, we do not declare bodies as unclaimed. We only assist cases authorised by competent authorities." },
      { title: "Where is Unclaimed Body Sewa currently available?", description: "Please contact our coordination desk for availability in your region." },
    ],
  },
  {
    key: "unclaimed-request",
    name: "Request Unclaimed Case Support",
    enabled: true,
    eyebrow: "Need Assistance With",
    title: "an Unclaimed Body Case?",
    description: "Share the available details so our team can understand the situation and review the appropriate next step.\nIf the matter is currently with a hospital, police station or other competent authority, please complete the applicable official process and obtain the required authorisation before final-journey assistance can proceed.",
    buttonLabel: "Submit Sewa Request",
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

// Generated Services Content
export const defaultAmbulanceSections: ExtraSectionContent[] = [
  {
    key: "ambulance-hero",
    name: "Ambulance Hero",
    enabled: true,
    eyebrow: "24×7 Last Journey Support",
    title: "Ambulance & Hearse\nSupport with Dignity",
    description: "Namo Gange coordinates ambulance and hearse support for eligible last-journey cases with dignified transfer, calm guidance and timely assistance, subject to verification and availability.",
    image: "/ambulance/hero-ambulance.webp",
    buttonLabel: "Call for Ambulance",
    buttonHref: "tel:+919654900525",
    secondaryButtonLabel: "Request Support",
    secondaryButtonHref: "/request-help",
    bottomStatement: "Serving families with compassion, respect and timely support.",
  },
  {
    key: "ambulance-highlights",
    name: "Ambulance Highlights",
    enabled: true,
    items: [
      { title: "24/7 Availability", description: "Always here, day or night. Whenever you need us.", label: "clock" },
      { title: "Respectful Transport", description: "Dignified ambulance and hearse van for last journey.", label: "ambulance" },
      { title: "Trained Support Team", description: "Compassionate and skilled team you can trust.", label: "team" },
      { title: "Fast Response", description: "Quick response to reach you as soon as possible.", label: "timer" }
    ],
  },
  {
    key: "ambulance-how-it-works",
    name: "Ambulance How It Works",
    enabled: true,
    title: "How It Works",
    items: [
      { title: "Call or Request", description: "Contact us anytime by call or request online.", label: "phone" },
      { title: "We Respond", description: "Our team reaches you quickly.", label: "ambulance" },
      { title: "We Assist", description: "We handle transport and support with care.", label: "hands" },
      { title: "Dignified Last Journey", description: "We ensure a respectful and peaceful last journey.", label: "leaf" }
    ],
  },
  {
    key: "ambulance-support",
    name: "Ambulance Support Section",
    enabled: true,
    title: "We Stand With You\nWhen It Matters Most",
    description: "In your most difficult moments, we stand beside you. Our ambulance and hearse support services are designed to bring relief, care and dignity.",
    image: "/ambulance/family-support.webp",
    items: [
      { title: "Ambulance for emergency & non-emergency transfer" },
      { title: "Hearse van for last journey with full respect" },
      { title: "Help with basic coordination & arrangements" },
      { title: "Respectful support at the ghat and during rituals" }
    ],
    buttonLabel: "We Are Here For You",
    buttonHref: "tel:+919654900525",
    secondaryDescription: "Support team standing with a family",
  },
  {
    key: "ambulance-stories",
    name: "Ambulance Stories",
    enabled: true,
    items: [
      { title: "Always Ready", description: "Ambulance available 24×7 at all locations.", image: "/ambulance/story-always-ready.webp", label: "clock" },
      { title: "Careful & Respectful", description: "Trained team ensures safe and dignified transfer.", image: "/ambulance/story-respectful-transfer.webp", label: "hands" },
      { title: "Compassionate Support", description: "We stand with families with empathy and care.", image: "/ambulance/story-family-care.webp", label: "family" }
    ],
  },
  {
    key: "ambulance-receive",
    name: "Ambulance What Families Receive",
    enabled: true,
    title: "What Families Receive",
    items: [
      { title: "Ambulance Support", description: "24×7 ambulance service for quick and safe transfer.", label: "ambulance" },
      { title: "Hearse Van Support", description: "Dignified hearse van for last journey transport.", label: "ambulance" },
      { title: "Ritual Coordination", description: "Basic ritual support and puja samagri assistance.", label: "ritual" },
      { title: "On-Ground Assistance", description: "Help with ghat entry, arrangements & support.", label: "team" },
      { title: "Emergency Contact Support", description: "Dedicated helpline for immediate guidance.", label: "phone" }
    ],
  },
  {
    key: "ambulance-trust",
    name: "Ambulance Why Families Trust Us",
    enabled: true,
    title: "Why Families Trust Namo Gange",
    items: [
      { title: "Sewa with Respect", description: "24×7 service with dignity and care.", label: "leaf" },
      { title: "Trusted by Families", description: "Thousands of families trust our sewa.", label: "family" },
      { title: "Transparent & Honest", description: "No hidden charges. Complete transparency.", label: "shield" },
      { title: "Wide Service Network", description: "Help across Delhi • Ghaziabad • Noida and nearby regions.", label: "pin" },
      { title: "End-to-End Support", description: "From first call to final ritual support.", label: "support" }
    ],
  },
  {
    key: "ambulance-donation",
    name: "Ambulance Donation CTA",
    enabled: true,
    title: "Your Donation Brings Peace",
    description: "Your kind contribution helps us provide ambulance, hearse and last-journey support to families who cannot afford it. Together, we can bring comfort, dignity and peace in their most difficult moments.",
    image: "/assets/km.jpeg",
    buttonLabel: "Donate for Ambulance Service",
    buttonHref: "/donation",
    secondaryButtonLabel: "Support Our Sewa",
    secondaryButtonHref: "tel:+919654900525",
    secondaryTitle: "Every\nContribution\nBrings Peace",
  },
];

export function mergeAmbulanceSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultAmbulanceSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultAmbulanceSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultPanditSections: ExtraSectionContent[] = [
  {
    key: "pandit-hero",
    name: "Pandit Hero",
    enabled: true,
    title: "Priest Support",
    subtitle: "For a Dignified Final Journey.",
    description: "Experienced Pandit Ji's guide your family with compassion, clarity and reverence in every sacred ritual of your loved one's journey.",
    image: "/assets/panditservices/hero-real.png",
    buttonLabel: "Request Priest Support",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Donate for Ritual Support",
    secondaryButtonHref: "/donation",
  },
  {
    key: "pandit-highlights",
    name: "Pandit Highlights",
    enabled: true,
    items: [
      { title: "Experienced Pandit Ji", description: "Learned and compassionate guidance", image: "/assets/panditservices/feature-pandit.png" },
      { title: "Vedic Guidance", description: "Guidance based on Hindu traditions", image: "/assets/panditservices/feature-vedic.png" },
      { title: "Ritual Planning", description: "Complete ritual planning and coordination", image: "/assets/panditservices/feature-planning.png" },
      { title: "Regional Traditions", description: "Rituals according to family customs", image: "/assets/panditservices/feature-traditions.png" }
    ],
  },
  {
    key: "pandit-how-it-works",
    name: "Pandit How It Works",
    enabled: true,
    title: "How It Works",
    items: [
      { title: "Call or Request Support", label: "phone" },
      { title: "Pandit Ji Consultation", label: "team" },
      { title: "Ritual Arrangement", label: "hands" },
      { title: "Guidance Through Every Ceremony", label: "hands" }
    ],
  },
  {
    key: "pandit-support",
    name: "Pandit Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "pandit-stories",
    name: "Pandit Stories",
    enabled: true,
    title: "Ritual Support at Every Step",
    items: [
      { title: "Pre-Ritual Consultation", image: "/assets/panditservices/ritual-1.png" },
      { title: "Antim Sanskar Vidhi", image: "/assets/panditservices/ritual-2.png" },
      { title: "Mukhagni Guidance", image: "/assets/panditservices/ritual-3.png" },
      { title: "Asthi Visarjan", image: "/assets/panditservices/ritual-4.png" },
      { title: "Pind Daan", image: "/assets/panditservices/ritual-5.png" },
      { title: "Tehrvi & Shanti Paath", image: "/assets/panditservices/ritual-6.png" }
    ],
  },
  {
    key: "pandit-receive",
    name: "Pandit What Families Receive",
    enabled: true,
    title: "Pandit Ji Roles",
    items: [
      { title: "Samagri Guidance", description: "Right samagri for every sacred ritual.", image: "/assets/panditservices/roles-1.png" },
      { title: "Prayer Hall Ceremony", description: "Rituals conducted with peace and reverence.", image: "/assets/panditservices/roles-2.png" },
      { title: "Family Ritual Explanation", description: "Simple guidance at every sacred step.", image: "/assets/panditservices/roles-3.png" },
      { title: "Post-Ritual Support", description: "Guidance for remaining rituals and timelines.", image: "/assets/panditservices/roles-4.png" }
    ],
  },
  {
    key: "pandit-trust",
    name: "Pandit Why Families Trust Us",
    enabled: true,
    title: "Why Families Trust Us",
    items: [
      { title: "Compassionate Guidance", description: "Care, sensitivity and respect in every moment.", label: "heart" },
      { title: "Authentic Hindu Rituals", description: "Rituals performed according to Shastra and tradition.", label: "om" },
      { title: "Support Beyond Ceremony", description: "Continued spiritual guidance after the ceremony.", label: "handshake" }
    ],
  },
  {
    key: "pandit-donation",
    name: "Pandit Donation CTA",
    enabled: true,
    title: "Your Support Helps Families Receive Dignified & Sacred Final Rites",
    description: "Every act of kindness becomes a blessing for many.",
    image: "/assets/panditservices/hero.png",
    buttonLabel: "Donate for Ritual Support",
    buttonHref: "/donation",
  },
];

export function mergePanditSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultPanditSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPanditSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultFuneralSections: ExtraSectionContent[] = [
  {
    key: "funeral-hero",
    name: "Funeral Hero",
    enabled: true,
    title: "Wood & Ritual Items",
    subtitle: "Arranged With Deep Respect.",
    description: "At Moksha Sewa, we understand the financial and emotional burden of the final rites. We help eligible families coordinate cremation wood, shroud cloth (Kafan), flowers, lamps, and essential prayer items subject to verification and availability.",
    image: "/woodrituals/hero.webp",
    buttonLabel: "Request Wood & Items",
    buttonHref: "/request-help",
  },
  {
    key: "funeral-highlights",
    name: "Funeral Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "funeral-how-it-works",
    name: "Funeral How It Works",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "funeral-support",
    name: "Funeral Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "funeral-stories",
    name: "Funeral Stories",
    enabled: true,
    items: [],
  },
  {
    key: "funeral-receive",
    name: "Funeral What Families Receive",
    enabled: true,
    title: "What We Arrange",
    items: [
      { title: "Cremation Wood", description: "We provide sufficient dry wood required for a complete and respectful cremation ceremony, subject to verification and availability.", image: "/woodrituals/cremation-wood.webp" },
      { title: "Shroud & Flowers", description: "Pure white shroud cloth, garlands and fresh flowers are arranged carefully to honour the departed soul with dignity and purity.", image: "/woodrituals/shroud-flowers.webp" },
      { title: "Prayer Items", description: "Ghee, sandalwood, incense, earthen lamps and essential Pooja Samagri are carefully arranged for the final rites and prayers.", image: "/woodrituals/prayer-items.webp" }
    ],
  },
  {
    key: "funeral-trust",
    name: "Funeral Why Families Trust Us",
    enabled: true,
    title: "“We believe that no family should have to worry about the expenses of a final farewell while grieving the loss of their loved one.”",
    description: "Our volunteers work tirelessly to ensure that every necessary item reaches the cremation ground on time. You mourn in peace, let us handle the arrangements.",
    items: [],
  },
  {
    key: "funeral-donation",
    name: "Funeral Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeFuneralSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultFuneralSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultFuneralSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultFuneralDecorationSections: ExtraSectionContent[] = [
  {
    key: "funeralDecoration-hero",
    name: "Funeral Decoration Hero",
    enabled: true,
    title: "Funeral Decoration",
    subtitle: "A Beautiful Final Journey.",
    description: "We believe in bidding farewell with utmost respect and serenity. Our volunteers arrange traditional floral decorations for the hearse van, pyre, and prayer hall using fresh and sacred flowers to honor the departed soul.",
    image: "/assets/how-we-help/three.png",
    buttonLabel: "Request Decoration",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919999999999",
  },
  {
    key: "funeralDecoration-highlights",
    name: "Funeral Decoration Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "funeralDecoration-how-it-works",
    name: "Funeral Decoration How It Works",
    enabled: true,
    title: "Our Decoration Services",
    items: [
      { title: "Hearse Van Decoration", description: "Elegant and respectful floral decoration for the ambulance or hearse van, creating a dignified setting for the final journey.", label: "florist" },
      { title: "Pyre & Pathway Setup", description: "Fresh flowers and sacred leaves are arranged around the cremation area to create a peaceful and respectful environment.", label: "leaf" },
      { title: "Prayer Hall Serenity", description: "Calming floral arrangements for the Shanti Path and prayer area, creating a serene atmosphere for family and grieving guests.", label: "nature" }
    ],
  },
  {
    key: "funeralDecoration-support",
    name: "Funeral Decoration Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "funeralDecoration-stories",
    name: "Funeral Decoration Stories",
    enabled: true,
    items: [],
  },
  {
    key: "funeralDecoration-receive",
    name: "Funeral Decoration What Families Receive",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "funeralDecoration-trust",
    name: "Funeral Decoration Why Families Trust Us",
    enabled: true,
    title: "&quot;Flowers speak the language of peace, honoring a beautiful life that has moved on.&quot;",
    description: "Our volunteers carefully handpick fresh flowers, ensuring the final journey of your loved one is surrounded by purity, respect, and unconditional love.",
    items: [],
  },
  {
    key: "funeralDecoration-donation",
    name: "Funeral Decoration Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeFuneralDecorationSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultFuneralDecorationSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultFuneralDecorationSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultPrayerHallSections: ExtraSectionContent[] = [
  {
    key: "prayerHall-hero",
    name: "Prayer Hall Hero",
    enabled: true,
    title: "Ground & Prayer Support",
    subtitle: "Creating A Space For Peace.",
    description: "Finding the right place to grieve and pray is essential. We assist with cremation-ground coordination, setting up serene prayer halls, and providing calm guidance for the entire family.",
    image: "/assets/prayerhallservices/hero-real.png",
    buttonLabel: "Request Support",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Donate for Support",
    secondaryButtonHref: "/donation",
  },
  {
    key: "prayerHall-highlights",
    name: "Prayer Hall Highlights",
    enabled: true,
    items: [
      { title: "Ground Coordination", description: "Seamless coordination with ground staff and family members.", image: "/assets/prayerhallservices/feature-ground.png" },
      { title: "Prayer Setup", description: "Serene prayer arrangements prepared with care and respect.", image: "/assets/prayerhallservices/feature-setup.png" },
      { title: "Family Support", description: "Gentle guidance and assistance for family members throughout.", image: "/assets/prayerhallservices/feature-family.png" },
      { title: "Peaceful Environment", description: "A calm and respectful space for prayer, mourning and remembrance.", image: "/assets/prayerhallservices/feature-peace.png" }
    ],
  },
  {
    key: "prayerHall-how-it-works",
    name: "Prayer Hall How It Works",
    enabled: true,
    title: "How It Works",
    items: [
      { title: "Call or Request Support", label: "phone" },
      { title: "Ground Coordination", label: "building" },
      { title: "Prayer Hall Setup", label: "florist" },
      { title: "Guidance During Ceremony", label: "hands" }
    ],
  },
  {
    key: "prayerHall-support",
    name: "Prayer Hall Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "prayerHall-stories",
    name: "Prayer Hall Stories",
    enabled: true,
    title: "Our Complete Support",
    items: [
      { title: "Ground Booking", image: "/assets/prayerhallservices/support-1.png" },
      { title: "Floral Setup", image: "/assets/prayerhallservices/support-2.png" },
      { title: "Seating Arrangements", image: "/assets/prayerhallservices/support-3.png" },
      { title: "Audio & Mic Setup", image: "/assets/prayerhallservices/support-4.png" },
      { title: "Pandit Ji Coordination", image: "/assets/prayerhallservices/support-5.png" },
      { title: "Guest Management", image: "/assets/prayerhallservices/support-6.png" }
    ],
  },
  {
    key: "prayerHall-receive",
    name: "Prayer Hall What Families Receive",
    enabled: true,
    title: "Ground Support Roles",
    items: [
      { title: "Venue Coordination", description: "Suitable venue coordination for every sacred ritual.", image: "/assets/prayerhallservices/roles-1.png" },
      { title: "Setup & Decor", description: "Peaceful arrangements prepared with care and dignity.", image: "/assets/prayerhallservices/roles-2.png" },
      { title: "Guest Assistance", description: "Clear and compassionate guidance for guests at every step.", image: "/assets/prayerhallservices/roles-3.png" },
      { title: "Post-Prayer Cleanup", description: "Respectful clearing and coordination after rituals conclude.", image: "/assets/prayerhallservices/roles-4.png" }
    ],
  },
  {
    key: "prayerHall-trust",
    name: "Prayer Hall Why Families Trust Us",
    enabled: true,
    title: "Why Families Trust Us",
    items: [
      { title: "Compassionate Guidance", description: "Care, sensitivity and respect in every moment.", label: "heart" },
      { title: "Authentic Arrangements", description: "Setups tailored carefully to Shastra and family traditions.", label: "om" },
      { title: "Support Beyond Ceremony", description: "Continued guidance and support even after the ceremony.", label: "handshake" }
    ],
  },
  {
    key: "prayerHall-donation",
    name: "Prayer Hall Donation CTA",
    enabled: true,
    title: "Your Support Helps Families Receive Dignified & Sacred Final Rites",
    description: "Every act of kindness becomes a blessing for many.",
    image: "/assets/prayerhallservices/hero.png",
    buttonLabel: "Donate for Support",
    buttonHref: "/donation",
  },
];

export function mergePrayerHallSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultPrayerHallSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPrayerHallSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultSpecialServiceSections: ExtraSectionContent[] = [
  {
    key: "specialService-hero",
    name: "Special Service Hero",
    enabled: true,
    eyebrow: "Extended Family Support",
    title: "Family Support",
    subtitle: "Standing Beside You.",
    description: "Beyond the final rites, Moksha Sewa helps eligible families with case-based guidance, relief coordination and compassionate support, subject to verification and availability.",
    image: "/assets/family-support/hero-bg-2.png",
    buttonLabel: "Request Support",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919220147229",
  },
  {
    key: "specialService-highlights",
    name: "Special Service Highlights",
    enabled: true,
    items: [
      { title: "Emotional Support", description: "Counseling and a sympathetic ear for grieving families.", image: "/assets/serving/counseling-support.png" },
      { title: "Tehravi Khana", description: "Respectful management of the 13th-day meal for grieving families.", image: "/assets/serving/food-essentials.png" },
      { title: "Formalities", description: "Help with death certificates and important legal procedures.", image: "/assets/serving/document-assistance.png" },
      { title: "Ambulance", description: "Transport support for eligible cases after required verification.", image: "/assets/serving/emergency-transport.png" },
      { title: "Eligibility Based", description: "Assistance is provided subject to verification and availability.", image: "/assets/serving/community-outreach.png" },
      { title: "Hospital Care", description: "On-ground help and coordination during hospital discharge formalities.", image: "/assets/serving/hospital-support.png" },
      { title: "Ground Help", description: "Volunteers support and guide families carefully at every step.", image: "/assets/serving/on-ground-support.png" },
      { title: "Remote Reach", description: "Extending compassionate and dignified support to remote areas.", image: "/assets/serving/rural-remote-reach.png" }
    ],
  },
  {
    key: "specialService-how-it-works",
    name: "Special Service How It Works",
    enabled: true,
    title: "How We Extend Our Help",
    items: [
      { title: "Contact Us", description: "Reach out through our 24x7 helpline whenever your family needs help.", label: "phone" },
      { title: "Needs Assessment", description: "We understand your family's emotional, practical and financial needs.", label: "comment" },
      { title: "Arrange Support", description: "We arrange meals, paperwork and compassionate support for your family.", label: "clipboard" },
      { title: "Ongoing Care", description: "Our support continues beyond the cremation ground with care each step.", label: "users" }
    ],
  },
  {
    key: "specialService-support",
    name: "Special Service Support Section",
    enabled: true,
    title: "Empowered by <br class=\"hidden lg:block\" /><span class=\"text-[#9A6A31]\">Namo Gange Volunteers</span>",
    description: "Our widespread network of dedicated volunteers is always ready to mobilize. They step forward to organize meals, manage hospital formalities, and support grieving families.",
    image: "/assets/about-optimized/family-support.webp",
    items: [],
  },
  {
    key: "specialService-stories",
    name: "Special Service Stories",
    enabled: true,
    items: [],
  },
  {
    key: "specialService-receive",
    name: "Special Service What Families Receive",
    enabled: true,
    eyebrow: "Holistic Support System",
    title: "An Extended Family <br /><span class=\"text-[#9A6A31]\">For Those Who Need One</span>",
    description: "\"Our service does not end at the cremation ground. We believe in providing holistic support that helps a family get back on its feet while remembering their departed with love and peace.\"",
    image: "/assets/serving/hospital-support.png",
    buttonLabel: "Know More About Our Work",
    buttonHref: "/contact",
    items: [
      { title: "Sympathetic ear for intense grief and trauma" },
      { title: "Assistance with death certificates and formalities" },
      { title: "Relief coordination for verified family needs" },
      { title: "Assistance subject to eligibility and availability" }
    ],
  },
  {
    key: "specialService-trust",
    name: "Special Service Why Families Trust Us",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "specialService-donation",
    name: "Special Service Donation CTA",
    enabled: true,
    title: "Your Support Helps Us <br />Feed Grieving Families",
    description: "By donating, you help us organize Tehravi Khana and provide continued assistance for families who cannot afford the post-cremation rituals and meals.",
    image: "/assets/serving/counseling-support.png",
    buttonLabel: "Donate to Moksha Sewa",
    buttonHref: "/donation",
    secondaryButtonLabel: "Support Our Seva",
    secondaryButtonHref: "/volunteer/register",
  },
];

export function mergeSpecialServiceSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultSpecialServiceSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultSpecialServiceSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultCallingRelativesSections: ExtraSectionContent[] = [
  {
    key: "callingRelatives-hero",
    name: "Calling Relatives Hero",
    enabled: true,
    title: "Family & Relative Support",
    subtitle: "Compassionate Communication.",
    description: "In times of sudden loss, making phone calls to inform relatives can be emotionally draining. Our compassionate volunteers take this burden off your shoulders, respectfully notifying all extended family members and friends.",
    image: "/assets/serving/counseling-support.png",
    buttonLabel: "Request Assistance",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919999999999",
  },
  {
    key: "callingRelatives-highlights",
    name: "Calling Relatives Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "callingRelatives-how-it-works",
    name: "Calling Relatives How It Works",
    enabled: true,
    title: "How We Assist You",
    items: [
      { title: "Respectful Notifications", description: "We thoughtfully convey the news and Antim Sanskar details to relatives and friends with sensitivity, clarity and complete respect.", label: "users" },
      { title: "Coordinating Arrivals", description: "We help guide relatives travelling from outside the city so they receive timely information and can reach the family without confusion.", label: "connect" },
      { title: "Emotional Shielding", description: "We reduce the immediate family's emotional burden by handling repeated communication with relatives and friends in a calm manner.", label: "empathize" }
    ],
  },
  {
    key: "callingRelatives-support",
    name: "Calling Relatives Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "callingRelatives-stories",
    name: "Calling Relatives Stories",
    enabled: true,
    items: [],
  },
  {
    key: "callingRelatives-receive",
    name: "Calling Relatives What Families Receive",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "callingRelatives-trust",
    name: "Calling Relatives Why Families Trust Us",
    enabled: true,
    title: "&quot;You have lost someone precious. Focus on saying goodbye, let us handle the words for the rest.&quot;",
    description: "Our volunteers step in as your extended family, offering support that lets you grieve without the added burden of coordination and communication.",
    items: [],
  },
  {
    key: "callingRelatives-donation",
    name: "Calling Relatives Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeCallingRelativesSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultCallingRelativesSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultCallingRelativesSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultHarsevanSections: ExtraSectionContent[] = [
  {
    key: "harsevan-hero",
    name: "Harsevan Hero",
    enabled: true,
    title: "Hearse Van (Shav Vahan)",
    subtitle: "For a Dignified Final Journey.",
    description: "The final journey should be carried out with the utmost dignity. We help coordinate Hearse Van (Shav Vahan) support for eligible cases, subject to verification, location and availability.",
    image: "/assets/serving/emergency-transport.png",
    buttonLabel: "Request Hearse Van",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919999999999",
  },
  {
    key: "harsevan-highlights",
    name: "Harsevan Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "harsevan-how-it-works",
    name: "Harsevan How It Works",
    enabled: true,
    title: "How We Assist You",
    items: [
      { title: "Immediate Availability", description: "Our hearse vans are coordinated promptly across service areas to provide timely and dignified transportation when families need support.", label: "car" },
      { title: "Professional Drivers", description: "Experienced and empathetic drivers understand the sensitivity of the moment and ensure every journey is handled carefully and respectfully.", label: "wheel" },
      { title: "Seamless Coordination", description: "Our volunteers help coordinate between the family, hospital and cremation ground to reduce confusion and unnecessary logistical burden.", label: "phone" }
    ],
  },
  {
    key: "harsevan-support",
    name: "Harsevan Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "harsevan-stories",
    name: "Harsevan Stories",
    enabled: true,
    items: [],
  },
  {
    key: "harsevan-receive",
    name: "Harsevan What Families Receive",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "harsevan-trust",
    name: "Harsevan Why Families Trust Us",
    enabled: true,
    title: "&quot;We ensure their final journey is as peaceful and dignified as the life they lived.&quot;",
    description: "You should never have to worry about transportation logistics while mourning. Moksha Sewa stands ready to help you navigate this difficult time.",
    items: [],
  },
  {
    key: "harsevan-donation",
    name: "Harsevan Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeHarsevanSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultHarsevanSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultHarsevanSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

