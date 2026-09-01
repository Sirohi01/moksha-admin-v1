"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import typography from "./PagesTypography.module.css";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  FileText,
  Filter,
  Home,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  cmsPages,
  type CmsPage,
  type PageStatus,
  type PageType,
} from "@/lib/cmsPages";

/* =========================================================
   TYPES
========================================================= */

type DetailTab =
  | "SEO"
  | "Content"
  | "Performance"
  | "History";

const pages: CmsPage[] = cmsPages;

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
      className="relative grid h-[96px] w-[96px] shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(
          #18844c 0deg ${score * 3.6}deg,
          #edf1ed ${score * 3.6}deg 360deg
        )`,
      }}
    >
      <div className="grid h-[78px] w-[78px] place-items-center rounded-full bg-white">
        <div className="text-center">
          <div className="text-[23px] font-bold leading-none tracking-[-0.025em] text-[#17223a]">
            {score}
            <span className="ml-[1px] text-[8px] font-semibold">
              /100
            </span>
          </div>

          <p className="mt-[5px] text-[9px] font-semibold text-[#18844c]">
            Excellent
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
        className="h-[36px] w-full cursor-pointer appearance-none rounded-[6px] border border-[#e3e4e0] bg-white pl-[11px] pr-[28px] text-[9.5px] font-semibold text-[#374156] outline-none transition-colors hover:border-[#d2c9b3] focus:border-[#c39a43]"
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
  const [search, setSearch] = useState("");

  const [pageFilter, setPageFilter] =
    useState("All Pages");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [authorFilter, setAuthorFilter] =
    useState("All Authors");

  const [selectedPage, setSelectedPage] =
    useState<CmsPage>(pages[0]);

  const [activeTab, setActiveTab] =
    useState<DetailTab>("SEO");

  const [activePagination, setActivePagination] =
    useState(1);

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
  ]);

  return (
    <div className={`${typography.pages} h-full min-h-0 w-full overflow-hidden bg-[#fffefb] text-[#182238]`}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-[18px] pb-[10px] pt-[14px]">

        {/* =================================================
            TOP HEADING
        ================================================= */}

        <div className="flex h-[62px] shrink-0 items-start justify-between">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#18233b]">
              Pages &amp; CMS
            </h1>

            <div className="mt-[6px] flex items-center gap-[6px] text-[9px] font-medium text-[#6c7587]">
              <span>Dashboard</span>

              <ChevronRight
                className="h-[10px] w-[10px]"
                strokeWidth={1.7}
              />

              <span>Pages &amp; CMS</span>
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="flex h-[37px] items-center justify-center gap-[7px] rounded-[6px] border border-[#ddcda8] bg-[#fffefa] px-[18px] text-[9.5px] font-semibold text-[#45463e] shadow-[0_1px_4px_rgba(30,30,20,0.025)] transition hover:bg-[#fff9eb]"
            >
              <SlidersHorizontal
                className="h-[13px] w-[13px]"
                strokeWidth={1.7}
              />

              Reorder Pages
            </button>

            <button
              type="button"
              onClick={() => router.push("/pages/new")}
              className="flex h-[37px] items-center justify-center gap-[7px] rounded-[6px] bg-[linear-gradient(135deg,#bc861b,#d99b18)] px-[21px] text-[9.5px] font-semibold text-white shadow-[0_5px_12px_rgba(185,128,17,0.15)] transition hover:brightness-95"
            >
              <Plus
                className="h-[14px] w-[14px]"
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

            <div className="grid h-[84px] shrink-0 grid-cols-5 gap-[11px]">
              <div className="rounded-[7px] border border-[#e7e7e3] bg-white px-[13px] py-[9px]">
                <p className="text-[9px] font-semibold text-[#5e697d]">
                  Total Pages
                </p>

                <p className="mt-[4px] text-[18px] font-bold leading-none text-[#19243b]">
                  48
                </p>

                <p className="mt-[8px] text-[8.5px] font-medium text-[#606b7e]">
                  Published: 43
                </p>
              </div>

              <div className="rounded-[7px] border border-[#e7e7e3] bg-white px-[13px] py-[9px]">
                <p className="text-[9px] font-semibold text-[#5e697d]">
                  Draft Pages
                </p>

                <p className="mt-[4px] text-[18px] font-bold leading-none text-[#19243b]">
                  3
                </p>

                <p className="mt-[8px] text-[8.5px] font-medium text-[#606b7e]">
                  Unpublished
                </p>
              </div>

              <div className="rounded-[7px] border border-[#e7e7e3] bg-white px-[13px] py-[9px]">
                <p className="text-[9px] font-semibold text-[#5e697d]">
                  Total Sections
                </p>

                <p className="mt-[4px] text-[18px] font-bold leading-none text-[#19243b]">
                  156
                </p>

                <p className="mt-[8px] text-[8.5px] font-medium text-[#606b7e]">
                  Across all pages
                </p>
              </div>

              <div className="rounded-[7px] border border-[#e7e7e3] bg-white px-[13px] py-[9px]">
                <p className="text-[9px] font-semibold text-[#5e697d]">
                  Last Updated
                </p>

                <p className="mt-[4px] text-[12px] font-bold leading-[1.2] text-[#19243b]">
                  Today, 10:45 AM
                </p>

                <p className="mt-[7px] text-[8.5px] font-medium text-[#606b7e]">
                  By Admin User
                </p>
              </div>

              <div className="flex items-center justify-between rounded-[7px] border border-[#e7e7e3] bg-white px-[13px] py-[8px]">
                <div>
                  <p className="text-[9px] font-semibold text-[#5e697d]">
                    SEO Score (Avg.)
                  </p>

                  <p className="mt-[4px] text-[17px] font-bold leading-none text-[#19243b]">
                    86/100
                  </p>

                  <p className="mt-[7px] text-[8.5px] font-semibold text-[#258052]">
                    Good
                  </p>
                </div>

                <div
                  className="relative h-[42px] w-[42px] shrink-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#1a864d 0deg 298deg,#d7a02d 298deg 342deg,#eef1ed 342deg 360deg)",
                  }}
                >
                  <div className="absolute inset-[4px] rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* =============================================
                FILTER ROW
            ============================================= */}

            <div className="mt-[13px] flex h-[36px] shrink-0 items-center gap-[9px]">
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
                  className="h-[36px] w-full rounded-[6px] border border-[#e3e4e0] bg-white pl-[33px] pr-[11px] text-[9px] font-normal text-[#424c5f] outline-none placeholder:text-[#9298a3] focus:border-[#c8ad70]"
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
                className="flex h-[36px] w-[82px] shrink-0 items-center justify-center gap-[6px] rounded-[6px] border border-[#e3e4e0] bg-white text-[9.5px] font-semibold text-[#374156]"
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

            <div className="mt-[13px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e7e7e3] bg-white">

              {/* TABLE HEADER */}

              <div className="grid h-[34px] shrink-0 grid-cols-[2.35fr_1.7fr_1.3fr_1.02fr_1.15fr_1.55fr_76px] items-center border-b border-[#e8e5df] bg-[#fbf9f5] px-[10px]">
                <div className="px-[4px] text-[8px] font-bold text-[#445067]">
                  PAGE TITLE
                </div>

                <div className="px-[4px] text-[8px] font-bold text-[#445067]">
                  URL
                </div>

                <div className="px-[4px] text-[8px] font-bold text-[#445067]">
                  AUTHOR
                </div>

                <div className="px-[4px] text-[8px] font-bold text-[#445067]">
                  STATUS
                </div>

                <div className="px-[4px] text-[8px] font-bold text-[#445067]">
                  SEO SCORE
                </div>

                <div className="px-[4px] text-[8px] font-bold text-[#445067]">
                  LAST UPDATED
                </div>

                <div className="text-center text-[8px] font-bold text-[#445067]">
                  ACTIONS
                </div>
              </div>

              {/* ROWS */}

              <div className="grid min-h-0 flex-1 grid-rows-10">
                {filteredPages.map((page) => {
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
                      className={`grid min-h-0 w-full grid-cols-[2.35fr_1.7fr_1.3fr_1.02fr_1.15fr_1.55fr_76px] items-center border-b border-[#f0f0ec] px-[10px] text-left transition last:border-b-0 ${selected
                        ? "bg-[#fffefa]"
                        : "bg-white hover:bg-[#fffefa]"
                        }`}
                    >

                      {/* TITLE */}

                      <div className="flex min-w-0 items-center gap-[7px] px-[4px]">
                        <PageTypeIcon type={page.type} />

                        <div className="flex min-w-0 items-center gap-[5px]">
                          <span className="whitespace-nowrap text-[9.5px] font-bold text-[#303a4f]">
                            {page.title}
                          </span>

                          {page.type === "home" && (
                            <span className="shrink-0 rounded-[4px] bg-[#edf5eb] px-[5px] py-[2px] text-[7px] font-semibold text-[#397b54]">
                              Homepage
                            </span>
                          )}
                        </div>
                      </div>

                      {/* URL */}

                      <div className="flex min-w-0 items-center gap-[5px] px-[4px]">
                        <span className="whitespace-nowrap text-[8px] font-medium text-[#626e81]">
                          {page.slug}
                        </span>

                        <ExternalLink
                          className="h-[10px] w-[10px] shrink-0 text-[#7b8494]"
                          strokeWidth={1.7}
                        />
                      </div>

                      {/* AUTHOR */}

                      <div className="flex min-w-0 items-center gap-[6px] px-[4px]">
                        <AuthorIcon />

                        <span className="whitespace-nowrap text-[8px] font-medium text-[#465168]">
                          {page.author}
                        </span>
                      </div>

                      {/* STATUS */}

                      <div className="px-[4px]">
                        <span
                          className={`inline-flex items-center gap-[4px] whitespace-nowrap rounded-[4px] px-[6px] py-[3px] text-[7.5px] font-semibold ${page.status === "Published"
                            ? "bg-[#edf6ee] text-[#327d50]"
                            : "bg-[#fff3de] text-[#bf8120]"
                            }`}
                        >
                          <span
                            className={`h-[4px] w-[4px] rounded-full ${page.status === "Published"
                              ? "bg-[#308052]"
                              : "bg-[#e59b28]"
                              }`}
                          />

                          {page.status}
                        </span>
                      </div>

                      {/* SCORE */}

                      <div className="flex items-center gap-[6px] px-[4px]">
                        <SeoRing score={page.seoScore} />

                        <div>
                          <p className="text-[12px] font-bold leading-none text-[#2c374c]">
                            {page.seoScore}
                          </p>

                          <p
                            className={`mt-[3px] whitespace-nowrap text-[7px] font-semibold leading-none ${page.rating === "Needs Work"
                              ? "text-[#d98b1f]"
                              : "text-[#38805a]"
                              }`}
                          >
                            {page.rating}
                          </p>
                        </div>
                      </div>

                      {/* UPDATED */}

                      <div className="min-w-0 px-[4px]">
                        <p className="whitespace-nowrap text-[7.7px] font-medium leading-[1.3] text-[#465168]">
                          {page.updated}
                        </p>

                        <p className="mt-[2px] whitespace-nowrap text-[7px] font-normal leading-[1.3] text-[#6d7789]">
                          by {page.updatedBy}
                        </p>
                      </div>

                      {/* ACTIONS */}

                      <div
                        className="relative flex items-center justify-center gap-[5px]"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `/pages/${page.id}/edit`,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] bg-white text-[#566176] transition hover:bg-[#f7f8f5]"
                        >
                          <Pencil
                            className="h-[10px] w-[10px]"
                            strokeWidth={1.7}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActionMenu(
                              actionMenu === page.id
                                ? null
                                : page.id,
                            )
                          }
                          className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] bg-white text-[#566176] transition hover:bg-[#f7f8f5]"
                        >
                          <MoreVertical
                            className="h-[12px] w-[12px]"
                            strokeWidth={1.7}
                          />
                        </button>

                        {actionMenu === page.id && (
                          <div className="absolute right-0 top-[29px] z-[100] w-[115px] rounded-[6px] border border-[#e4e4e0] bg-white p-[4px] shadow-[0_8px_20px_rgba(15,23,42,0.11)]">
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  `/pages/${page.id}/edit`,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              className="w-full rounded-[4px] px-[8px] py-[6px] text-left text-[8px] font-medium text-[#465168] hover:bg-[#f6f7f4]"
                            >
                              Edit Page
                            </button>

                            <button
                              type="button"
                              className="w-full rounded-[4px] px-[8px] py-[6px] text-left text-[8px] font-medium text-[#465168] hover:bg-[#f6f7f4]"
                            >
                              Duplicate
                            </button>

                            <button
                              type="button"
                              className="w-full rounded-[4px] px-[8px] py-[6px] text-left text-[8px] font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {Array.from({
                  length: Math.max(
                    0,
                    10 - filteredPages.length,
                  ),
                }).map((_, index) => (
                  <div
                    key={`blank-${index}`}
                    className="border-b border-[#f0f0ec] last:border-b-0"
                  />
                ))}
              </div>

              {/* PAGINATION */}

              <div className="flex h-[44px] shrink-0 items-center justify-between border-t border-[#e9e9e5] px-[10px]">
                <p className="whitespace-nowrap text-[8px] font-medium text-[#657084]">
                  Showing 1 to 10 of 48 pages
                </p>

                <div className="flex items-center gap-[4px]">
                  <button
                    type="button"
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#9298a1]"
                  >
                    <ChevronsLeft
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  <button
                    type="button"
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronLeft
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  {[1, 2, 3, 4, 5].map(
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

                  <span className="px-[2px] text-[8px] text-[#7c8490]">
                    ...
                  </span>

                  <button
                    type="button"
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronRight
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  <button
                    type="button"
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronsRight
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>
                </div>

                <FilterSelect
                  value="10 / page"
                  onChange={() => { }}
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

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-[7px] border border-[#e7e7e3] bg-white">

            {/* HEADER */}

            <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-[#ebebe7] px-[13px]">
              <h2 className="text-[14px] font-bold tracking-[-0.01em] text-[#303a50]">
                Page Details
              </h2>

              <X
                className="h-[13px] w-[13px] text-[#8a919c]"
                strokeWidth={1.6}
              />
            </div>

            {/* SELECTED PAGE */}

            <div className="h-[148px] shrink-0 border-b border-[#ebebe7] px-[13px] py-[10px]">
              <p className="text-[8px] font-bold uppercase tracking-[0.02em] text-[#566177]">
                SELECTED PAGE
              </p>

              <div className="mt-[8px] flex items-start gap-[10px]">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-[#edf5eb] text-[#24774b]">
                  {selectedPage.type === "home" ? (
                    <Home
                      className="h-[17px] w-[17px]"
                      strokeWidth={1.7}
                    />
                  ) : selectedPage.type ===
                    "people" ? (
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
                    <h3 className="text-[11.5px] font-bold text-[#303a50]">
                      {selectedPage.title}
                    </h3>

                    {selectedPage.type ===
                      "home" && (
                        <span className="rounded-[4px] bg-[#edf5eb] px-[6px] py-[2px] text-[7px] font-semibold text-[#3b7b56]">
                          Homepage
                        </span>
                      )}
                  </div>

                  <div className="mt-[5px] flex items-center gap-[4px]">
                    <span className="text-[8px] font-medium text-[#697386]">
                      {selectedPage.slug}
                    </span>

                    <ExternalLink
                      className="h-[9px] w-[9px] text-[#7a8495]"
                      strokeWidth={1.7}
                    />
                  </div>

                  <p className="mt-[5px] text-[7.8px] font-medium text-[#606b7e]">
                    Published on 20 May 2026
                  </p>

                  <p className="mt-[3px] text-[7.8px] font-medium text-[#606b7e]">
                    by {selectedPage.author}
                  </p>
                </div>
              </div>

              <div className="mt-[9px] grid grid-cols-2 gap-[7px]">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `/pages/${selectedPage.id}/edit`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="flex h-[29px] items-center justify-center gap-[6px] rounded-[5px] bg-[linear-gradient(135deg,#126039,#0a4e2e)] text-[8px] font-semibold text-white"
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
                      `/pages/${selectedPage.id}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="flex h-[29px] items-center justify-center gap-[6px] rounded-[5px] border border-[#d0bf95] bg-[#fffefa] text-[8px] font-semibold text-[#53564e]"
                >
                  <ExternalLink
                    className="h-[10px] w-[10px]"
                    strokeWidth={1.7}
                  />

                  View Page
                </button>
              </div>
            </div>

            {/* TABS */}

            <div className="grid h-[38px] shrink-0 grid-cols-4 border-b border-[#ebebe7]">
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
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

                {/* SEO SCORE */}

                <div className="grid h-[162px] shrink-0 grid-cols-[124px_1fr] border-b border-[#ebebe7]">
                  <div className="flex flex-col items-center justify-center border-r border-[#ebebe7] px-[10px]">
                    <p className="mb-[5px] w-full text-left text-[8px] font-semibold text-[#59647a]">
                      SEO Score
                    </p>

                    <LargeSeoRing
                      score={selectedPage.seoScore}
                    />
                  </div>

                  <div className="flex flex-col justify-center gap-[6px] px-[12px]">
                    {[
                      "Meta Title",
                      "Meta Description",
                      "Headings",
                      "Content Quality",
                      "Internal Linking",
                      "Images (ALT Text)",
                      "Schema Markup",
                    ].map((label) => (
                      <div
                        key={label}
                        className="grid grid-cols-[12px_1fr_auto] items-center gap-[5px]"
                      >
                        <CheckCircle2
                          className="h-[10px] w-[10px] fill-[#26844e] text-white"
                          strokeWidth={1.5}
                        />

                        <span className="whitespace-nowrap text-[7.5px] font-medium text-[#566177]">
                          {label}
                        </span>

                        <span className="text-[7px] font-semibold text-[#47805d]">
                          Good
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* META */}

                <div className="min-h-0 flex-1 overflow-hidden px-[13px] py-[8px]">
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
                    <p className="text-[7.5px] font-semibold text-[#687386]">
                      SEO Title
                    </p>

                    <div className="mt-[3px] flex items-end justify-between gap-[8px]">
                      <p className="text-[7.5px] font-medium leading-[1.3] text-[#465168]">
                        Moksha Sewa – Dignity in Every Final
                        Journey
                      </p>

                      <span className="shrink-0 text-[6.8px] font-medium text-[#737d8e]">
                        52 / 60
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="mt-[5px] border-t border-[#f0f0ec] pt-[5px]">
                    <p className="text-[7.5px] font-semibold text-[#687386]">
                      Meta Description
                    </p>

                    <p className="mt-[3px] text-[7.2px] font-normal leading-[1.3] text-[#4c5669]">
                      Moksha Sewa provides free last rites,
                      cremation, rituals and support for
                      unclaimed and financially weak families
                      in Delhi, Ghaziabad and Noida with
                      dignity and compassion.
                    </p>

                    <p className="mt-[2px] text-right text-[6.8px] font-semibold text-[#37805a]">
                      148 / 160
                    </p>
                  </div>

                  {/* KEYWORD */}

                  <div className="mt-[5px] border-t border-[#f0f0ec] pt-[5px]">
                    <p className="text-[7.5px] font-semibold text-[#687386]">
                      Focus Keyword
                    </p>

                    <span className="mt-[3px] inline-flex rounded-full bg-[#f2f3f1] px-[7px] py-[3px] text-[6.8px] font-medium text-[#626b7a]">
                      moksha sewa
                    </span>
                  </div>

                  {/* CANONICAL */}

                  <div className="mt-[5px] border-t border-[#f0f0ec] pt-[5px]">
                    <p className="text-[7.5px] font-semibold text-[#687386]">
                      Canonical URL
                    </p>

                    <div className="mt-[2px] flex items-center gap-[4px]">
                      <span className="text-[7px] font-normal text-[#4f596a]">
                        https://mokshasewa.org/
                      </span>

                      <ExternalLink
                        className="h-[8px] w-[8px] text-[#7b8492]"
                        strokeWidth={1.7}
                      />
                    </div>
                  </div>

                  {/* INDEX */}

                  <div className="mt-[5px] flex min-h-[22px] items-center justify-between border-t border-[#f0f0ec] pt-[4px]">
                    <span className="text-[7.5px] font-semibold text-[#687386]">
                      Index Status
                    </span>

                    <span className="text-[7px] font-semibold text-[#3c815b]">
                      Index
                    </span>
                  </div>

                  {/* ROBOTS */}

                  <div className="flex min-h-[22px] items-center justify-between border-t border-[#f0f0ec]">
                    <span className="text-[7.5px] font-semibold text-[#687386]">
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
              <div className="min-h-0 flex-1 p-[13px]">
                <h3 className="text-[12px] font-bold text-[#364055]">
                  Content Overview
                </h3>

                <div className="mt-[11px] grid grid-cols-2 gap-[8px]">
                  {[
                    ["Sections", "12"],
                    ["Text Blocks", "28"],
                    ["Images", "14"],
                    ["CTA Blocks", "6"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[6px] border border-[#e7e7e3] bg-[#fafaf8] p-[11px]"
                    >
                      <p className="text-[8px] font-medium text-[#667184]">
                        {label}
                      </p>

                      <p className="mt-[4px] text-[16px] font-bold text-[#263149]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =============================================
                PERFORMANCE
            ============================================= */}

            {activeTab === "Performance" && (
              <div className="min-h-0 flex-1 p-[13px]">
                <h3 className="text-[12px] font-bold text-[#364055]">
                  Page Performance
                </h3>

                <div className="mt-[11px] grid grid-cols-2 gap-[8px]">
                  {[
                    ["LCP", "2.1s"],
                    ["INP", "128ms"],
                    ["CLS", "0.06"],
                    ["Performance", "91"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[6px] bg-[#f8f9f6] p-[11px]"
                    >
                      <p className="text-[8px] font-medium text-[#667184]">
                        {label}
                      </p>

                      <p className="mt-[4px] text-[16px] font-bold text-[#263149]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =============================================
                HISTORY
            ============================================= */}

            {activeTab === "History" && (
              <div className="min-h-0 flex-1 p-[13px]">
                <h3 className="text-[12px] font-bold text-[#364055]">
                  Page History
                </h3>

                <div className="mt-[11px] space-y-[9px]">
                  {[
                    [
                      "Today, 10:45 AM",
                      "SEO meta information updated",
                    ],
                    [
                      "30 May 2026",
                      "Hero content updated",
                    ],
                    [
                      "28 May 2026",
                      "Gallery section edited",
                    ],
                    [
                      "20 May 2026",
                      "Page published",
                    ],
                  ].map(([date, activity]) => (
                    <div
                      key={date}
                      className="flex gap-[7px] border-b border-[#eeeeea] pb-[8px]"
                    >
                      <span className="mt-[4px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#b68a28]" />

                      <div>
                        <p className="text-[8px] font-semibold text-[#465168]">
                          {activity}
                        </p>

                        <p className="mt-[2px] text-[7px] font-normal text-[#7a8391]">
                          {date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
