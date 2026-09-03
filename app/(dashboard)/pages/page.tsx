"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import typography from "./PagesTypography.module.css";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Home,
  ImageIcon,
  Layers,
  Link2,
  MoreVertical,
  MousePointerClick,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  cmsPages,
  cmsPagesFromSettings,
  getCmsPageRouteKey,
  PUBLIC_SITE_URL,
  type CmsPage,
  type PageStatus,
  type PageType,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { useAppSelector } from "@/store/hooks";

/* =========================================================
   TYPES
========================================================= */

type DetailTab =
  | "SEO"
  | "Content"
  | "Performance"
  | "History";

/* =========================================================
   SEO RING — SMALLER + LIGHTER
========================================================= */

function SeoRing({
  score,
  size = 26,
}: {
  score: number;
  size?: number;
}) {
  const color =
    score >= 80
      ? "#18844c"
      : score >= 75
        ? "#c89125"
        : "#ee9a1a";

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          ${color} 0deg ${score * 3.6}deg,
          #edf1ed ${score * 3.6}deg 360deg
        )`,
      }}
    >
      <div className="absolute inset-[3px] rounded-full bg-white" />
    </div>
  );
}

/* =========================================================
   LARGE SEO RING — SMALLER
========================================================= */

function LargeSeoRing({
  score,
}: {
  score: number;
}) {
  return (
    <div
      className="relative grid h-[108px] w-[108px] shrink-0 place-items-center rounded-full"
      style={{
        background: score >= 100
          ? "#2563eb"
          : `conic-gradient(
              #2563eb 0deg ${score * 3.6}deg,
              #e2e8f0 ${score * 3.6}deg 360deg
            )`,
      }}
    >
      <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white">
        <div className="text-center">
          <div className="text-[19px] font-bold leading-none tracking-[-0.025em] text-[#17223a]">
            {score}
            <span className="ml-[1px] text-[7.5px] font-semibold text-[#64748b]">
              /100
            </span>
          </div>

          <p className="mt-[5px] whitespace-nowrap font-semibold text-[#2563eb]" style={{ fontSize: "10px" }}>
            {score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Work"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE TYPE ICON — SMALLER / THINNER
========================================================= */

function PageTypeIcon({
  type,
}: {
  type: PageType;
}) {
  if (type === "home") {
    return (
      <div className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#edf6ec] text-[#23764b]">
        <Home
          className="h-[12px] w-[12px]"
          strokeWidth={1.7}
        />
      </div>
    );
  }

  if (type === "people") {
    return (
      <div className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#fff4e1] text-[#af7a27]">
        <UsersRound
          className="h-[12px] w-[12px]"
          strokeWidth={1.65}
        />
      </div>
    );
  }

  return (
    <div className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#fff4e1] text-[#af7a27]">
      <FileText
        className="h-[12px] w-[12px]"
        strokeWidth={1.65}
      />
    </div>
  );
}

/* =========================================================
   AUTHOR ICON — SMALLER
========================================================= */

function AuthorIcon() {
  return (
    <div className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-[#f2f4f1] text-[#26364b]">
      <UserRound
        className="h-[11px] w-[11px]"
        strokeWidth={1.7}
      />
    </div>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  value,
  options,
  onChange,
  className = "",
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-[30px] w-full cursor-pointer appearance-none rounded-[6px] border border-[#e3e4e0] bg-white pl-[11px] pr-[28px] text-[8.5px] font-semibold text-[#374156] outline-none transition-colors hover:border-[#d2c9b3] focus:border-[#c39a43]"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#737b87]" />
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PagesCmsPage() {
  const router = useRouter();
  const admin = useAppSelector((state) => state.auth.admin);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [totalSections, setTotalSections] = useState(0);
  const [search, setSearch] = useState("");

  const [pageFilter, setPageFilter] =
    useState("All Pages");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [authorFilter, setAuthorFilter] =
    useState("All Authors");

  const [selectedPageValue, setSelectedPage] = useState<CmsPage | null>(null);
  const selectedPage = selectedPageValue ?? pages[0] ?? cmsPages[0];
  const loggedInAdminName = admin?.name?.trim() || "Admin User";

  const [rawSettings, setRawSettings] = useState<Record<string, any> | null>(null);

  const [toastMessage, setToastMessage] = useState<{ title: string; type: "success" | "error" } | null>(null);

  const handleToggleStatus = (isActive: boolean) => {
    const newStatus = isActive ? "Published" : "Draft";
    setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? { ...p, status: newStatus } : p)));
    setSelectedPage((prev) => prev ? { ...prev, status: newStatus } : { ...selectedPage, status: newStatus });

    if (isActive) {
      setToastMessage({
        title: "Success! The page has been published and is now live.",
        type: "success"
      });
    } else {
      setToastMessage({
        title: "Notice: The page has been unpublished and moved to drafts.",
        type: "error"
      });
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    let active = true;
    settingsApi.get().then((settings) => {
      if (!active) return;
      const raw = settings as unknown as Record<string, any>;
      setRawSettings(raw);
      const realPages = cmsPagesFromSettings(raw);
      setPages(realPages);
      setSelectedPage(realPages[0] ?? null);
      const sections = Object.entries(raw).reduce((count, [key, value]) => {
        if (!key.toLowerCase().endsWith("page") || !value || typeof value !== "object") return count;
        const page = value as { sections?: unknown[] };
        return count + (page.sections?.length ?? 0);
      }, 0);
      setTotalSections(sections);
    }).catch(() => {
      if (active) {
        setPages([]);
        setSelectedPage(null);
      }
    });
    return () => { active = false; };
  }, []);

  const selectedPageConfig = selectedPage.configKey && rawSettings ? rawSettings[selectedPage.configKey] : undefined;

  const selectedPageIsPublished = selectedPage.status === "Published";
  const selectedPageIsActive =
    selectedPageIsPublished && selectedPageConfig?.enabled !== false;

  const selectedPagePublicUrl = `${PUBLIC_SITE_URL.replace(/\/+$/, "")}${selectedPage.slug === "/"
    ? "/"
    : selectedPage.slug.startsWith("/")
      ? selectedPage.slug
      : `/${selectedPage.slug}`
    }`;

  const selectedPageSections: Array<Record<string, any>> =
    selectedPageConfig?.sections ?? [];

  const selectedPageHasInternalLinks = Boolean(
    selectedPageConfig?.sections?.some((section: Record<string, any>) => {
      const hrefs = [section.buttonHref, section.secondaryButtonHref, section.tertiaryButtonHref, ...(section.items ?? []).map((item: Record<string, any>) => item.href)];
      return hrefs.some((href) => typeof href === "string" && href.trim().startsWith("/"));
    }),
  );

  const selectedPageHasImages = Boolean(
    selectedPageConfig?.sections?.some((section: Record<string, any>) => {
      const images = [section.image, section.logoImage, section.secondaryImage, section.partnerLogoImage, ...(section.items ?? []).map((item: Record<string, any>) => item.image)];
      return images.some((image) => typeof image === "string" && image.trim().length > 0);
    }),
  );

  const IMAGE_FIELD_PATTERN = /image|logo/i;
  const BUTTON_LABEL_FIELD_PATTERN = /buttonLabel$/i;
  const TEXT_FIELD_SKIP_PATTERN = /^(_id|key|name|enabled)$/i;

  const contentStats = useMemo(() => {
    const sections: Array<Record<string, any>> = selectedPageConfig?.sections ?? [];
    let textBlocks = 0;
    let images = 0;
    let ctaBlocks = 0;

    sections.forEach((section) => {
      Object.entries(section).forEach(([key, value]) => {
        if (TEXT_FIELD_SKIP_PATTERN.test(key) || key === "items" || key === "slides") return;
        if (IMAGE_FIELD_PATTERN.test(key)) {
          if (typeof value === "string" && value.trim()) images += 1;
          return;
        }
        if (BUTTON_LABEL_FIELD_PATTERN.test(key)) {
          if (typeof value === "string" && value.trim()) ctaBlocks += 1;
          return;
        }
        if (typeof value === "string" && value.trim()) textBlocks += 1;
      });

      (section.items ?? []).forEach((item: Record<string, any>) => {
        Object.entries(item).forEach(([key, value]) => {
          if (key === "_id") return;
          if (IMAGE_FIELD_PATTERN.test(key) && typeof value === "string" && value.trim()) {
            images += 1;
          } else if (typeof value === "string" && value.trim()) {
            textBlocks += 1;
          }
        });
      });
    });

    return {
      sections: sections.length,
      textBlocks,
      images,
      ctaBlocks,
    };
  }, [selectedPageConfig]);

  const [activeTab, setActiveTab] =
    useState<DetailTab>("SEO");

  const [activePagination, setActivePagination] =
    useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [actionMenu, setActionMenu] =
    useState<number | null>(null);

  const filteredPages = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return pages.filter((page) => {
      const searchMatch =
        !query ||
        page.title
          .toLowerCase()
          .includes(query) ||
        page.slug
          .toLowerCase()
          .includes(query);

      const pageMatch =
        pageFilter === "All Pages" ||
        (pageFilter === "Homepage" &&
          page.type === "home") ||
        (pageFilter === "Inner Pages" &&
          page.type !== "home");

      const statusMatch =
        statusFilter === "All Status" ||
        page.status === statusFilter;

      const authorMatch =
        authorFilter === "All Authors" ||
        page.author === authorFilter;

      return (
        searchMatch &&
        pageMatch &&
        statusMatch &&
        authorMatch
      );
    });
  }, [
    search,
    pageFilter,
    statusFilter,
    authorFilter,
    pages,
  ]);

  const publishedCount = pages.filter((page) => page.status === "Published").length;
  const draftCount = Math.max(0, pages.length - publishedCount);
  const averageSeo = pages.length ? Math.round(pages.reduce((sum, page) => sum + page.seoScore, 0) / pages.length) : 0;
  const averageSeoRating = averageSeo >= 90 ? "Excellent" : averageSeo >= 75 ? "Good" : averageSeo >= 50 ? "Needs Work" : "Poor";
  const averageSeoColor = averageSeo >= 75 ? "#1a864d" : averageSeo >= 50 ? "#d99b18" : "#c0392b";
  const lastUpdatedPage = pages[0] ?? null;
  const totalPaginationPages = Math.max(1, Math.ceil(filteredPages.length / pageSize));
  const safePage = Math.min(activePagination, totalPaginationPages);
  const paginatedPages = filteredPages.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setActivePagination(1);
  }, [search, pageFilter, statusFilter, authorFilter, pageSize]);

  const topStats = [
    {
      title: "TOTAL PAGES",
      value: pages.length.toString(),
      note: `Published: ${publishedCount}`,
      icon: FileText,
      tone: "violet",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f8f5ff 100%)",
      numColor: "#6d28d9",
      footer: "View all pages",
    },
    {
      title: "DRAFT PAGES",
      value: draftCount.toString(),
      note: `Unpublished: ${draftCount}`,
      icon: Pencil,
      tone: "amber",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #fffdf0 100%)",
      numColor: "#b45309",
      footer: "View drafts",
    },
    {
      title: "TOTAL SECTIONS",
      value: totalSections.toString(),
      note: "Across all pages",
      icon: Layers,
      tone: "blue",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0f7ff 100%)",
      numColor: "#1d4ed8",
      footer: "Manage sections",
    },

    {
      title: "SEO SCORE (AVG)",
      value: averageSeo.toString(),
      suffix: "/100",
      note: averageSeoRating,
      icon: TrendingUp,
      tone: "emerald",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0fdf4 100%)",
      numColor: "#047857",
      footer: "View SEO report",
    },
  ];

  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  return (
    <div className={`${typography.pages} h-full min-h-0 w-full overflow-hidden bg-[#fffefb] text-[#182238]`}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-[18px] pb-[10px] pt-[14px]">

        {/* =================================================
            TOP HEADING
        ================================================= */}

        <div className="mb-[20px] flex shrink-0 items-start justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#18233b]">
              Pages &amp; CMS
            </h1>

            <div className="mt-[6px] flex items-center gap-[6px] text-[9px] font-medium text-[#6c7587]">
              <span>Pages &amp; CMS</span>
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-red-200 bg-red-50 px-[12px] text-[8.5px] font-semibold text-red-700 shadow-[0_1px_4px_rgba(30,30,20,0.025)] transition hover:bg-red-100"
            >
              <SlidersHorizontal
                className="h-[11px] w-[11px]"
                strokeWidth={1.7}
              />

              Reorder Pages
            </button>

            <button
              type="button"
              onClick={() => router.push("/pages/new")}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#293681] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(41,54,129,0.15)] transition hover:bg-[#1f2963]"
            >
              <Plus
                className="h-[12px] w-[12px]"
                strokeWidth={1.7}
              />

              Add New Page
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-[14px]">

          {/* ===============================================
              LEFT
          =============================================== */}

          <div className="flex min-h-0 flex-col">

            {/* =============================================
                STATS
            ============================================= */}

            <div className="grid h-[98px] shrink-0 grid-cols-4 gap-[11px]">
              {topStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="relative flex flex-col justify-center overflow-hidden rounded-[7px] p-2"
                    style={{
                      background: item.gradient,
                      boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                    }}
                  >
                    <div className="flex items-start gap-1.5">
                      <div
                        className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full ring-1 ${toneClass[
                          item.tone as keyof typeof toneClass
                        ]
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[8px] !font-semibold tracking-[0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
                          {item.title}
                        </p>

                        <div className="mt-1.5 flex items-end gap-1">
                          <span
                            className={`!font-semibold tracking-[-0.04em] ${item.title === "LAST UPDATED" ? "text-[11px] leading-[1.2]" : "text-[17px] leading-none"
                              }`}
                            style={{ color: item.numColor, fontWeight: 600 }}
                          >
                            {item.value}
                          </span>

                          {item.suffix && (
                            <span className="mb-0.5 text-[8px] font-bold">
                              {item.suffix}
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-0.5 text-[7.5px] font-bold ${item.title === "DRAFT PAGES" ? "text-amber-600" : item.title === "TOTAL SECTIONS" ? "text-blue-600" : item.title === "LAST UPDATED" ? "text-rose-600" : "text-emerald-700"}`}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =============================================
                FILTER ROW
            ============================================= */}

            <div className="mt-[10px] flex h-[30px] shrink-0 items-center gap-[9px]">
              <div className="relative min-w-[250px] flex-1">
                <Search
                  className="absolute left-[11px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#7a818d]"
                  strokeWidth={1.7}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search pages by title or URL..."
                  className="h-[30px] w-full rounded-[6px] border border-[#e3e4e0] bg-white pl-[33px] pr-[11px] text-[8.5px] font-normal text-[#424c5f] outline-none placeholder:text-[#9298a3] focus:border-[#c8ad70]"
                />
              </div>

              <FilterSelect
                value={pageFilter}
                onChange={setPageFilter}
                options={[
                  "All Pages",
                  "Homepage",
                  "Inner Pages",
                ]}
                className="w-[116px]"
              />

              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  "All Status",
                  "Published",
                  "Draft",
                ]}
                className="w-[116px]"
              />

              <FilterSelect
                value={authorFilter}
                onChange={setAuthorFilter}
                options={[
                  "All Authors",
                  "Admin User",
                  "Seva Team",
                ]}
                className="w-[126px]"
              />

              <button
                type="button"
                className="flex h-[30px] w-[72px] shrink-0 items-center justify-center gap-[6px] rounded-[6px] border border-[#e3e4e0] bg-white text-[8.5px] font-semibold text-[#374156]"
              >
                <Filter
                  className="h-[12px] w-[12px]"
                  strokeWidth={1.7}
                />

                Filter
              </button>
            </div>

            {/* =============================================
                TABLE
            ============================================= */}

            <div
              className="mt-[13px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] bg-white"
              style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
            >

              {/* TABLE HEADER */}

              <div className="grid h-[32px] shrink-0 grid-cols-[minmax(0,2.7fr)_minmax(0,1.8fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.45fr)] items-center border-b border-[#e8e5df] bg-[#233D4D] px-[10px]">
                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Page Title
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Url
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Author
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Status
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Seo Score
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Last Updated
                </div>
              </div>

              {/* ROWS */}

              <div className="min-h-0 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[2px]">
                {paginatedPages.map((page) => {
                  const selected =
                    selectedPage.id === page.id;

                  return (
                    <div
                      key={page.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedPage(page);
                        setActionMenu(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedPage(page);
                          setActionMenu(null);
                        }
                      }}
                      className={`grid min-h-[44px] w-full grid-cols-[minmax(0,2.7fr)_minmax(0,1.8fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.45fr)] items-center border-b border-[#f0f0ec] px-[10px] text-left transition last:border-b-0 ${selected
                        ? "bg-[#E4DA72]/20"
                        : page.status !== "Published"
                          ? "bg-rose-50/60 hover:bg-rose-100/60"
                          : "bg-white hover:bg-slate-50"
                        }`}
                    >

                      {/* TITLE */}

                      <div className="flex min-w-0 items-center gap-[7px] px-[4px]">
                        <PageTypeIcon type={page.type} />

                        <div className="flex min-w-0 max-w-full items-center gap-[5px] overflow-hidden">
                          <span className="truncate text-[8px] font-semibold text-[#293681]">
                            {page.title}
                          </span>

                          {page.type === "home" && (
                            <span className="shrink-0 rounded-[4px] bg-[#edf5eb] px-[5px] py-[2px] text-[6.5px] font-semibold text-[#397b54]">
                              Homepage
                            </span>
                          )}
                        </div>
                      </div>

                      {/* URL */}

                      <div className="flex min-w-0 items-center gap-[5px] overflow-hidden px-[4px]">
                        <span className="truncate text-[7.5px] font-medium text-[#4B1426]">
                          {page.slug}
                        </span>

                        <ExternalLink
                          className="h-[10px] w-[10px] shrink-0 text-[#7b8494]"
                          strokeWidth={1.7}
                        />
                      </div>

                      {/* AUTHOR */}

                      <div className="flex min-w-0 items-center gap-[6px] overflow-hidden px-[4px]">
                        <span className="truncate text-[7.5px] font-medium text-[#BE1A1A]">
                          {page.author}
                        </span>
                      </div>

                      {/* STATUS */}

                      <div className="min-w-0 px-[4px]">
                        <span
                          className={`inline-flex max-w-full items-center gap-[4px] whitespace-nowrap rounded-[4px] px-[6px] py-[3px] text-[7px] font-semibold ${page.status === "Published"
                            ? "bg-[#edf6ee] text-[#327d50]"
                            : "bg-rose-50 text-rose-700"
                            }`}
                        >
                          <span
                            className={`h-[4px] w-[4px] rounded-full ${page.status === "Published"
                              ? "bg-[#308052]"
                              : "bg-rose-600"
                              }`}
                          />

                          {page.status === "Published" ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* SCORE */}

                      <div className="flex min-w-0 items-center gap-[6px] px-[4px]">
                        <SeoRing score={page.seoScore} />

                        <div className="min-w-0">
                          <p className="text-[11px] font-bold leading-none text-[#2c374c]">
                            {page.seoScore}
                          </p>

                          <p
                            className={`mt-[3px] truncate whitespace-nowrap text-[7px] font-semibold leading-none ${page.rating === "Needs Work"
                              ? "text-[#d98b1f]"
                              : "text-[#38805a]"
                              }`}
                          >
                            {page.rating}
                          </p>
                        </div>
                      </div>

                      {/* UPDATED */}

                      <div className="min-w-0 overflow-hidden px-[4px] pl-[12px]">
                        <p className="truncate text-[7.5px] font-semibold leading-[1.3] text-[#293681]">
                          {page.updated.split(",")[0]}
                        </p>

                        <p className="mt-[2px] truncate text-[7.5px] font-semibold leading-[1.3] text-blue-600">
                          {page.updated.split(",")[1]?.trim()}
                        </p>
                      </div>

                    </div>
                  );
                })}

                {Array.from({
                  length: Math.max(
                    0,
                    pageSize - paginatedPages.length,
                  ),
                }).map((_, index) => (
                  <div
                    key={`blank-${index}`}
                    className="min-h-[44px] border-b border-[#f0f0ec] last:border-b-0"
                  />
                ))}
              </div>

              {/* PAGINATION */}

              <div className="flex h-[44px] shrink-0 items-center justify-between border-t border-[#e9e9e5] px-[10px]">
                <p className="whitespace-nowrap text-[8px] font-medium text-[#293681]">
                  Showing {filteredPages.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filteredPages.length)} of {filteredPages.length} pages
                </p>

                <div className="flex items-center gap-[4px]">
                  <button
                    type="button"
                    onClick={() => setActivePagination(1)}
                    disabled={safePage === 1}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#9298a1]"
                  >
                    <ChevronsLeft
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePagination(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronLeft
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  {Array.from({ length: totalPaginationPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <button
                        type="button"
                        key={pageNumber}
                        onClick={() =>
                          setActivePagination(
                            pageNumber,
                          )
                        }
                        className={`grid h-[25px] min-w-[25px] place-items-center rounded-[5px] px-[5px] text-[8px] font-semibold ${activePagination ===
                          pageNumber
                          ? "bg-[#8c6b1d] text-white"
                          : "border border-[#e4e5e1] bg-white text-[#626b7b]"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={() => setActivePagination(Math.min(totalPaginationPages, safePage + 1))}
                    disabled={safePage === totalPaginationPages}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronRight
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePagination(totalPaginationPages)}
                    disabled={safePage === totalPaginationPages}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronsRight
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>
                </div>

                <FilterSelect
                  value={`${pageSize} / page`}
                  onChange={(value) => setPageSize(Number(value.split(" ")[0]))}
                  options={[
                    "10 / page",
                    "20 / page",
                    "50 / page",
                  ]}
                  className="w-[90px]"
                />
              </div>
            </div>
          </div>

          {/* ===============================================
              RIGHT DETAILS
          =============================================== */}

          <aside
            className="flex min-h-0 flex-col overflow-hidden rounded-[7px] bg-white"
            style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px" }}
          >

            {/* HEADER */}

            <div className="flex h-[32px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-[#f0f3f6] px-2.5 backdrop-blur-sm">
              <h2 className="text-[11.5px] font-semibold tracking-[-0.01em] text-[#0f172a]">
                Page Details
              </h2>
            </div>

            {/* SELECTED PAGE */}

            <div className="h-[170px] shrink-0 border-b border-[#ebebe7] px-[13px] py-[8px]">
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-bold uppercase tracking-[0.02em] text-[#BE1A1A]">
                  SELECTED PAGE
                </p>

                <div className="flex items-center gap-[5px]">
                  <span
                    className={`inline-flex items-center gap-[4px] rounded-full px-[7px] py-[3px] text-[7px] font-bold ${selectedPageIsActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                      }`}
                  >
                    <span
                      className={`h-[5px] w-[5px] rounded-full ${selectedPageIsActive ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                    />
                    {selectedPageIsActive ? "Active" : "Inactive"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-[4px] rounded-full px-[7px] py-[3px] text-[7px] font-bold ${selectedPageIsPublished
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      }`}
                  >
                    {selectedPageIsPublished ? "Published" : "Not Published"}
                  </span>

                  <label className="relative ml-[2px] inline-block h-[24px] w-[42px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedPageIsPublished}
                      onChange={(e) => handleToggleStatus(e.target.checked)}
                    />
                    <span className="absolute inset-0 rounded-[30px] border border-[#ccc] bg-red-500 transition-all duration-300 peer-checked:border-transparent peer-checked:bg-[#5fdd54] before:absolute before:left-[1px] before:top-[1px] before:h-[20px] before:w-[20px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_#999999] before:content-[''] before:transition-all before:duration-300 peer-checked:before:translate-x-[18px]" />
                  </label>
                </div>
              </div>

              <div className="mt-[6px] flex items-start gap-[10px]">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-[#edf5eb] text-[#24774b]">
                  {selectedPage.type === "home" ? (
                    <Home
                      className="h-[17px] w-[17px]"
                      strokeWidth={1.7}
                    />
                  ) : selectedPage.type === "people" ? (
                    <UsersRound
                      className="h-[16px] w-[16px]"
                      strokeWidth={1.7}
                    />
                  ) : (
                    <FileText
                      className="h-[16px] w-[16px]"
                      strokeWidth={1.7}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-[6px]">
                    <h3 className="truncate text-[11.5px] font-bold text-[#293681]">
                      {selectedPage.title}
                    </h3>

                    {selectedPage.type === "home" && (
                      <span className="shrink-0 rounded-[4px] bg-[#edf5eb] px-[6px] py-[2px] text-[7px] font-semibold text-[#3b7b56]">
                        Homepage
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        selectedPagePublicUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    className="mt-[4px] flex max-w-full items-center gap-[4px] text-left text-[12px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                    title={selectedPagePublicUrl}
                  >
                    <span className="truncate">{selectedPagePublicUrl}</span>

                    <ExternalLink
                      className="h-[12px] w-[12px] shrink-0"
                      strokeWidth={1.7}
                    />
                  </button>

                  <div className="mt-[4px] flex items-center justify-between gap-[8px]">
                    <p className="truncate text-[10px] font-semibold text-[#17433F]">
                      Last updated {selectedPage.updated}
                    </p>

                    <p className="shrink-0 text-[10px] font-medium text-[#BE1A1A]">
                      by {loggedInAdminName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-[7px] grid grid-cols-2 gap-[7px]">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `/pages/${getCmsPageRouteKey(selectedPage)}/edit`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="flex h-[29px] items-center justify-center gap-[6px] rounded-[5px] bg-[#1E104E] text-[8px] font-semibold text-white transition hover:opacity-90"
                >
                  <Pencil
                    className="h-[10px] w-[10px]"
                    strokeWidth={1.7}
                  />

                  Edit Page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      selectedPagePublicUrl,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="flex h-[29px] items-center justify-center gap-[6px] rounded-[5px] border border-orange-200 bg-orange-50 text-[8px] font-semibold text-[#303a50] transition hover:bg-orange-100"
                >
                  <ExternalLink
                    className="h-[10px] w-[10px]"
                    strokeWidth={1.7}
                  />

                  View Live Page
                </button>
              </div>
            </div>

            {/* TABS */}

            <div className="grid h-[32px] shrink-0 grid-cols-4 border-b border-[#ebebe7]">
              {(
                [
                  "SEO",
                  "Content",
                  "Performance",
                  "History",
                ] as DetailTab[]
              ).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`relative text-[8px] font-semibold ${activeTab === tab
                    ? "text-[#384257]"
                    : "text-[#707783]"
                    }`}
                >
                  {tab}

                  {activeTab === tab && (
                    <span className="absolute inset-x-[9px] bottom-0 h-[1.5px] bg-[#bf8c25]" />
                  )}
                </button>
              ))}
            </div>

            {/* =============================================
                SEO TAB
            ============================================= */}

            {activeTab === "SEO" && (
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">

                {/* SEO SCORE */}

                <div className="grid h-[190px] shrink-0 grid-cols-[140px_1fr] border-b border-[#ebebe7]">
                  <div className="flex flex-col items-center justify-center border-r border-[#ebebe7] px-[10px]">
                    <p className="mb-[5px] w-full text-left text-[8px] font-semibold text-[#BE1A1A]">
                      SEO Score
                    </p>

                    <LargeSeoRing
                      score={selectedPage.seoScore}
                    />
                  </div>

                  <div className="flex flex-col justify-center gap-[8px] px-[12px]">
                    {([
                      ["Meta Title", Boolean(selectedPage.seo?.metaTitle)],
                      ["Meta Description", Boolean(selectedPage.seo?.metaDescription)],
                      ["Headings", Boolean(selectedPage.seo?.h1Tag)],
                      ["Content Quality", selectedPage.seoScore >= 70],
                      ["Internal Linking", selectedPageHasInternalLinks],
                      ["Images (ALT Text)", selectedPageHasImages],
                      ["Schema Markup", Boolean(selectedPage.seo?.schemaMarkup)],
                    ] as Array<[string, boolean]>).map(([label, isGood]) => (
                      <div
                        key={label}
                        className="grid grid-cols-[12px_1fr_auto] items-center gap-[5px]"
                      >
                        <CheckCircle2
                          className={`h-[10px] w-[10px] ${isGood ? "fill-[#26844e] text-white" : "text-amber-500"}`}
                          strokeWidth={1.5}
                        />

                        <span className="whitespace-nowrap text-[7.5px] font-medium text-[#566177]">
                          {label}
                        </span>

                        <span className={`text-[7px] font-semibold ${isGood ? "text-[#47805d]" : "text-amber-600"}`}>
                          {isGood ? "Good" : "Needs Work"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* META */}

                <div className="min-h-0 flex-1 overflow-visible px-[13px] py-[8px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[9px] font-bold text-[#465168]">
                      Meta Information
                    </h3>

                    <button
                      type="button"
                      className="rounded-[5px] border border-[#e3e4e0] px-[10px] py-[4px] text-[7px] font-semibold text-[#566176]"
                    >
                      Edit
                    </button>
                  </div>

                  {/* TITLE */}

                  <div className="mt-[6px]">
                    <p className="text-[7.5px] font-semibold text-black">
                      SEO Title
                    </p>

                    <div className="mt-[3px] flex items-end justify-between gap-[8px]">
                      <p className="text-[7.5px] font-medium leading-[1.3] text-[#4B1426]">
                        {selectedPage.seo?.metaTitle || "Not added yet"}
                      </p>

                      <span className="shrink-0 text-[6.8px] font-semibold">
                        <span className={(selectedPage.seo?.metaTitle?.length || 0) > 60 ? "text-rose-600" : "text-[#37805a]"}>
                          {selectedPage.seo?.metaTitle?.length ?? 0}
                        </span>
                        <span className="text-rose-600"> / 60</span>
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="mt-[5px] border-t border-[#f0f0ec] pt-[5px]">
                    <p className="text-[7.5px] font-semibold text-black">
                      Meta Description
                    </p>

                    <p className="mt-[3px] text-[7.2px] font-normal leading-[1.3] text-[#4c5669]">
                      {selectedPage.seo?.metaDescription || "Not added yet"}
                    </p>

                    <p className="mt-[2px] text-right text-[6.8px] font-semibold">
                      <span className={(selectedPage.seo?.metaDescription?.length || 0) > 160 ? "text-rose-600" : "text-[#37805a]"}>
                        {selectedPage.seo?.metaDescription?.length ?? 0}
                      </span>
                      <span className="text-rose-600"> / 160</span>
                    </p>
                  </div>

                  {/* KEYWORD */}

                  <div className="mt-[5px] border-t border-[#f0f0ec] pt-[5px]">
                    <p className="text-[7.5px] font-semibold text-black">
                      Focus Keyword
                    </p>

                    <p className="mt-[3px] text-[7.2px] font-medium leading-[1.3] text-[#626b7a]">
                      {selectedPage.seo?.metaKeywords || "Not added yet"}
                    </p>
                  </div>

                  {/* CANONICAL */}

                  <div className="mt-[5px] border-t border-[#f0f0ec] pt-[5px]">
                    <p className="text-[7.5px] font-semibold text-black">
                      Canonical URL
                    </p>

                    <div className="mt-[2px] flex items-center gap-[4px]">
                      <span className="text-[7px] font-normal text-[#4f596a]">
                        {selectedPage.seo?.canonicalUrl || `${PUBLIC_SITE_URL}${selectedPage.slug === "/" ? "/" : selectedPage.slug}`}
                      </span>

                      <ExternalLink
                        className="h-[8px] w-[8px] text-[#7b8492]"
                        strokeWidth={1.7}
                      />
                    </div>
                  </div>

                  {/* INDEX */}

                  <div className="mt-[5px] flex min-h-[22px] items-center justify-between border-t border-[#f0f0ec] pt-[4px]">
                    <span className="text-[7.5px] font-semibold text-black">
                      Index Status
                    </span>

                    <span className="text-[7px] font-semibold text-[#3c815b]">
                      {selectedPage.seo?.robotsIndex === false ? "No Index" : "Index"}
                    </span>
                  </div>

                  {/* ROBOTS */}

                  <div className="flex min-h-[22px] items-center justify-between border-t border-[#f0f0ec]">
                    <span className="text-[7.5px] font-semibold text-black">
                      Robots
                    </span>

                    <span className="text-[7px] font-normal text-[#586273]">
                      index, follow
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================
                CONTENT
            ============================================= */}

            {activeTab === "Content" && (
              <div className="min-h-0 flex-1 overflow-y-auto p-[13px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-bold text-[#26324a]">
                      Content Overview
                    </h3>
                    <p className="mt-[2px] text-[7.5px] font-medium text-[#7a8391]">
                      Live content structure for {selectedPage.title}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eef2ff] px-[8px] py-[4px] text-[7px] font-bold text-[#293681]">
                    {contentStats.sections} Sections
                  </span>
                </div>

                <div className="mt-[10px] grid grid-cols-2 gap-[7px]">
                  {[
                    {
                      label: "Sections",
                      value: String(contentStats.sections),
                      icon: Layers,
                      iconClass: "bg-blue-50 text-blue-700",
                    },
                    {
                      label: "Text Blocks",
                      value: String(contentStats.textBlocks),
                      icon: FileText,
                      iconClass: "bg-violet-50 text-violet-700",
                    },
                    {
                      label: "Images",
                      value: String(contentStats.images),
                      icon: ImageIcon,
                      iconClass: "bg-emerald-50 text-emerald-700",
                    },
                    {
                      label: "CTA Blocks",
                      value: String(contentStats.ctaBlocks),
                      icon: MousePointerClick,
                      iconClass: "bg-amber-50 text-amber-700",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-[8px] rounded-[7px] border border-[#e7e9e6] bg-white p-[9px]"
                        style={{
                          boxShadow:
                            "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.07) 0px 0px 0px 1px",
                        }}
                      >
                        <div
                          className={`grid h-[28px] w-[28px] shrink-0 place-items-center rounded-[7px] ${item.iconClass}`}
                        >
                          <Icon
                            className="h-[13px] w-[13px]"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[7.5px] font-semibold text-[#667085]">
                            {item.label}
                          </p>

                          <p className="mt-[2px] text-[16px] font-bold leading-none text-[#182238]">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-[10px] rounded-[8px] border border-[#e8e9e5] bg-[#fbfcfa]">
                  <div className="flex items-center justify-between border-b border-[#eceeea] px-[10px] py-[7px]">
                    <div className="flex items-center gap-[6px]">
                      <Layers className="h-[11px] w-[11px] text-[#293681]" />

                      <span className="text-[8px] font-bold text-[#344054]">
                        Page Sections
                      </span>
                    </div>

                    <span className="text-[7px] font-semibold text-[#7a8391]">
                      {selectedPageSections.length} total
                    </span>
                  </div>

                  <div className="max-h-[150px] overflow-y-auto px-[10px] py-[4px]">
                    {selectedPageSections.length > 0 ? (
                      selectedPageSections.map((section, index) => {
                        const sectionLabel =
                          section.title ||
                          section.heading ||
                          section.name ||
                          section.key ||
                          `Section ${index + 1}`;

                        const isEnabled = section.enabled !== false;

                        return (
                          <div
                            key={String(
                              section._id ??
                              section.key ??
                              `${sectionLabel}-${index}`,
                            )}
                            className="flex items-center justify-between gap-[8px] border-b border-[#efefec] py-[6px] last:border-b-0"
                          >
                            <div className="flex min-w-0 items-center gap-[7px]">
                              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#eef2ff] text-[6.5px] font-bold text-[#293681]">
                                {index + 1}
                              </span>

                              <span className="truncate text-[7.8px] font-semibold text-[#475467]">
                                {String(sectionLabel)}
                              </span>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-[6px] py-[2px] text-[6.5px] font-bold ${isEnabled
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                                }`}
                            >
                              {isEnabled ? "Visible" : "Hidden"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-[18px] text-center">
                        <FileText className="mx-auto h-[18px] w-[18px] text-slate-300" />

                        <p className="mt-[5px] text-[7.5px] font-medium text-[#8a93a2]">
                          No sections available for this page.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================
                PERFORMANCE
            ============================================= */}

            {activeTab === "Performance" && (
              <div className="min-h-0 flex-1 overflow-y-auto p-[13px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-bold text-[#26324a]">
                      Page Performance
                    </h3>

                    <p className="mt-[2px] text-[7.5px] font-medium text-[#7a8391]">
                      Measurement readiness for this page
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-50 px-[8px] py-[4px] text-[7px] font-bold text-amber-700 ring-1 ring-amber-100">
                    Live Metrics Not Connected
                  </span>
                </div>

                <div className="mt-[10px] grid grid-cols-3 gap-[7px]">
                  {[
                    ["LCP", "—", "Not Connected"],
                    ["INP", "—", "Not Connected"],
                    ["CLS", "—", "Not Connected"],
                  ].map(([label, value, status]) => (
                    <div
                      key={label}
                      className="rounded-[7px] border border-[#e7e9e6] bg-white px-[9px] py-[10px]"
                      style={{
                        boxShadow:
                          "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.07) 0px 0px 0px 1px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[7.5px] font-bold text-[#667085]">
                          {label}
                        </span>

                        <CircleGauge className="h-[11px] w-[11px] text-[#98a2b3]" />
                      </div>

                      <p className="mt-[6px] text-[18px] font-bold leading-none text-[#182238]">
                        {value}
                      </p>

                      <p className="mt-[5px] text-[6.8px] font-semibold text-amber-700">
                        {status}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-[10px] grid grid-cols-2 gap-[7px]">
                  <div className="rounded-[8px] border border-[#dbeafe] bg-[#eff6ff] p-[10px]">
                    <div className="flex items-center gap-[7px]">
                      <TrendingUp className="h-[13px] w-[13px] text-blue-700" />

                      <p className="text-[8px] font-bold text-blue-900">
                        SEO Readiness
                      </p>
                    </div>

                    <p className="mt-[6px] text-[18px] font-bold leading-none text-blue-900">
                      {selectedPage.seoScore}

                      <span className="ml-[2px] text-[7px] font-semibold text-blue-600">
                        /100
                      </span>
                    </p>

                    <p className="mt-[5px] text-[7px] font-semibold text-blue-700">
                      {selectedPage.rating}
                    </p>
                  </div>

                  <div className="rounded-[8px] border border-[#dcfce7] bg-[#f0fdf4] p-[10px]">
                    <div className="flex items-center gap-[7px]">
                      <Link2 className="h-[13px] w-[13px] text-emerald-700" />

                      <p className="text-[8px] font-bold text-emerald-900">
                        Internal Links
                      </p>
                    </div>

                    <p className="mt-[6px] text-[12px] font-bold leading-none text-emerald-900">
                      {selectedPageHasInternalLinks ? "Detected" : "Not Detected"}
                    </p>

                    <p className="mt-[6px] text-[7px] font-semibold text-emerald-700">
                      Based on current CMS content
                    </p>
                  </div>
                </div>

                <div className="mt-[10px] rounded-[8px] border border-amber-200 bg-amber-50/70 p-[10px]">
                  <div className="flex items-start gap-[8px]">
                    <Clock className="mt-[1px] h-[13px] w-[13px] shrink-0 text-amber-700" />

                    <div>
                      <p className="text-[8px] font-bold text-amber-900">
                        Core Web Vitals integration required
                      </p>

                      <p className="mt-[3px] text-[7.3px] font-medium leading-[1.45] text-amber-800">
                        LCP, INP and CLS are not currently stored per page by the backend.
                        Connect Lighthouse, PageSpeed or real-user monitoring to show measured values here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================
                HISTORY
            ============================================= */}

            {activeTab === "History" && (
              <div className="min-h-0 flex-1 overflow-y-auto p-[13px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-bold text-[#26324a]">
                      Page History
                    </h3>

                    <p className="mt-[2px] text-[7.5px] font-medium text-[#7a8391]">
                      Latest known activity for {selectedPage.title}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-[8px] py-[4px] text-[7px] font-bold ${selectedPageIsPublished
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      }`}
                  >
                    {selectedPageIsPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="mt-[12px] rounded-[8px] border border-[#e8e9e5] bg-white p-[10px]">
                  <div className="relative pl-[20px]">
                    <span className="absolute left-[4px] top-[4px] h-[8px] w-[8px] rounded-full bg-[#293681] ring-[3px] ring-[#eef2ff]" />

                    <span className="absolute bottom-[-20px] left-[7px] top-[14px] w-px bg-[#e4e7ec]" />

                    <p className="text-[8px] font-bold text-[#344054]">
                      Page updated
                    </p>

                    <p className="mt-[3px] text-[7.2px] font-medium text-[#667085]">
                      {selectedPage.updated}
                    </p>

                    <p className="mt-[2px] text-[7px] font-semibold text-[#BE1A1A]">
                      by {loggedInAdminName}
                    </p>
                  </div>

                  <div className="relative mt-[18px] pl-[20px]">
                    <span
                      className={`absolute left-[4px] top-[4px] h-[8px] w-[8px] rounded-full ring-[3px] ${selectedPageIsPublished
                        ? "bg-emerald-500 ring-emerald-50"
                        : "bg-amber-500 ring-amber-50"
                        }`}
                    />

                    <p className="text-[8px] font-bold text-[#344054]">
                      Current publishing state
                    </p>

                    <p
                      className={`mt-[3px] text-[7.2px] font-semibold ${selectedPageIsPublished
                        ? "text-emerald-700"
                        : "text-amber-700"
                        }`}
                    >
                      {selectedPageIsPublished
                        ? "Published and available on the live site"
                        : "Not published · stored as draft"}
                    </p>
                  </div>
                </div>

                <div className="mt-[10px] rounded-[8px] border border-[#e8e9e5] bg-[#fbfcfa] p-[10px]">
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-[7.5px] font-semibold text-[#667085]">
                      Live URL
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          selectedPagePublicUrl,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="flex min-w-0 items-center gap-[4px] text-[7px] font-bold text-blue-600 hover:underline"
                    >
                      <span className="max-w-[190px] truncate">
                        {selectedPagePublicUrl}
                      </span>

                      <ExternalLink className="h-[8px] w-[8px] shrink-0" />
                    </button>
                  </div>

                  <div className="mt-[7px] flex items-center justify-between border-t border-[#eceeea] pt-[7px]">
                    <span className="text-[7.5px] font-semibold text-[#667085]">
                      Page state
                    </span>

                    <span
                      className={`text-[7px] font-bold ${selectedPageIsActive
                        ? "text-emerald-700"
                        : "text-rose-700"
                        }`}
                    >
                      {selectedPageIsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <p className="mt-[10px] text-[7.4px] font-medium leading-[1.45] text-[#8a93a2]">
                  Detailed revision-by-revision history is not stored by the current backend,
                  so this panel only shows the latest real update and current page state.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* CUSTOM TOAST ALERT */}
      {toastMessage && (
        <div className={`fixed right-6 top-8 z-50 flex items-center gap-[12px] rounded-[8px] px-[16px] py-[12px] shadow-lg ring-1 transition-all duration-300 animate-in fade-in slide-in-from-top-8 ${toastMessage.type === "success"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-rose-200"
          }`}>
          <div className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-white shadow-sm ${toastMessage.type === "success" ? "text-emerald-600" : "text-rose-600"
            }`}>
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={2.5} />
            ) : (
              <X className="h-[14px] w-[14px]" strokeWidth={2.5} />
            )}
          </div>
          <p className="text-[12.5px] font-semibold">
            {toastMessage.title}
          </p>
        </div>
      )}
    </div>
  );
}
