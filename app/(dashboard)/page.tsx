"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import typography from "./DashboardTypography.module.css";
import { dashboardApi, type LiveDashboardOverview } from "@/lib/dashboardApi";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  FileSearch,
  FileText,
  Globe2,
  ImageIcon,
  Link2,
  LockKeyhole,
  Menu,
  MousePointerClick,
  Search,
  ShieldCheck,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

type DropdownKey =
  | "menu"
  | "website"
  | "date"
  | "notifications"
  | "profile"
  | "search-console-range"
  | "analytics-range"
  | "web-vitals-range"
  | "top-pages-range"
  | "keyword-range"
  | "location-range"
  | null;

type IssueTone = "rose" | "amber" | "violet";

type IssueLevel = "High" | "Medium" | "Low";

interface DashboardIssue {
  label: string;
  level: IssueLevel;
  count: number;
  icon: LucideIcon;
  tone: IssueTone;
}

const defaultTopStats = [
  {
    title: "SEO HEALTH SCORE",
    value: "92",
    suffix: "/100",
    note: "Excellent",
    icon: TrendingUp,
    tone: "emerald",
    footer: "View full SEO report",
    spark: [
      18, 14, 17, 12, 20, 24,
      19, 22, 26, 23, 30, 36,
    ],
  },
  {
    title: "TOTAL PAGES",
    value: "48",
    note: "↑ 5 this month",
    icon: FileText,
    tone: "violet",
    footer: "View all pages",
  },
  {
    title: "TOTAL POSTS",
    value: "32",
    note: "↑ 6 this month",
    icon: FileSearch,
    tone: "amber",
    footer: "View all posts",
  },
  {
    title: "INDEXED PAGES",
    value: "43",
    suffix: "/48",
    note: "89.6% Indexed",
    icon: Search,
    tone: "blue",
    footer: "View details",
  },
  {
    title: "SEWA ENQUIRIES (MTD)",
    value: "58",
    note: "↑ 18.4% this month",
    icon: Users,
    tone: "rose",
    footer: "View all submissions",
  },
  {
    title: "CONVERSION RATE",
    value: "4.8%",
    note: "↑ 1.2% this month",
    icon: Target,
    tone: "emerald",
    footer: "View analytics",
  },
];

const issues: DashboardIssue[] = [
  {
    label: "3 pages are missing meta description",
    level: "High",
    count: 3,
    icon: FileText,
    tone: "rose",
  },
  {
    label: "2 pages are not indexed",
    level: "High",
    count: 2,
    icon: FileText,
    tone: "rose",
  },
  {
    label: "Home page LCP issue detected",
    level: "High",
    count: 1,
    icon: CircleGauge,
    tone: "amber",
  },
  {
    label: "7 images missing ALT text",
    level: "Medium",
    count: 7,
    icon: ImageIcon,
    tone: "amber",
  },
  {
    label: "4 broken internal links found",
    level: "Medium",
    count: 4,
    icon: Link2,
    tone: "amber",
  },
  {
    label: "About page traffic dropped by 21%",
    level: "Low",
    count: 1,
    icon: TrendingDown,
    tone: "violet",
  },
  {
    label: "New keyword opportunities found",
    level: "Low",
    count: 12,
    icon: MousePointerClick,
    tone: "violet",
  },
];

const topPages = [
  ["Home", "/", "5,842"],
  ["Our Services", "/our-services", "3,214"],
  ["About Us", "/about-us", "2,189"],
  ["How We Help", "/how-we-help", "1,876"],
  ["Contact Us", "/contact-us", "1,421"],
];

const keywordRows = [
  ["moksha sewa", "652", "4,812", "8.3"],
  ["free antim sanskar", "421", "3,210", "6.7"],
  ["final journey help", "312", "2,102", "9.1"],
  ["unclaimed body sewa", "289", "1,987", "7.8"],
  ["last rites support", "254", "1,456", "10.2"],
];

const locations = [
  ["Delhi", 24, "41.4%"],
  ["Ghaziabad", 18, "31.0%"],
  ["Noida", 11, "19.9%"],
  ["Faridabad", 3, "5.2%"],
  ["Gurugram", 2, "3.4%"],
];

const submissions = [
  [
    "Rahul Sharma",
    "Sewa Help Request",
    "10 mins ago",
  ],
  [
    "Neha Verma",
    "Volunteer Registration",
    "1 hour ago",
  ],
  [
    "Amit Gupta",
    "CSR Enquiry",
    "2 hours ago",
  ],
  [
    "Pooja Singh",
    "Partnership Enquiry",
    "3 hours ago",
  ],
  [
    "Sandeep Kumar",
    "Contact Us",
    "4 hours ago",
  ],
];

const toneClass = {
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-100",
  violet:
    "bg-violet-50 text-violet-700 ring-violet-100",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-100",
  blue:
    "bg-blue-50 text-blue-700 ring-blue-100",
  rose:
    "bg-rose-50 text-rose-700 ring-rose-100",
} as const;

const searchConsoleRanges = [
  "Last 7 Days",
  "Last 28 Days",
  "Last 3 Months",
  "Last 6 Months",
  "Last 12 Months",
];

const analyticsRanges = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "This Month",
  "Previous Month",
];

const webVitalsRanges = [
  "Last 7 Days",
  "Last 28 Days",
  "Last 3 Months",
];

const monthlyRanges = [
  "This Month",
  "Previous Month",
  "Last 3 Months",
  "Last 6 Months",
];

