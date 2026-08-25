export interface LandingSectionItem {
  title?: string;
  label?: string;
  value?: string;
  description?: string;
  image?: string;
  href?: string;
}

export interface LandingHeroSlide {
  title: string;
  description: string;
  image: string;
  alt: string;
  buttonLabel?: string;
  buttonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  variant?: "default" | "family-support" | "journey-prayer" | "volunteer-impact";
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
  logoImage?: string;
  partnerLogoImage?: string;
  buttonLabel?: string;
  buttonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  slides?: LandingHeroSlide[];
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
    slides: [
      { title: "Dignity in Every\nFinal Journey", description: "Supporting weaker families with compassionate last-rites assistance.", image: "/hero-images/dignity-in-every-final-journey-bg.png", alt: "Moksha Sewa team helping a helpless family with a dignified final journey", buttonLabel: "Request Sewa Help", buttonHref: "/request-help", secondaryButtonLabel: "Support This Mission", secondaryButtonHref: "/donation" },
      { title: "No One Leaves\nWithout Final Dignity.", description: "Respectful last rites for authorised unclaimed cases.", image: "/hero-images/image2.png", alt: "Moksha Sewa volunteers providing dignified last rites support for an authorised unclaimed case", buttonLabel: "Know Our Mission", buttonHref: "/about", secondaryButtonLabel: "Support This Mission", secondaryButtonHref: "/donation" },
      { title: "Be the Reason\nDignity Reaches Someone.", description: "Your support brings dignity through every farewell.", image: "/hero-images/image3.png", alt: "Moksha Sewa volunteers supporting an elderly couple with dignity and compassion", buttonLabel: "Support This Mission", buttonHref: "/donation", secondaryButtonLabel: "Become a Volunteer", secondaryButtonHref: "/volunteer/register" },
      { title: "When a Family Cannot\nAfford a Final Farewell.", description: "Humanity stands beside families through every farewell.", image: "/hero-images/image7.png", alt: "Moksha Sewa volunteers standing beside a grieving family with dignity and compassion", variant: "family-support", buttonLabel: "Request Support", buttonHref: "/request-help", secondaryButtonLabel: "Support a Family", secondaryButtonHref: "/donation" },
      { title: "Final Journey to Prayer\nWe Stand Beside Them.", description: "Transport and rituals support families with compassion.", image: "/hero-images/image8.png", alt: "Moksha Sewa transport, rituals and family support during a dignified final journey", variant: "journey-prayer", buttonLabel: "Explore Our Sewa", buttonHref: "/prayerhallservices", secondaryButtonLabel: "Support This Mission", secondaryButtonHref: "/donation" },
      { title: "Be the Reason\nDignity Reaches Someone.", description: "Your time brings comfort, care and compassion.", image: "/hero-images/volunteer-impact-v2.png", alt: "Moksha Sewa volunteers serving with compassion and dignity", variant: "volunteer-impact", buttonLabel: "Become a Volunteer", buttonHref: "/volunteer/register", secondaryButtonLabel: "Support This Mission", secondaryButtonHref: "/donation" },
    ],
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
    eyebrow: "Who We Help",
    title: "Who We Help",
    subtitle: "Standing Beside Those Who Need Us Most",
    description: "Moksha Sewa provides compassionate last-rites support for unclaimed cases and families in need with dignity, respect and complete sensitivity.",
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
      { title: "Verified &\nTransparent", description: "Every sewa request is carefully verified before providing help." },
      { title: "Compassion is Our\nCommitment", description: "We serve every life with deep respect, care and full dignity." },
      { title: "Support with\nResponsibility", description: "Our support is subject to verification and legal requirements." },
      { title: "Local Sewa\nNetwork", description: "Our dedicated teams are available across Delhi • Ghaziabad • Noida for support." },
    ],
  },
  {
    key: "practical-support",
    name: "Practical Sewa Support",
    enabled: true,
    eyebrow: "Our Sewa",
    title: "Essential Support for a\nDignified Final Journey",
    image: "/assets/km.jpeg",
    description:
      "Moksha Sewa ensures that every individual—regardless of their circumstances—receives a respectful and dignified farewell with complete care and compassion.",
    items: [
      { title: "Ambulance &\nFinal Journey Van", description: "Respectful transport for the\ndeceased from hospital/home\nto cremation ground.", image: "/assets/how-we-help/one.png" },
      { title: "Cremation\nCoordination", description: "Support in arranging cremation\nground coordination and\nrequired formalities.", image: "/assets/how-we-help/two.png" },
      { title: "Ritual &\nPriest Support", description: "Priest, wood, cloth, flowers\nand all ritual essentials\narranged.", image: "/assets/how-we-help/pandit.png" },
      { title: "Family &\nOn-Ground Support", description: "Guidance, volunteers and\ndocumentation assistance\nat every step.", image: "/assets/how-we-help/three.png" },
      { title: "For Everyone", description: "We serve unclaimed bodies, elderly alone, and families in financial distress." },
      { title: "Delhi • Ghaziabad • Noida", description: "Expanding our network and reach to support more vulnerable people in need." },
      { title: "Zero Financial Burden", description: "Our services are completely free for all those who are unable to afford them." },
      { title: "Humanity First", description: "Every single life deserves dignity. Every family deserves complete support." },
    ],
  },
  {
    key: "family-need",
    name: "Family Need",
    enabled: true,
    eyebrow: "Practical Sewa Support",
    title: "When a Family Needs Help,\nWe Arrange the Essentials",
    image: "/assets/manish.jpeg",
    description:
      "During a difficult final journey, families may need more than arrangements—they may need guidance, coordination and someone willing to stand beside them.",
    buttonLabel: "Request Sewa Support",
    buttonHref: "/request-help",
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
    buttonLabel: "Request Sewa Help",
    buttonHref: "/request-help",
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
    image: "/assets/chatgpt.png",
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
    description: "Moksha Sewa supports legally authorised unclaimed cases with respectful final-rites coordination after completion of applicable police, hospital and authority formalities. Our team works carefully with the concerned authorities and service partners to help ensure that each final journey is handled with dignity, compassion, proper coordination and due respect. Support is provided only within the approved legal process and after the required documentation, verification and permissions have been completed.",
    image: "/assets/image.png",
    buttonLabel: "Know About Unclaimed Body Sewa",
    buttonHref: "/unclaimed-body-sewa",
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
    eyebrow: "Sewa Stories",
    title: "Sewa Stories",
    subtitle: "Every Sewa Has a Human Story",
    description: "Behind every case is a life, a family and a final journey deserving of respect.",
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
    eyebrow: "Your Support In Action",
    title: "Helping Complete a Final Journey With Dignity",
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
    eyebrow: "Sewa With Responsibility",
    title: "Trust &\nTransparency",
    description: "Our commitment to transparency, integrity and responsible service.",
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
  {
    key: "faq",
    name: "Frequently Asked Questions",
    enabled: true,
    eyebrow: "Help & Information",
    title: "Frequently Asked Questions",
    description: "Find quick answers to common questions about Moksha Sewa, our services and how you can get involved.",
    items: [
      {
        title: "Who can request Moksha Sewa support?",
        description: "Moksha Sewa support can be requested by families, authorised representatives, institutions and individuals who need assistance with last rites and related services.",
        image: "/assets/faq/request.png",
      },
      {
        title: "Does Moksha Sewa assist with legally authorised unclaimed bodies?",
        description: "Yes. Subject to applicable legal permissions and local procedures, Moksha Sewa can assist with legally authorised unclaimed body cases.",
        image: "/assets/faq/legally.png",
      },
      {
        title: "What cremation and last-rites assistance is available?",
        description: "Moksha Sewa provides assistance and coordination for cremation, transportation, essential last-rites arrangements and other support based on the circumstances.",
        image: "/assets/faq/cremation.png",
      },
      {
        title: "Where is Moksha Sewa currently available?",
        description: "Moksha Sewa services are currently available in selected locations. Please contact the team to confirm availability in your area.",
        image: "/assets/faq/where_is_moksha.png",
      },
      {
        title: "How can I become a volunteer?",
        description: "You can express your interest in volunteering by contacting the Moksha Sewa team and sharing your basic details and preferred area of support.",
        image: "/assets/faq/volunteer.png",
      },
      {
        title: "How can I support Moksha Sewa through a donation?",
        description: "You can support Moksha Sewa through an authorised donation channel. Contact the organisation for current donation details and available donation options.",
        image: "/assets/faq/support.png",
      },
    ],
  },
  {
    key: "footer",
    name: "Footer",
    enabled: true,
    eyebrow: "A Namo Gange Trust Initiative",
    title: "Moksha Sewa",
    subtitle: "Seva • Samman • Samarpan",
    description: "We stand with the forgotten, the unclaimed and the helpless to ensure every life's final journey is dignified, peaceful and respectful.",
    image: "/assets/footer-ghat-sunset.png",
    logoImage: "/assets/footer-moksha-mark.png",
    partnerLogoImage: "/assets/namo-gange-logo.webp",
    buttonLabel: "Donate Now",
    buttonHref: "/donation",
    items: [
      { label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Gallery", href: "/mokshagallery" }, { label: "Blog", href: "/blog" }, { label: "Contact Us", href: "/contact" },
      { label: "Request Sewa Help", href: "/request-help" }, { label: "Transport Coordination", href: "/ambulanceservices" }, { label: "Ritual Material Support", href: "/furalservices" }, { label: "Priest Guidance", href: "/panditservices" }, { label: "Family Guidance", href: "/specialservices" }, { label: "Unclaimed Body Sewa", href: "/unclaimed-body-sewa" },
      { label: "Unclaimed Bodies Support", href: "/mortal-records" }, { label: "Volunteer Programme", href: "/volunteer/register" }, { label: "Awareness & Outreach", href: "/blog" },
      { title: "Compassion", description: "We serve with\nempathy and humanity." }, { title: "Dignity", description: "Every life is treated\nwith respect." }, { title: "Service", description: "We support every step\nof the final journey." }, { title: "Trust", description: "Transparent, accountable\nand responsible." }, { title: "Together", description: "United for a more\ncompassionate world." },
      { label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "/terms" }, { label: "Refund Policy", href: "/refund-policy" },
    ],
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
    if (!saved) return fallback;
    const items = fallback.items?.length
      ? [
          ...fallback.items.map((item, index) => ({ ...item, ...(saved.items?.[index] ?? {}) })),
          ...(saved.items?.slice(fallback.items.length) ?? []),
        ]
      : saved.items;
    const slides = fallback.slides?.length
      ? [
          ...fallback.slides.map((slide, index) => ({ ...slide, ...(saved.slides?.[index] ?? {}) })),
          ...(saved.slides?.slice(fallback.slides.length) ?? []),
        ]
      : saved.slides;
    return { ...fallback, ...saved, items, slides, enabled: saved.enabled !== false };
  });
}
