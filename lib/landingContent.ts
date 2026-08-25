export interface LandingSectionItem {
  title?: string;
  label?: string;
  value?: string;
  description?: string;
  image?: string;
  href?: string;
}

export interface LandingSectionContent {
  key: string;
  name: string;
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  buttonLabel?: string;
  buttonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  items?: LandingSectionItem[];
}

export const defaultLandingSections: LandingSectionContent[] = [
  {
    key: "hero",
    name: "Hero Slider",
    enabled: true,
    eyebrow: "Moksha Sewa",
    title: "Dignity in Every Final Journey",
    subtitle: "Supporting weaker families with compassionate last-rites assistance.",
    description: "Moksha Sewa team helping a helpless family with a dignified final journey",
    image: "/hero-images/dignity-in-every-final-journey-bg.png",
    buttonLabel: "Request Sewa Help",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Support This Mission",
    secondaryButtonHref: "/donation",
    items: [
      { value: "24/7", label: "Helpline Guidance" },
      { value: "Delhi • Ghaziabad • Noida", label: "Launch Region" },
      { value: "Verified", label: "Case-Based Support" },
      { value: "Subject", label: "To Eligibility" },
    ],
  },
  {
    key: "who-we-help",
    name: "Who We Help",
    enabled: true,
    title: "Who We Help",
    items: [
      {
        title: "Unclaimed & Legally\nAuthorised Cases",
        description: "We assist with respectful last-rites after completion of all required police, hospital and authority formalities.",
        image: "/assets/about-optimized/cremation-ritual.webp",
      },
      {
        title: "People Without Family\nor Support",
        description: "For those who have no one to stand beside them, we ensure a dignified and respectful final journey.",
        image: "/assets/about-optimized/family-support.webp",
      },
      {
        title: "Economically Weaker\nFamilies",
        description: "Verified support for eligible families who are unable to manage essential last-rites arrangements.",
        image: "/assets/about-optimized/prayer-hall.webp",
      },
    ],
  },
  {
    key: "practical-support",
    name: "Practical Sewa Support",
    enabled: true,
    eyebrow: "Our Sewa",
    title: "Essential Support for a\nDignified Final Journey",
    description:
      "Moksha Sewa ensures that every individual—regardless of their circumstances—receives a respectful and dignified farewell with complete care and compassion.",
    items: [
      { title: "Ambulance &\nFinal Journey Van", description: "Respectful transport for the\ndeceased from hospital/home\nto cremation ground.", image: "/assets/how-we-help/one.png" },
      { title: "Cremation\nCoordination", description: "Support in arranging cremation\nground coordination and\nrequired formalities.", image: "/assets/how-we-help/two.png" },
      { title: "Ritual &\nPriest Support", description: "Priest, wood, cloth, flowers\nand all ritual essentials\narranged.", image: "/assets/how-we-help/pandit.png" },
      { title: "Family &\nOn-Ground Support", description: "Guidance, volunteers and\ndocumentation assistance\nat every step.", image: "/assets/how-we-help/three.png" },
    ],
  },
  {
    key: "family-need",
    name: "Family Need",
    enabled: true,
    eyebrow: "Practical Sewa Support",
    title: "When a Family Needs Help,\nWe Arrange the Essentials",
    description:
      "During a difficult final journey, families may need more than arrangements—they may need guidance, coordination and someone willing to stand beside them.",
    items: [
      { title: "Verified Support", description: "For eligible cases" },
      { title: "Guided Assistance", description: "With sensitivity\nand respect" },
      { title: "Local Coordination", description: "Across the current\nservice region" },
    ],
  },
  {
    key: "how-sewa-works",
    name: "How Sewa Works",
    enabled: true,
    eyebrow: "How Sewa Works",
    title: "Support With Care, Verification & Responsibility",
    description: "A simple process. Compassionate support. Dignified final journey.",
    items: [
      { value: "01", title: "Request Sewa Help", description: "Share the basic\ncase details." },
      { value: "02", title: "Case Verification", description: "Our team reviews the need\nand applicable requirements." },
      { value: "03", title: "Sewa Coordination", description: "Required assistance is\ncoordinated based on\navailability." },
      { value: "04", title: "Dignified Final Journey", description: "The family/case receives\ncompassionate on-ground\nassistance." },
    ],
  },
  {
    key: "compassion",
    name: "Compassion Section",
    enabled: true,
    eyebrow: "CREMATION & LAST RITES SUPPORT",
    title: "When a Family Needs Help\nWe Arrange the Essentials",
    description:
      "At Moksha Sewa, we support economically weaker families and legally authorised unclaimed cases with practical final-rites coordination. Our team helps coordinate transport, ritual guidance, essential materials, relief support and on-ground volunteers after verification and required formalities.",
    buttonLabel: "Request Sewa Support",
    buttonHref: "/request-help",
  },
  {
    key: "humanitarian-commitment",
    name: "Our Humanitarian Commitment",
    enabled: true,
    eyebrow: "Our Humanitarian Commitment",
    title: "No One Should Leave\nThis World Without Dignity.",
    items: [
      { title: "Legally Authorised Cases", description: "We support only legally authorised unclaimed cases." },
      { title: "Dignified Final Rites", description: "Every soul deserves a respectful and dignified farewell." },
      { title: "Compassionate Human Presence", description: "Our volunteers stand with care, respect and humanity." },
    ],
  },
  {
    key: "sewa-stories",
    name: "Sewa Stories",
    enabled: true,
    title: "Sewa Stories",
    items: [
      { title: "ECONOMICALLY WEAKER FAMILY", image: "/assets/about-optimized/family-support.webp" },
      { title: "ELDERLY WITHOUT SUPPORT", image: "/assets/about-optimized/hearse-van.webp" },
      { title: "UNCLAIMED BODY CASE", image: "/assets/about-optimized/cremation-ritual.webp" },
    ],
  },
  {
    key: "support-matters",
    name: "Why Your Support Matters",
    enabled: true,
    eyebrow: "Why Your Support Matters",
    title: "A Dignified Farewell\nShould Never Depend on\na Family's Ability to Pay.",
    subtitle: "Your contribution helps extend verified last-rites assistance where support is genuinely needed.",
    description:
      "Your support helps us coordinate essential assistance, mobilise volunteers and stand beside eligible families during a difficult final journey.",
    image: "/hero-images/support-mission-ghat.png",
    buttonLabel: "Support This Mission",
    buttonHref: "/donation",
  },
  {
    key: "join-mission",
    name: "Join The Mission",
    enabled: true,
    eyebrow: "Join The Mission",
    title: "There Is a Place for Everyone in Sewa",
    description:
      "Every act of kindness helps us bring dignity, compassion and support to those who need it most in their final journey.",
    items: [
      { title: "Give in Sewa", label: "Donate", description: "Help extend dignified final-rites\nsupport to eligible cases.", image: "/assets/donation-images/donate-sewa.png", href: "/donation" },
      { title: "Serve in Sewa", label: "Volunteer", description: "Give your valuable time, presence,\nand compassionate support.", image: "/assets/donation-images/volunteer-sewa.png", href: "/volunteer/register" },
      { title: "Partner in Sewa", label: "Partner", description: "CSR, institutions, hospitals, and\nvarious community partners.", image: "/assets/donation-images/partner-sewa.png", href: "/partnership" },
    ],
  },
  {
    key: "support-in-action",
    name: "Your Support In Action",
    enabled: true,
    items: [
      { title: "Final Journey\nTransport", image: "/assets/how-we-help/five.png" },
      { title: "Cremation\nCoordination", image: "/assets/how-we-help/four.png" },
      { title: "Ritual\nEssentials", image: "/assets/about-optimized/samagri.webp" },
      { title: "Priest & Ritual\nGuidance", image: "/assets/about-optimized/pandit-ji.webp" },
      { title: "On-Ground\nSupport", image: "/assets/about-optimized/family-support.webp" },
    ],
  },
  {
    key: "trust-transparency",
    name: "Trust & Transparency",
    enabled: true,
    items: [
      { title: "About\nNamo Gange Trust" },
      { title: "Governance &\nPolicies" },
      { title: "Impact /\nReports" },
      { title: "Donation &\nRefund Policy" },
      { title: "SEWA", description: "Service with\ncompassion" },
      { title: "INTEGRITY", description: "Ethical actions,\nhonest intent" },
      { title: "TRANSPARENCY", description: "Open processes,\nclear communication" },
      { title: "ACCOUNTABILITY", description: "Answerable to all,\nalways improving" },
    ],
  },
  {
    key: "journey-glimpse",
    name: "Glimpse Of Journey",
    enabled: true,
    eyebrow: "Sewa In Action",
    title: "Moments of Compassion, Service & Dignity",
    buttonLabel: "View Sewa Gallery",
    buttonHref: "/mokshagallery",
    items: [
      { title: "On-Ground Sewa", description: "Compassionate support on the ground, ensuring every step of the journey is handled with care.", image: "/assets/sewa/on_ground_image.png" },
      { title: "Volunteer Sewa", description: "Dedicated volunteers selflessly giving their time and energy to serve those in need.", image: "/assets/sewa/voluteer_sewa_image.png" },
      { title: "Ritual Support", description: "Providing ritual essentials and guidance with dignity, respect and authenticity.", image: "/assets/sewa/ritual_support_image.png" },
      { title: "Community Outreach", description: "Building awareness, extending care and supporting communities with empathy.", image: "/assets/sewa/community_outreach_image.png" },
    ],
  },
  {
    key: "final-act",
    name: "One Final Act Of Humanity",
    enabled: true,
    eyebrow: "One Final Act of Humanity",
    title: "When No One Else Is There,\nHumanity Must Be.",
    description:
      "Stand with Moksha Sewa in helping ensure dignity, compassion and respect in the final journey of those we are able to support.",
    image: "/hero-images/one-final-act-humanity.png",
    buttonLabel: "Request Sewa Help",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Support This Mission",
    secondaryButtonHref: "/donation",
  },
];

export function mergeLandingSections(sections?: LandingSectionContent[]): LandingSectionContent[] {
  if (!sections?.length) return defaultLandingSections;
  const byKey = new Map(sections.map((section) => [section.key, section]));
  return defaultLandingSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (
      fallback.key === "join-mission" &&
      saved &&
      (saved.title === "Stand With Moksha Sewa" ||
        saved.description === "Support the mission as a donor, volunteer or partner." ||
        saved.items?.some((item) => item.image?.startsWith("/assets/about-optimized/")))
    ) {
      return fallback;
    }
    return saved ? { ...fallback, ...saved, items: saved.items?.length ? saved.items : fallback.items, enabled: saved.enabled !== false } : fallback;
  });
}