function MiniSparkline({
  points,
}: {
  points: number[];
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);

  const width = 148;
  const height = 27;
  const pad = 2;

  const path = points
    .map((value, index) => {
      const x =
        pad +
        (index / (points.length - 1)) *
        (width - pad * 2);

      const y =
        height -
        pad -
        ((value - min) /
          Math.max(1, max - min)) *
        (height - pad * 2);

      return `${index === 0 ? "M" : "L"
        } ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[27px] w-full"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-emerald-700"
      />
    </svg>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const items = Children.toArray(children);
  const lastItem = items.at(-1);
  const hasFooter = isValidElement(lastItem) && lastItem.type === FooterButton;

  return (
    <section
      className={`relative min-h-0 rounded-[11px] border border-[#e5e7e6] bg-white ${hasFooter ? "flex flex-col overflow-hidden" : "overflow-auto"} ${className}`}
    >
      {hasFooter ? (
        <>
          <div className="min-h-0 flex-1 overflow-auto pb-1">{items.slice(0, -1)}</div>
          {lastItem}
        </>
      ) : children}
    </section>
  );
}

function PanelTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 flex h-[38px] shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-3 backdrop-blur-sm">
      <h2 className="text-[12px] font-semibold tracking-[-0.01em] text-[#13213d]">
        {children}
      </h2>

      {right}
    </div>
  );
}

/* =========================================================
   FOOTER BUTTON
========================================================= */

