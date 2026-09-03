"use client";

import {
  Check,
  ChevronRight,
  CloudUpload,
  FilePenLine,
  Folder,
  Image as ImageIcon,
  Lightbulb,
  LockKeyhole,
  Play,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";

type Practice = {
  number: number;
  title: string;
  icon: LucideIcon;
  bullets: string[];
  tip: string;
};

const practices: Practice[] = [
  {
    number: 1,
    title: "Organize with Folders",
    icon: Folder,
    bullets: [
      "Create a clear folder structure by category or content type.",
      "Use meaningful, consistent folder names.",
      "Avoid too many nested folders.",
    ],
    tip: "A simple structure saves time and prevents confusion.",
  },
  {
    number: 2,
    title: "Use Descriptive File Names",
    icon: FilePenLine,
    bullets: [
      "Rename files before uploading.",
      "Use keywords related to the content.",
      "Use hyphens (-) instead of spaces.",
    ],
    tip: "Descriptive names improve SEO and make files easy to find.",
  },
  {
    number: 3,
    title: "Optimize Images",
    icon: ImageIcon,
    bullets: [
      "Compress images before upload.",
      "Use the correct dimensions for each use case.",
      "Prefer WebP format for better performance.",
    ],
    tip: "Optimized images make your website faster and more user-friendly.",
  },
  {
    number: 4,
    title: "Manage Access & Permissions",
    icon: LockKeyhole,
    bullets: [
      "Set appropriate access levels (Public, Members, Private).",
      "Restrict sensitive media to admins only.",
      "Review permissions regularly.",
    ],
    tip: "Proper access control keeps your media secure.",
  },
  {
    number: 5,
    title: "Add Alt Text & Metadata",
    icon: Tag,
    bullets: [
      "Add alt text for all images.",
      "Use titles, captions, and descriptions when relevant.",
      "Add tags to make files searchable.",
    ],
    tip: "Metadata improves accessibility and SEO visibility.",
  },
  {
    number: 6,
    title: "Regular Cleanup",
    icon: Trash2,
    bullets: [
      "Remove unused or duplicate files.",
      "Review and update old media.",
      "Keep your library clean and relevant.",
    ],
    tip: "A clean library improves performance and saves storage space.",
  },
];

const additionalTips = [
  {
    title: "Maintain Consistency",
    text: "Follow naming conventions and folder structure across the site.",
  },
  {
    title: "Backup Your Media",
    text: "Regularly backup your media library to prevent data loss.",
  },
  {
    title: "Check Links",
    text: "Ensure media links are working and not broken.",
  },
  {
    title: "Monitor Storage",
    text: "Keep an eye on storage usage and upgrade when needed.",
  },
];

import { useRouter } from "next/navigation";

function PracticeCard({ item }: { item: Practice }) {
  const Icon = item.icon;
  const router = useRouter();

  return (
    <article
      onClick={() => router.push(`/gallery/${item.number}`)}
      className="relative flex min-h-0 cursor-pointer flex-col justify-between rounded-[8px] border border-[#e7ebe8] bg-white p-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#aed5b7] hover:shadow-md"
    >
      <div className="flex min-h-0 flex-1 gap-[14px]">
        <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#edf7f1] text-[#12633c]">
          <Icon className="h-[24px] w-[24px]" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-[8px]">
            <div className="flex items-center gap-[8px]">
              <span className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full bg-[#075b33] text-[9.5px] font-bold text-white">
                {item.number}
              </span>

              <h3 className="text-[13.5px] font-bold leading-tight text-[#12204a]">
                {item.title}
              </h3>
            </div>

            <ChevronRight className="h-[14px] w-[14px] text-[#075b33] opacity-70" strokeWidth={2.5} />
          </div>

          <ul className="mt-[6px] space-y-[3px]">
            {item.bullets.map((bullet) => (
              <li
                key={bullet}
                className="grid grid-cols-[10px_1fr] gap-[6px] text-[11px] font-medium leading-[1.35] text-[#27365d]"
              >
                <span className="pt-[1px] text-[9px] leading-none text-[#102653]">•</span>
                <span className="truncate">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-[10px] mb-[4px] flex min-h-[38px] shrink-0 items-center gap-[10px] rounded-[6px] bg-[linear-gradient(90deg,#f1f8f4_0%,#f6faf8_100%)] px-[14px] py-[6px]">
        <Lightbulb className="h-[18px] w-[18px] shrink-0 text-[#f0aa1c]" strokeWidth={2} />
        <p className="line-clamp-2 text-[10.5px] font-semibold leading-[1.3] text-[#17643d]">
          {item.tip}
        </p>
      </div>
    </article>
  );
}

function HeroIllustration() {
  return (
    <div className="relative h-[86px] w-[235px] shrink-0" aria-hidden>
      <div className="absolute bottom-[10px] right-[22px] h-[70px] w-[118px] rounded-[8px] bg-[linear-gradient(180deg,#8bc39c_0%,#aed5b7_100%)] shadow-[0_8px_20px_rgba(26,93,56,.08)]">
        <span className="absolute -top-[10px] left-[28px] h-[16px] w-[62px] rounded-t-[8px] bg-[#86bd95]" />
        <span className="absolute left-[10px] right-[10px] top-[14px] h-px bg-white/45" />
      </div>

      <div className="absolute bottom-[11px] left-[20px] grid h-[58px] w-[58px] place-items-center rounded-[7px] border border-[#dbe8df] bg-white shadow-[0_3px_10px_rgba(35,82,57,.06)]">
        <ImageIcon className="h-[32px] w-[32px] text-[#4d9566]" strokeWidth={2} />
      </div>

      <div className="absolute bottom-[10px] right-0 grid h-[50px] w-[58px] place-items-center rounded-[6px] bg-[#167344] text-white shadow-[0_4px_12px_rgba(16,92,53,.13)]">
        <Play className="ml-[2px] h-[24px] w-[24px] fill-current" strokeWidth={1.5} />
      </div>

      <div className="absolute right-[-28px] top-[-8px] opacity-[0.16]">
        <svg viewBox="0 0 70 120" className="h-[105px] w-[62px]">
          <path d="M35 116C37 85 39 52 44 11" fill="none" stroke="#448e64" strokeWidth="2" />
          <path d="M42 22C24 27 18 37 16 49C30 47 39 38 42 22Z" fill="#7ab28c" />
          <path d="M39 49C53 51 61 60 62 71C50 68 42 61 39 49Z" fill="#7ab28c" />
          <path d="M37 70C22 73 14 82 13 94C26 91 35 83 37 70Z" fill="#7ab28c" />
        </svg>
      </div>
    </div>
  );
}

export default function MediaLibraryBestPracticesPage() {
  return (
    <main className="relative h-full min-h-0 w-full overflow-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347]">
      <div className="grid h-full min-h-0 grid-rows-[56px_116px_minmax(0,1fr)_112px_40px] gap-[10px]">
        {/* HEADING */}
        <header className="min-h-0">
          <h1 className="text-[25px] font-extrabold leading-none tracking-[-0.02em] text-[#075b33]">
            Media Library Best Practices
          </h1>

          <nav
            className="mt-[10px] flex items-center gap-[8px] text-[11px] font-semibold text-[#1d2b58]"
            aria-label="Breadcrumb"
          >
            <span>Dashboard</span>
            <ChevronRight className="h-[12px] w-[12px] text-[#69738d]" strokeWidth={2} />
            <span>Media Library</span>
            <ChevronRight className="h-[12px] w-[12px] text-[#69738d]" strokeWidth={2} />
            <span>Best Practices</span>
          </nav>
        </header>

        {/* INTRO BANNER */}
        <section className="relative flex min-h-0 items-center overflow-hidden rounded-[8px] border border-[#d9e8dd] bg-[linear-gradient(90deg,#f2faf5_0%,#edf8f2_58%,#eaf5ee_100%)] px-[26px]">
          <div className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border border-[#dce8df] bg-white text-[#08713f] shadow-[0_2px_8px_rgba(15,72,42,.03)]">
            <ShieldCheck className="h-[42px] w-[42px]" strokeWidth={1.8} />
          </div>

          <p className="ml-[24px] max-w-[820px] text-[12px] font-semibold leading-[1.65] text-[#2e333d]">
            Following these best practices will help you keep your media library organized, secure, and optimized for performance.
            <br />
            Well-managed media ensures faster websites, better SEO, and an improved user experience.
          </p>

          <div className="ml-auto mr-[30px]">
            <HeroIllustration />
          </div>
        </section>

        {/* 6 PRACTICE CARDS */}
        <section className="grid min-h-0 grid-cols-3 grid-rows-2 gap-[10px]">
          {practices.map((item) => (
            <PracticeCard key={item.number} item={item} />
          ))}
        </section>

        {/* ADDITIONAL TIPS */}
        <section className="relative grid min-h-0 grid-cols-[56px_1fr_1fr_1fr_1fr_92px] items-center overflow-hidden rounded-[8px] border border-[#dbe6f3] bg-[linear-gradient(90deg,#f4f8ff_0%,#f7faff_55%,#f1f7ff_100%)] px-[22px]">
          <div className="grid h-[44px] w-[44px] place-items-center rounded-full bg-[#dcecff] text-[#183c7b]">
            <Star className="h-[24px] w-[24px]" strokeWidth={1.9} />
          </div>

          {additionalTips.map((tip, index) => (
            <div
              key={tip.title}
              className={`flex h-[84px] min-w-0 flex-col justify-start px-[18px] pt-[19px] ${index > 0 ? "border-l border-[#dce4ef]" : ""
                }`}
            >
              <h3 className="truncate text-[11px] font-bold leading-[1.2] text-[#19284f]">
                {tip.title}
              </h3>

              <div className="mt-[8px] flex min-w-0 gap-[8px]">
                <Check
                  className="mt-[1px] h-[13px] w-[13px] shrink-0 text-[#27914d]"
                  strokeWidth={2.8}
                />
                <p className="min-w-0 text-[9.5px] font-medium leading-[1.45] text-[#31405f]">
                  {tip.text}
                </p>
              </div>
            </div>
          ))}

          <div className="flex h-[84px] items-center justify-end border-l border-[#ccdbea] pl-[18px]">
            <div className="relative">
              <CloudUpload className="absolute -top-[28px] left-[4px] h-[38px] w-[38px] text-[#5d8ec0]" strokeWidth={1.5} />
              <Folder className="h-[48px] w-[56px] fill-[#ffd77c] text-[#d6a845]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="pointer-events-none absolute left-[76px] top-[9px] z-10 text-[11px] font-bold leading-none text-[#1b2b55]">
            Additional Tips
          </div>
        </section>

        {/* REMINDER */}
        <section className="flex min-h-0 items-center rounded-[7px] border border-[#f4e6c2] bg-[linear-gradient(90deg,#fff9eb_0%,#fffdf4_100%)] px-[24px]">
          <span className="mr-[14px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 border-[#f0ac22] text-[11px] font-extrabold text-[#e59c0d]">
            i
          </span>

          <p className="text-[10.5px] font-semibold text-[#6f5531]">
            <strong className="font-extrabold">Remember:</strong>{" "}
            <span className="text-[#17643d]">
              A well-managed media library leads to a better website, better rankings, and a better experience for your visitors.
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}