function FooterButton({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <button
      type="button"
      className={`mx-3 mb-2 mt-1 flex h-[30px] shrink-0 items-center justify-center gap-2 rounded-md text-[9.5px] font-bold transition ${dark ? "bg-[#071d3c] text-white hover:bg-[#0b2a55]" : "border border-[#eee8dc] bg-[#fffdf8] text-[#27344c] hover:bg-[#fff9ed]"}`}
    >
      {children}

      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

function RangeDropdown({
  dropdownKey,
  openDropdown,
  setOpenDropdown,
  value,
  setValue,
  options,
}: {
  dropdownKey: DropdownKey;
  openDropdown: DropdownKey;
  setOpenDropdown: React.Dispatch<
    React.SetStateAction<DropdownKey>
  >;
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  const isOpen = openDropdown === dropdownKey;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPosition({
      top: rect.bottom + 7,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div
      className="relative"
      data-dashboard-dropdown
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          updateMenuPosition();
          setOpenDropdown(isOpen ? null : dropdownKey);
        }}
        className="flex items-center gap-1 text-[8px] font-bold"
      >
        {value}

        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          data-dashboard-dropdown
          className="fixed z-[9999] min-w-[142px] overflow-hidden rounded-[9px] border border-[#e5e2da] bg-white p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.14)]"
          style={{ top: menuPosition.top, right: menuPosition.right }}
        >
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                setValue(option);
                setOpenDropdown(null);
              }}
              className={`flex w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-left text-[10px] font-bold transition ${value === option
                ? "bg-[#f2f5f2] text-[#26372b]"
                : "text-[#465168] hover:bg-[#f7f7f4]"
                }`}
            >
              <span>{option}</span>

              {value === option && (
                <Check className="h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [liveDashboard, setLiveDashboard] = useState<LiveDashboardOverview | null>(null);
  const [openDropdown, setOpenDropdown] =
    useState<DropdownKey>(null);

  const [selectedWebsite, setSelectedWebsite] = useState("mokshasewa.org");
  const [selectedDate, setSelectedDate] = useState("31 May 2026");
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [notificationCount, setNotificationCount] = useState(8);

  useEffect(() => {
    let active = true;
    dashboardApi.overview().then((data) => {
      if (active) setLiveDashboard(data);
    }).catch(() => {
      if (active) setLiveDashboard(null);
    });
    return () => { active = false; };
  }, []);

  const internal = liveDashboard?.sources.internal.data;
  const analytics = liveDashboard?.sources.analytics.data;
  const searchConsole = liveDashboard?.sources.searchConsole.data;
  const pageSpeed = liveDashboard?.sources.pageSpeed.data;
  const number = (value: number) => new Intl.NumberFormat("en-IN").format(Math.round(value));
  const duration = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
  const growthText = (value: number | null | undefined, inverse = false) => {
    if (value == null) return "—";
    const adjusted = inverse ? -value : value;
    return `${adjusted >= 0 ? "↑" : "↓"} ${Math.abs(value).toFixed(1)}%`;
  };
  const locationRows = internal?.topLocations.length
    ? internal.topLocations.map((item) => [item.city, item.count, `${internal.totalEnquiries > 0 ? ((item.count / internal.totalEnquiries) * 100).toFixed(1) : "0.0"}%`] as [string, number, string])
    : locations;
  const submissionRows = internal?.recentSubmissions.length
    ? internal.recentSubmissions.map((item) => [item.name, item.type.replaceAll("_", " "), new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })])
    : submissions;
  const topStats = defaultTopStats.map((item) => {
    if (item.title === "SEO HEALTH SCORE" && pageSpeed) return { ...item, value: String(pageSpeed.seoScore), note: pageSpeed.seoScore >= 90 ? "Excellent" : pageSpeed.seoScore >= 70 ? "Good" : "Needs Work" };
    if (item.title === "TOTAL PAGES" && internal) return { ...item, value: String(internal.totalPages), note: "Live from CMS" };
    if (item.title === "TOTAL POSTS" && internal) return { ...item, value: String(internal.totalPosts), note: growthText(internal.growth.posts) };
    if (item.title === "SEWA ENQUIRIES (MTD)" && internal) return { ...item, value: String(internal.enquiriesMtd), note: growthText(internal.growth.enquiriesMtd) };
    if (item.title === "CONVERSION RATE" && analytics) {
      const rate = analytics.sessions > 0 ? (analytics.conversions / analytics.sessions) * 100 : 0;
      return { ...item, value: `${rate.toFixed(1)}%`, note: growthText(analytics.growth.conversionRate) };
    }
    return item;
  });

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((current) => current === key ? null : key);
  };

  const [
    searchConsoleRange,
    setSearchConsoleRange,
  ] = useState("Last 28 Days");

  const [
    analyticsRange,
    setAnalyticsRange,
  ] = useState("Last 30 Days");

  const [
    webVitalsRange,
    setWebVitalsRange,
  ] = useState("Last 28 Days");

  const [
    topPagesRange,
    setTopPagesRange,
  ] = useState("This Month");

  const [
    keywordRange,
    setKeywordRange,
  ] = useState("This Month");

  const [
    locationRange,
    setLocationRange,
  ] = useState("This Month");

  useEffect(() => {
    const handleMouseDown = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          "[data-dashboard-dropdown]"
        )
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleMouseDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  return (
    <div className={`${typography.dashboard} min-h-full w-full overflow-visible bg-white text-[#13213d]`}>
      <div className="flex min-h-full flex-col overflow-visible">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="hidden">
          <div className="flex h-full items-center justify-between gap-3">

            {/* LEFT */}

            <div className="flex min-w-0 items-center gap-2.5">

              {/* MENU */}

              <div
                className="relative shrink-0"
                data-dashboard-dropdown
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown("menu")}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#30392d] text-white transition hover:bg-[#222b20]"
                >
                  {openDropdown === "menu" ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                {openDropdown === "menu" && (
                  <div className="absolute left-0 top-[48px] z-[120] w-[210px] overflow-hidden rounded-[12px] border border-[#e5e2da] bg-white p-2 shadow-[0_14px_40px_rgba(15,23,42,0.16)]">

                    <div className="border-b border-[#ecece7] px-2.5 pb-2 pt-1">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8a92a0]">
                        Navigation
                      </p>
                    </div>

                    {[
                      "Dashboard",
                      "Website Pages",
                      "Blog Posts",
                      "SEO Manager",
                      "Analytics",
                      "Form Submissions",
                      "Media Library",
                      "Settings",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setActiveMenuItem(item);
                          setOpenDropdown(null);
                        }}
                        className={`mt-1 flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[10px] font-bold transition ${activeMenuItem === item
                          ? "bg-[#30392d] text-white"
                          : "text-[#33415a] hover:bg-[#f5f6f3]"
                          }`}
                      >
                        {item}

                        {activeMenuItem === item && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TITLE */}

              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-extrabold leading-tight tracking-[-0.025em]">
                  Welcome back, Admin!{" "}
                  <span className="text-[18px]">👋</span>
                </h1>

                <p className="truncate text-[11px] font-medium leading-tight text-[#4a5261]">
                  Here&apos;s an overview of your website{" "}
                  <b className="font-extrabold">
                    mokshasewa.org
                  </b>
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div className="hidden items-center gap-2 xl:flex">

              {/* WEBSITE DROPDOWN */}

              <div
                className="relative"
                data-dashboard-dropdown
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown("website")
                  }
                  className="flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e2da] bg-[#fffdfa] px-3 text-[10px] font-bold transition hover:bg-[#fff8eb]"
                >
                  <Globe2 className="h-3.5 w-3.5" />

                  {selectedWebsite}

                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${openDropdown === "website"
                      ? "rotate-180"
                      : ""
                      }`}
                  />
                </button>

                {openDropdown === "website" && (
                  <div className="absolute right-0 top-[44px] z-[120] w-[205px] overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white p-2 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">

                    <p className="px-2 pb-2 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#8b93a2]">
                      Select Website
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWebsite(
                          "mokshasewa.org"
                        );
                        setOpenDropdown(null);
                      }}
                      className="flex w-full items-center justify-between rounded-[7px] bg-[#f4f6f2] px-3 py-2.5 text-[9px] font-bold text-[#26372b]"
                    >
                      <span className="flex items-center gap-2">
                        <Globe2 className="h-3.5 w-3.5" />
                        mokshasewa.org
                      </span>

                      <Check className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.open(
                          "https://mokshasewa.org",
                          "_blank",
                          "noopener,noreferrer"
                        );
                        setOpenDropdown(null);
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-[7px] px-3 py-2.5 text-left text-[9px] font-bold text-[#465168] transition hover:bg-[#f7f7f4]"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Open Live Website
                    </button>
                  </div>
                )}
              </div>

              {/* DATE DROPDOWN */}

              <div
                className="relative"
                data-dashboard-dropdown
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown("date")}
                  className="flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e2da] bg-[#fffdfa] px-3 text-[10px] font-bold transition hover:bg-[#fff8eb]"
                >
                  <CalendarDays className="h-3.5 w-3.5" />

                  {selectedDate}

                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${openDropdown === "date"
                      ? "rotate-180"
                      : ""
                      }`}
                  />
                </button>

                {openDropdown === "date" && (
                  <div className="absolute right-0 top-[44px] z-[120] w-[175px] overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white p-2 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">

                    <p className="px-2 pb-2 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#8b93a2]">
                      Select Date
                    </p>

                    {[
                      "31 May 2026",
                      "30 May 2026",
                      "29 May 2026",
                      "28 May 2026",
                      "27 May 2026",
                    ].map((date) => (
                      <button
                        type="button"
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-[7px] px-3 py-2 text-left text-[9px] font-bold transition ${selectedDate === date
                          ? "bg-[#f4f6f2] text-[#26372b]"
                          : "text-[#465168] hover:bg-[#f7f7f4]"
                          }`}
                      >
                        {date}

                        {selectedDate === date && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* NOTIFICATION */}

              <div
                className="relative"
                data-dashboard-dropdown
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown("notifications")
                  }
                  className="relative grid h-9 w-9 place-items-center rounded-[9px] transition hover:bg-[#f5f6f3]"
                >
                  <Bell className="h-[18px] w-[18px]" />

                  {notificationCount > 0 && (
                    <span className="absolute right-0 top-0 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-red-600 px-1 text-[8px] font-extrabold text-white">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {openDropdown ===
                  "notifications" && (
                    <div className="absolute right-0 top-[44px] z-[120] w-[320px] overflow-hidden rounded-[12px] border border-[#e5e2da] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.16)]">

                      <div className="flex items-center justify-between border-b border-[#ecece7] px-4 py-3">
                        <div>
                          <p className="text-[11px] font-extrabold">
                            Notifications
                          </p>

                          <p className="mt-0.5 text-[8px] font-medium text-[#7b8494]">
                            Recent website alerts
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setNotificationCount(0);
                          }}
                          className="text-[8px] font-extrabold text-[#18745c]"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="max-h-[290px] overflow-y-auto p-2">
                        {[
                          [
                            "SEO Issue",
                            "3 pages are missing meta descriptions.",
                            "5 mins ago",
                          ],
                          [
                            "Performance",
                            "Home page LCP issue detected.",
                            "20 mins ago",
                          ],
                          [
                            "New Submission",
                            "A new Sewa Help Request was received.",
                            "35 mins ago",
                          ],
                          [
                            "SEO Opportunity",
                            "12 new keyword opportunities found.",
                            "1 hour ago",
                          ],
                        ].map(
                          ([title, description, time]) => (
                            <button
                              type="button"
                              key={title}
                              onClick={() =>
                                setOpenDropdown(null)
                              }
                              className="flex w-full gap-3 rounded-[8px] px-2.5 py-2.5 text-left transition hover:bg-[#f7f8f6]"
                            >
                              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f0f4f1]">
                                <Bell className="h-3.5 w-3.5 text-[#315340]" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-[9px] font-extrabold text-[#24324a]">
                                  {title}
                                </p>

                                <p className="mt-0.5 text-[8px] font-medium leading-[1.4] text-[#647083]">
                                  {description}
                                </p>

                                <p className="mt-1 text-[7px] font-bold text-[#9aa2af]">
                                  {time}
                                </p>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* PROFILE */}

              <div
                className="relative"
                data-dashboard-dropdown
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown("profile")
                  }
                  className="flex items-center gap-2 rounded-[9px] px-1.5 py-1 transition hover:bg-[#f7f7f4]"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#edf3f6]">
                    <UserRound className="h-4.5 w-4.5" />
                  </div>

                  <div className="text-left leading-tight">
                    <p className="text-[10px] font-extrabold">
                      Admin User
                    </p>

                    <p className="text-[8px] font-semibold text-[#5f6774]">
                      Super Admin
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${openDropdown === "profile"
                      ? "rotate-180"
                      : ""
                      }`}
                  />
                </button>

                {openDropdown === "profile" && (
                  <div className="absolute right-0 top-[46px] z-[120] w-[190px] overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white p-2 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">

                    <div className="border-b border-[#ecece7] px-2.5 pb-2 pt-1">
                      <p className="text-[9px] font-extrabold">
                        Admin User
                      </p>

                      <p className="mt-0.5 text-[8px] font-medium text-[#7a8494]">
                        Super Admin
                      </p>
                    </div>

                    {[
                      "My Profile",
                      "Account Settings",
                      "Security Settings",
                    ].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() =>
                          setOpenDropdown(null)
                        }
                        className="mt-1 flex w-full rounded-[7px] px-3 py-2 text-left text-[9px] font-bold text-[#465168] transition hover:bg-[#f7f7f4]"
                      >
                        {item}
                      </button>
                    ))}

                    <div className="my-1 border-t border-[#ecece7]" />

                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(null)
                      }
                      className="flex w-full rounded-[7px] px-3 py-2 text-left text-[9px] font-extrabold text-red-600 transition hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-visible px-1.5 py-2">
          <div className="grid h-full min-h-0 w-full grid-rows-[145px_310px_minmax(0,1.08fr)_minmax(0,0.76fr)] gap-2">

            {/* =============================
                TOP STATS
            ============================== */}

            <div className="grid min-h-0 grid-cols-6 gap-2">
              {topStats.map((item) => {
                const Icon = item.icon;

                return (
                  <Panel
                    key={item.title}
                    className="flex flex-col !overflow-hidden p-2.5 !pb-9"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ${toneClass[
                          item.tone as keyof typeof toneClass
                        ]
                          }`}
                      >
                        <Icon className="h-[20px] w-[20px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-extrabold tracking-[0.01em] text-[#29406a]">
                          {item.title}
                        </p>

                        <div className="mt-1 flex items-end gap-1">
                          <span className="text-[24px] font-extrabold leading-none tracking-[-0.04em]">
                            {item.value}
                          </span>

                          {item.suffix && (
                            <span className="mb-0.5 text-[11px] font-bold">
                              {item.suffix}
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-1 text-[10px] font-bold ${item.title ===
                            "INDEXED PAGES"
                            ? "text-blue-600"
                            : "text-emerald-700"
                            }`}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>

                    {item.spark && (
                      <div className="mt-0.5">
                        <MiniSparkline
                          points={item.spark}
                        />
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-center gap-1.5 text-[8.5px] font-extrabold text-[#293957]">
                      {item.footer}

                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Panel>
                );
              })}
            </div>

            {/* =============================
                ROW 2
            ============================== */}

            <div className="grid h-[310px] min-h-0 grid-cols-[0.92fr_1.12fr_1.06fr] gap-2">

              {/* SEO HEALTH */}

              <Panel>
                <PanelTitle>
                  SEO Health Overview
                </PanelTitle>

                <div className="grid min-h-0 grid-cols-[132px_1fr] items-center gap-2 px-3">
                  <div className="relative mx-auto h-[116px] w-[116px] rounded-full bg-[conic-gradient(#148151_0deg_255deg,#e9a11c_255deg_331deg,#edf0ea_331deg_360deg)]">
                    <div className="absolute inset-[11px] grid place-items-center rounded-full bg-white text-center">
                      <div>
                        <div className="text-[36px] font-extrabold leading-none">
                          92
                        </div>

                        <div className="mt-1 text-[11px] font-bold text-emerald-700">
                          Excellent
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-[4px] text-[10px] font-bold">
                    {[
                      ["Meta Title", "Good", true],
                      [
                        "Meta Description",
                        "Good",
                        true,
                      ],
                      ["Headings", "Good", true],
                      [
                        "Content Quality",
                        "Good",
                        true,
                      ],
                      [
                        "Internal Linking",
                        "Needs Work",
                        false,
                      ],
                      [
                        "Images (ALT Text)",
                        "Needs Work",
                        false,
                      ],
                      [
                        "Schema Markup",
                        "Good",
                        true,
                      ],
                      [
                        "Mobile Friendliness",
                        "Good",
                        true,
                      ],
                      ["Page Speed", "Good", true],
                    ].map(
                      ([name, status, ok]) => (
                        <div
                          key={String(name)}
                          className="grid grid-cols-[14px_1fr_auto] items-center gap-1"
                        >
                          {ok ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          )}

                          <span>{name}</span>

                          <span
                            className={
                              ok
                                ? "text-emerald-700"
                                : "text-amber-500"
                            }
                          >
                            {status}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <FooterButton>
                  View Full SEO Report
                </FooterButton>
              </Panel>

              {/* SEARCH CONSOLE */}

              <Panel>
                <PanelTitle
                  right={
                    <RangeDropdown
                      dropdownKey="search-console-range"
                      openDropdown={
                        openDropdown
                      }
                      setOpenDropdown={
                        setOpenDropdown
                      }
                      value={
                        searchConsoleRange
                      }
                      setValue={
                        setSearchConsoleRange
                      }
                      options={
                        searchConsoleRanges
                      }
                    />
                  }
                >
                  Google Search Console Summary
                </PanelTitle>

                <div className="grid grid-cols-4 gap-1.5 px-3">
                  {[
                    [
                      "Total Clicks",
                      searchConsole ? number(searchConsole.clicks) : "3.62K",
                      searchConsole ? growthText(searchConsole.growth.clicks) : "↑ 18.6%",
                    ],
                    [
                      "Total Impressions",
                      searchConsole ? number(searchConsole.impressions) : "85.7K",
                      searchConsole ? growthText(searchConsole.growth.impressions) : "↑ 20.4%",
                    ],
                    [
                      "Average CTR",
                      searchConsole ? `${searchConsole.ctr.toFixed(2)}%` : "4.23%",
                      searchConsole ? growthText(searchConsole.growth.ctr) : "↑ 8.7%",
                    ],
                    [
                      "Average Position",
                      searchConsole ? searchConsole.position.toFixed(1) : "12.6",
                      searchConsole ? growthText(searchConsole.growth.position, true) : "",
                    ],
                  ].map(
                    ([label, value, change]) => (
                      <div
                        key={label}
                        className="rounded-[7px] bg-[#f5f7fb] px-2 py-1.5"
                      >
                        <p className="text-[9px] font-bold text-[#334666]">
                          {label}
                        </p>

                        <p className="mt-1 text-[18px] font-extrabold">
                          {value}
                        </p>

                        {change && (
                          <p className="mt-0.5 text-[9px] font-bold text-emerald-700">
                            {change}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="min-h-0 flex-1 px-3 pt-1">
                  <svg
                    viewBox="0 0 520 118"
                    preserveAspectRatio="none"
                    className="h-[90px] w-full"
                  >
                    {[22, 52, 82].map(
                      (y) => (
                        <line
                          key={y}
                          x1="34"
                          x2="508"
                          y1={y}
                          y2={y}
                          stroke="#edf0f4"
                          strokeWidth="1"
                        />
                      )
                    )}

                    <path
                      d="M42 80 C60 58,72 72,88 50 S115 72,130 56 S160 80,175 60 S200 79,218 56 S244 73,259 48 S292 84,310 63 S342 76,360 49 S387 75,402 56 S430 78,448 55 S478 70,500 44"
                      fill="none"
                      stroke="#22a06b"
                      strokeWidth="2.4"
                    />

                    <path
                      d="M42 92 C58 72,77 86,90 64 S116 84,134 69 S163 91,181 70 S211 88,226 69 S258 89,276 63 S305 90,321 74 S353 91,369 66 S400 88,416 70 S448 89,464 69 S484 77,500 61"
                      fill="none"
                      stroke="#3d7bda"
                      strokeWidth="2.4"
                    />

                    <text
                      x="38"
                      y="113"
                      fontSize="12"
                      fontWeight="600"
                      fill="#68748a"
                    >
                      03 May
                    </text>

                    <text
                      x="145"
                      y="113"
                      fontSize="12"
                      fontWeight="600"
                      fill="#68748a"
                    >
                      10 May
                    </text>

                    <text
                      x="254"
                      y="113"
                      fontSize="12"
                      fontWeight="600"
                      fill="#68748a"
                    >
                      17 May
                    </text>

                    <text
                      x="365"
                      y="113"
                      fontSize="12"
                      fontWeight="600"
                      fill="#68748a"
                    >
                      24 May
                    </text>

                    <text
                      x="468"
                      y="113"
                      fontSize="12"
                      fontWeight="600"
                      fill="#68748a"
                    >
                      31 May
                    </text>
                  </svg>
                </div>

                <FooterButton>
                  View Full Search Console
                </FooterButton>
              </Panel>

              {/* ACTION REQUIRED */}

              <Panel>
                <PanelTitle
                  right={
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[10px] font-bold"
                    >
                      View All Issues

                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  }
                >
                  Action Required
                </PanelTitle>

                <div className="px-3">
                  {issues.map(
                    ({
                      label,
                      level,
                      count,
                      icon: Icon,
                      tone,
                    }) => (
                      <div
                        key={label}
                        className="grid grid-cols-[24px_1fr_auto_22px] items-center gap-2 border-b border-[#f0f0ec] py-[5px] text-[10px] last:border-b-0"
                      >
                        <div
                          className={`grid h-[24px] w-[24px] place-items-center rounded-[6px] ${toneClass[tone]}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <span className="truncate font-bold text-[#2e3c58]">
                          {label}
                        </span>

                        <span
                          className={`font-bold ${level === "High"
                            ? "text-rose-600"
                            : level ===
                              "Medium"
                              ? "text-amber-600"
                              : "text-emerald-700"
                            }`}
                        >
                          {level}
                        </span>

                        <span className="grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[#f8f2ee] px-1 font-extrabold text-[#695b50]">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <FooterButton dark>
                  Fix Issues Now
                </FooterButton>
              </Panel>
            </div>

            {/* =============================
                ROW 3
            ============================== */}

            <div className="grid min-h-0 grid-cols-[0.92fr_1.12fr_1.06fr] gap-2">

              {/* ANALYTICS */}

              <Panel>
                <PanelTitle
                  right={
                    <RangeDropdown
                      dropdownKey="analytics-range"
                      openDropdown={
                        openDropdown
                      }
                      setOpenDropdown={
                        setOpenDropdown
                      }
                      value={analyticsRange}
                      setValue={
                        setAnalyticsRange
                      }
                      options={
                        analyticsRanges
                      }
                    />
                  }
                >
                  Analytics Overview
                </PanelTitle>

                <div className="grid grid-cols-5 gap-1 px-3">
                  {[
                    [
                      "Users",
                      analytics ? number(analytics.users) : "12,842",
                      analytics ? growthText(analytics.growth.users) : "↑ 18.7%",
                      true,
                    ],
                    [
                      "Sessions",
                      analytics ? number(analytics.sessions) : "18,942",
                      analytics ? growthText(analytics.growth.sessions) : "↑ 21.3%",
                      true,
                    ],
                    [
                      "Page Views",
                      analytics ? number(analytics.pageViews) : "28,561",
                      analytics ? growthText(analytics.growth.pageViews) : "↑ 22.4%",
                      true,
                    ],
                    [
                      "Avg. Session",
                      analytics ? duration(analytics.averageSessionSeconds) : "02:45",
                      analytics ? growthText(analytics.growth.averageSession) : "↑ 8.3%",
                      true,
                    ],
                    [
                      "Bounce Rate",
                      analytics ? `${analytics.bounceRate.toFixed(1)}%` : "32.6%",
                      analytics ? growthText(analytics.growth.bounceRate, true) : "↓ 5.1%",
                      false,
                    ],
                  ].map(
                    ([
                      label,
                      value,
                      delta,
                      good,
                    ]) => (
                      <div
                        key={String(label)}
                        className="rounded-[6px] bg-[#f7f8fb] p-1.5"
                      >
                        <p className="text-[9px] font-bold text-[#394867]">
                          {label}
                        </p>

                        <p className="mt-0.5 text-[15px] font-extrabold">
                          {value}
                        </p>

                        <p
                          className={`mt-0.5 text-[9px] font-bold ${good
                            ? "text-emerald-700"
                            : "text-rose-600"
                            }`}
                        >
                          {delta}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="px-3 pt-1">
                  <svg
                    viewBox="0 0 430 85"
                    preserveAspectRatio="none"
                    className="h-[62px] w-full"
                  >
                    <path
                      d="M8 70 L35 57 L58 61 L84 49 L110 46 L138 54 L164 35 L193 49 L219 54 L246 39 L272 58 L300 51 L327 33 L354 55 L383 48 L418 31"
                      fill="none"
                      stroke="#317f62"
                      strokeWidth="2"
                    />

                    <path
                      d="M8 70 L35 57 L58 61 L84 49 L110 46 L138 54 L164 35 L193 49 L219 54 L246 39 L272 58 L300 51 L327 33 L354 55 L383 48 L418 31 L418 79 L8 79 Z"
                      fill="#e9f4ef"
                    />
                  </svg>
                </div>

                <FooterButton>
                  View Full Analytics Report
                </FooterButton>
              </Panel>

              {/* CORE WEB VITALS */}

              <Panel>
                <PanelTitle
                  right={
                    <RangeDropdown
                      dropdownKey="web-vitals-range"
                      openDropdown={
                        openDropdown
                      }
                      setOpenDropdown={
                        setOpenDropdown
                      }
                      value={webVitalsRange}
                      setValue={
                        setWebVitalsRange
                      }
                      options={
                        webVitalsRanges
                      }
                    />
                  }
                >
                  Core Web Vitals (Field Data)
                </PanelTitle>

                <div className="grid grid-cols-3 gap-1.5 px-3">
                  {[
                    [
                      "Largest Contentful Paint (LCP)",
                      pageSpeed?.lcp != null ? `${(pageSpeed.lcp / 1000).toFixed(1)}s` : "2.1s",
                      "Good",
                      "90%",
                    ],
                    [
                      "Interaction to Next Paint (INP)",
                      pageSpeed?.inp != null ? `${Math.round(pageSpeed.inp)}ms` : "128ms",
                      "Good",
                      "92%",
                    ],
                    [
                      "Cumulative Layout Shift (CLS)",
                      pageSpeed?.cls != null ? pageSpeed.cls.toFixed(2) : "0.06",
                      "Good",
                      "94%",
                    ],
                  ].map(
                    ([
                      label,
                      value,
                      status,
                      score,
                    ]) => (
                      <div
                        key={String(label)}
                        className="rounded-[6px] bg-[#f7f8fb] p-1.5"
                      >
                        <p className="text-[9px] font-bold text-[#34435f]">
                          {label}
                        </p>

                        <p className="mt-0.5 text-[16px] font-extrabold">
                          {value}
                        </p>

                        <p className="text-[9px] font-bold text-emerald-700">
                          {status}
                        </p>

                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#e5ece8]">
                          <div className="h-full w-[92%] rounded-full bg-emerald-700" />
                        </div>

                        <p className="mt-0.5 text-right text-[8px] font-bold text-emerald-700">
                          {score}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="px-3 pt-1.5">
                  <p className="mb-0.5 text-[10px] font-extrabold">
                    Other Performance Metrics
                  </p>

                  <div className="grid grid-cols-[1fr_64px_64px] gap-x-2 text-[9px] font-bold">
                    <div className="bg-[#f7f8fb] px-2 py-0.5">
                      Metric
                    </div>

                    <div className="bg-[#f7f8fb] px-2 py-0.5 text-center">
                      Mobile
                    </div>

                    <div className="bg-[#f7f8fb] px-2 py-0.5 text-center">
                      Desktop
                    </div>

                    {[
                      [
                        "First Contentful Paint (FCP)",
                        pageSpeed?.fcp != null ? `${(pageSpeed.fcp / 1000).toFixed(1)}s` : "1.5s",
                        "0.9s",
                      ],
                      [
                        "Time to First Byte (TTFB)",
                        "0.7s",
                        "0.4s",
                      ],
                      [
                        "Total Blocking Time (TBT)",
                        pageSpeed?.tbt != null ? `${Math.round(pageSpeed.tbt)}ms` : "120ms",
                        "80ms",
                      ],
                    ].map((row) => (
                      <div
                        key={row[0]}
                        className="contents"
                      >
                        <div className="px-2 py-0.5">
                          {row[0]}
                        </div>

                        <div className="px-2 py-0.5 text-center text-emerald-700">
                          {row[1]}
                        </div>

                        <div className="px-2 py-0.5 text-center text-emerald-700">
                          {row[2]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <FooterButton>
                  View Performance Center
                </FooterButton>
              </Panel>

              {/* SITE STATUS */}

              <Panel>
                <PanelTitle>
                  Site Status
                </PanelTitle>

                <div className="px-3">
                  {[
                    [
                      LockKeyhole,
                      "SSL Certificate",
                      "Valid",
                    ],
                    [
                      ShieldCheck,
                      "Security Status",
                      "Secure",
                    ],
                    [
                      Timer,
                      "Uptime (Last 30 days)",
                      "99.9%",
                    ],
                    [
                      Activity,
                      "Last Backup",
                      "30 May 2026, 02:30 AM",
                    ],
                    [
                      Globe2,
                      "WordPress Version",
                      "6.5.3",
                    ],
                    [
                      Wrench,
                      "PHP Version",
                      "8.2.14",
                    ],
                  ].map(
                    ([
                      Icon,
                      label,
                      value,
                    ]) => (
                      <div
                        key={String(label)}
                        className="grid grid-cols-[19px_1fr_auto_17px] items-center gap-2 border-b border-[#f0f0ec] py-[6px] text-[10px] last:border-b-0"
                      >
                        <Icon className="h-4 w-4 text-[#3b4d70]" />

                        <span className="font-bold">
                          {label as string}
                        </span>

                        <span className="font-bold text-emerald-700">
                          {value as string}
                        </span>

                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      </div>
                    )
                  )}
                </div>

                <FooterButton>
                  View Site Health
                </FooterButton>
              </Panel>
            </div>

            {/* =============================
                BOTTOM ROW
            ============================== */}

            <div className="grid min-h-0 grid-cols-[1.02fr_1fr_1fr_1.12fr] gap-2">

              {/* TOP PAGES */}

              <Panel>
                <PanelTitle
                  right={
                    <RangeDropdown
                      dropdownKey="top-pages-range"
                      openDropdown={
                        openDropdown
                      }
                      setOpenDropdown={
                        setOpenDropdown
                      }
                      value={topPagesRange}
                      setValue={
                        setTopPagesRange
                      }
                      options={
                        monthlyRanges
                      }
                    />
                  }
                >
                  Top Pages by Traffic
                </PanelTitle>

                <div className="px-3 text-[9px]">
                  {topPages.map(
                    (row, index) => (
                      <div
                        key={row[0]}
                        className="grid grid-cols-[16px_1fr_76px_42px_14px] items-center gap-1 py-[3px] font-bold"
                      >
                        <span>
                          {index + 1}.
                        </span>

                        <span>{row[0]}</span>

                        <span className="truncate text-[#5f6b7e]">
                          {row[1]}
                        </span>

                        <span className="text-right">
                          {row[2]}
                        </span>

                        <Search className="h-3 w-3 text-[#9aa5b4]" />
                      </div>
                    )
                  )}
                </div>

                <FooterButton>
                  View All Pages Analytics
                </FooterButton>
              </Panel>

              {/* KEYWORD PERFORMANCE */}

              <Panel>
                <PanelTitle
                  right={
                    <RangeDropdown
                      dropdownKey="keyword-range"
                      openDropdown={
                        openDropdown
                      }
                      setOpenDropdown={
                        setOpenDropdown
                      }
                      value={keywordRange}
                      setValue={
                        setKeywordRange
                      }
                      options={
                        monthlyRanges
                      }
                    />
                  }
                >
                  Keyword Performance
                </PanelTitle>

                <div className="grid grid-cols-[1fr_42px_62px_50px] gap-1 px-3 text-[9px] font-bold">
                  <span>Keyword</span>
                  <span>Clicks</span>
                  <span>Impressions</span>
                  <span>Position</span>

                  {keywordRows.map(
                    (row) => (
                      <div
                        className="contents"
                        key={row[0]}
                      >
                        <span className="py-[3px]">
                          {row[0]}
                        </span>

                        <span className="py-[3px]">
                          {row[1]}
                        </span>

                        <span className="py-[3px]">
                          {row[2]}
                        </span>

                        <span className="py-[3px] text-emerald-700">
                          {row[3]} ↑
                        </span>
                      </div>
                    )
                  )}
                </div>

                <FooterButton>
                  View All Keyword Data
                </FooterButton>
              </Panel>

              {/* LOCATIONS */}

              <Panel>
                <PanelTitle
                  right={
                    <RangeDropdown
                      dropdownKey="location-range"
                      openDropdown={
                        openDropdown
                      }
                      setOpenDropdown={
                        setOpenDropdown
                      }
                      value={locationRange}
                      setValue={
                        setLocationRange
                      }
                      options={
                        monthlyRanges
                      }
                    />
                  }
                >
                  Top Sewa Help Locations
                </PanelTitle>

                <div className="space-y-[6px] px-3 pt-1">
                  {locationRows.map(
                    (
                      [
                        name,
                        count,
                        pct,
                      ],
                      index
                    ) => (
                      <div
                        key={String(name)}
                        className="grid grid-cols-[62px_1fr_28px_42px] items-center gap-1.5 text-[9px] font-bold"
                      >
                        <span>{name}</span>

                        <div className="h-1.5 rounded-full bg-[#edf2f8]">
                          <div
                            className="h-full rounded-full bg-[#2f77d7]"
                            style={{
                              width: `${88 -
                                index * 14
                                }%`,
                            }}
                          />
                        </div>

                        <span className="text-right">
                          {count}
                        </span>

                        <span className="text-right text-[#6b7280]">
                          ({pct})
                        </span>
                      </div>
                    )
                  )}
                </div>

                <FooterButton>
                  View Full Location Report
                </FooterButton>
              </Panel>

              {/* RECENT SUBMISSIONS */}

              <Panel>
                <PanelTitle
                  right={
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[10px] font-bold"
                    >
                      View All

                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  }
                >
                  Recent Form Submissions
                </PanelTitle>

                <div className="px-3">
                  {submissionRows.map(
                    (row, index) => (
                      <div
                        key={row[0]}
                        className="grid grid-cols-[20px_1fr_1.1fr_auto] items-center gap-1.5 py-[3px] text-[9px] font-bold"
                      >
                        <div
                          className={`grid h-[20px] w-[20px] place-items-center rounded-full ${index === 0
                            ? "bg-emerald-50 text-emerald-700"
                            : index === 1
                              ? "bg-violet-50 text-violet-700"
                              : index === 2
                                ? "bg-amber-50 text-amber-700"
                                : index ===
                                  3
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                        >
                          <FileText className="h-3 w-3" />
                        </div>

                        <span className="truncate">
                          {row[0]}
                        </span>

                        <span className="truncate text-[#43526d]">
                          {row[1]}
                        </span>

                        <span className="whitespace-nowrap text-[#43526d]">
                          {row[2]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </main>

        {/* =================================
            FOOTER
        ================================== */}

        <footer className="hidden">

          {/* SAME SOFT COLOR COMBINATION */}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28px] bg-[linear-gradient(to_top,rgba(214,230,220,0.55),rgba(250,249,246,0))]" />

          {/* SAME RIGHT SIDE IMAGE */}

          <div
            className="pointer-events-none absolute bottom-0 right-0 z-0 h-full w-[370px] bg-no-repeat"
            style={{
              backgroundImage:
                'url("/assets/footer-moksha-scene.png")',
              backgroundSize:
                "370px 64px",
              backgroundPosition:
                "right bottom",
            }}
          />

          {/* ADMIN FOOTER CONTENT */}

          <div className="relative z-10 flex h-full items-center px-4 pr-[390px]">
            <div className="flex w-full items-center justify-center">
              <p className="text-center text-[11px] font-medium text-slate-600">
                &copy;{" "}
                {new Date().getFullYear()}{" "}
                <span className="font-semibold text-slate-900">
                  Namo Gange Trust
                </span>{" "}
                — Free Cremation Assistance.
                Admin Panel. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
