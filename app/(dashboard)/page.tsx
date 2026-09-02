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

function AnimatedCounter({
  value,
  duration = 1200,
}: {
  value: string | number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState<string | number>("");

  useEffect(() => {
    const strVal = String(value);
    const numericMatch = strVal.match(/^([^\d.]*)([\d,.]+)(.*)$/);

    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const prefix = numericMatch[1];
    const rawNumberStr = numericMatch[2].replace(/,/g, "");
    const targetNum = parseFloat(rawNumberStr);
    const suffix = numericMatch[3];

    if (isNaN(targetNum) || targetNum === 0) {
      setDisplayValue(value);
      return;
    }

    const hasComma = numericMatch[2].includes(",");
    const decimalPlaces = (rawNumberStr.split(".")[1] || "").length;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = targetNum * easeProgress;

      let formattedNum = currentNum.toFixed(decimalPlaces);
      if (hasComma) {
        const parts = formattedNum.split(".");
        parts[0] = parseInt(parts[0], 10).toLocaleString();
        formattedNum = parts.join(".");
      }

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <>{displayValue || value}</>;
}

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
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0fdf4 100%)",
    numColor: "#047857",
    footer: "View full SEO report",
  },
  {
    title: "TOTAL PAGES",
    value: "48",
    note: "↑ 5 this month",
    icon: FileText,
    tone: "violet",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f8f5ff 100%)",
    numColor: "#6d28d9",
    footer: "View all pages",
  },
  {
    title: "TOTAL POSTS",
    value: "32",
    note: "↑ 6 this month",
    icon: FileSearch,
    tone: "amber",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #fffdf0 100%)",
    numColor: "#b45309",
    footer: "View all posts",
  },
  {
    title: "INDEXED PAGES",
    value: "43",
    suffix: "/48",
    note: "89.6% Indexed",
    icon: Search,
    tone: "blue",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0f7ff 100%)",
    numColor: "#1d4ed8",
    footer: "View details",
  },
  {
    title: "SEWA ENQUIRIES (MTD)",
    value: "58",
    note: "↑ 18.4% this month",
    icon: Users,
    tone: "rose",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #fff5f6 100%)",
    numColor: "#be123c",
    footer: "View all submissions",
  },
  {
    title: "CONVERSION RATE",
    value: "4.8%",
    note: "↑ 1.2% this month",
    icon: Target,
    tone: "emerald",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0fdfa 100%)",
    numColor: "#0f766e",
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
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const items = Children.toArray(children);
  const firstItem = items[0];
  const isHeader = isValidElement(firstItem) && firstItem.type === PanelTitle;
  const lastItem = items.at(-1);
  const hasFooter = isValidElement(lastItem) && lastItem.type === FooterButton;

  const bodyItems = isHeader
    ? hasFooter
      ? items.slice(1, -1)
      : items.slice(1)
    : hasFooter
    ? items.slice(0, -1)
    : items;

  return (
    <section
      className={`relative flex flex-col min-h-0 rounded-[11px] border border-[#e5e7e6] bg-white overflow-hidden ${className}`}
      style={{
        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
        ...style,
      }}
    >
      {isHeader && firstItem}

      <div className="min-h-0 flex-1 flex flex-col justify-between overflow-auto pb-0">
        {bodyItems}
      </div>

      {hasFooter && lastItem}
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
    <div className="sticky top-0 z-20 flex h-[32px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-[#f0f3f6] px-2.5 backdrop-blur-sm">
      <h2 className="text-[10.5px] !font-semibold tracking-[-0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
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
      className={`mx-2.5 mb-1.5 mt-0.5 flex h-[26px] shrink-0 items-center justify-center gap-1.5 rounded-md text-[8.5px] font-bold transition ${dark ? "bg-[#071d3c] text-white hover:bg-[#0b2a55]" : "border border-[#eee8dc] bg-[#fffdf8] text-[#27344c] hover:bg-[#fff9ed]"}`}
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

              <div
                className="min-w-0 rounded-md border border-black bg-white px-3 py-1.5"
                style={{
                  boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px"
                }}
              >
                <h1 className="truncate text-[20px] font-extrabold leading-tight tracking-[-0.025em]">
                  Welcome back, Vansh!{" "}
                  <span className="text-[18px]">👋</span>
                </h1>

                <p className="truncate text-[11px] font-medium leading-tight text-[#4a5261]">
                  Here&apos;s an overview of your website today{" "}
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

        <main className="min-h-0 flex-1 overflow-visible pl-5 pr-1.5 pt-4 pb-2">
          <div className="grid h-full min-h-0 w-full grid-rows-[98px_270px_minmax(0,1.08fr)_minmax(0,0.76fr)] gap-2">

            {/* =============================
                TOP STATS
            ============================== */}

            <div className="grid min-h-0 grid-cols-6 gap-2">
              {topStats.map((item) => {
                const Icon = item.icon;

                return (
                  <Panel
                    key={item.title}
                    className="flex flex-col !overflow-hidden p-2 !pb-5.5"
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
                        <p className="truncate text-[8.5px] !font-semibold tracking-[0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
                          {item.title}
                        </p>

                        <div className="mt-1.5 flex items-end gap-1">
                          <span className="text-[21px] !font-semibold leading-none tracking-[-0.04em]" style={{ color: item.numColor, fontWeight: 600 }}>
                            <AnimatedCounter value={item.value} />
                          </span>

                          {item.suffix && (
                            <span className="mb-0.5 text-[9.5px] font-bold">
                              {item.suffix}
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-0.5 text-[8.5px] font-bold ${item.title ===
                            "INDEXED PAGES"
                            ? "text-blue-600"
                            : "text-emerald-700"
                            }`}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-1 left-2 right-2 flex items-center justify-center gap-1 text-[8px] font-extrabold text-[#293957]">
                      {item.footer}

                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Panel>
                );
              })}
            </div>

            {/* =============================
                ROW 2
            ============================== */}

            <div className="mt-2 grid h-[248px] min-h-0 grid-cols-[0.92fr_1.12fr_1.06fr] gap-2">

              {/* SEO HEALTH */}

              <Panel>
                <PanelTitle
                  right={
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      View Report

                      <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                  }
                >
                  SEO Health Overview
                </PanelTitle>

                <div className="grid min-h-0 grid-cols-[110px_1fr] items-center gap-2 px-3 pt-3">
                  <div className="relative mx-auto h-[96px] w-[96px]">
                    <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none z-0">
                      <defs>
                        <mask id="seo-donut-mask">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="16"
                            className="animate-donut-fill"
                          />
                        </mask>
                      </defs>
                    </svg>

                    <div
                      className="absolute inset-0 rounded-full bg-[conic-gradient(#148151_0deg_255deg,#e9a11c_255deg_331deg,#edf0ea_331deg_360deg)]"
                      style={{
                        mask: "url(#seo-donut-mask)",
                        WebkitMask: "url(#seo-donut-mask)",
                      }}
                    />

                    <div className="absolute inset-[9px] z-10 grid place-items-center rounded-full bg-white text-center">
                      <div>
                        <div className="text-[22px] font-extrabold leading-none text-emerald-600">
                          <AnimatedCounter value={92} duration={2500} />
                        </div>

                        <div className="mt-0.5 text-[9px] font-bold text-emerald-700">
                          Excellent
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-[5px] text-[11.5px] font-medium text-slate-900" style={{ fontSize: "11.5px", fontWeight: 500, color: "#0f172a" }}>
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

                          <span className="font-medium text-slate-900" style={{ color: "#0f172a", fontWeight: 500 }}>{name}</span>

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
              </Panel>

              {/* SEARCH CONSOLE */}

              <Panel>
                <PanelTitle
                  right={
                    <div className="flex items-center gap-2">
                      <RangeDropdown
                        dropdownKey="search-console-range"
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                        value={searchConsoleRange}
                        setValue={setSearchConsoleRange}
                        options={searchConsoleRanges}
                      />

                      <button
                        type="button"
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        View Console

                        <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                    </div>
                  }
                >
                  Google Search Console Summary
                </PanelTitle>

                <div className="grid grid-cols-4 gap-1.5 px-3 pt-3">
                  {[
                    {
                      label: "Total Clicks",
                      value: searchConsole ? number(searchConsole.clicks) : "3.62K",
                      change: searchConsole ? growthText(searchConsole.growth.clicks) : "↑ 18.6%",
                      bg: "bg-[#eff6ff] border-[#dbeafe]",
                      valColor: "text-blue-900",
                    },
                    {
                      label: "Total Impressions",
                      value: searchConsole ? number(searchConsole.impressions) : "85.7K",
                      change: searchConsole ? growthText(searchConsole.growth.impressions) : "↑ 20.4%",
                      bg: "bg-[#f0fdf4] border-[#dcfce7]",
                      valColor: "text-emerald-900",
                    },
                    {
                      label: "Average CTR",
                      value: searchConsole ? `${searchConsole.ctr.toFixed(2)}%` : "4.23%",
                      change: searchConsole ? growthText(searchConsole.growth.ctr) : "↑ 8.7%",
                      bg: "bg-[#faf5ff] border-[#f3e8ff]",
                      valColor: "text-purple-900",
                    },
                    {
                      label: "Average Position",
                      value: searchConsole ? searchConsole.position.toFixed(1) : "12.6",
                      change: searchConsole ? growthText(searchConsole.growth.position, true) : "",
                      bg: "bg-[#fff7ed] border-[#ffedd5]",
                      valColor: "text-amber-900",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-[7px] border px-2 py-1.5 ${item.bg}`}
                      style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px" }}
                    >
                      <p className="text-[9px] font-bold text-[#334666]">
                        {item.label}
                      </p>

                      <p className={`mt-1 text-[18px] font-extrabold ${item.valColor}`}>
                        <AnimatedCounter value={item.value} />
                      </p>

                      {item.change && (
                        <p className="mt-0.5 text-[9px] font-bold text-emerald-700">
                          {item.change}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="w-full min-h-0 px-3 pt-2 pb-1">
                  <svg
                    viewBox="0 0 520 120"
                    preserveAspectRatio="none"
                    className="h-[90px] w-full block overflow-visible"
                    style={{ width: "100%", display: "block" }}
                  >
                    <defs>
                      <linearGradient id="sc-green-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>

                      <linearGradient id="sc-blue-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <g className="animate-grow-left">
                      {[20, 50, 80].map((y) => (
                        <line
                          key={y}
                          x1="12"
                          x2="508"
                          y1={y}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      ))}

                      {/* Gradient Area Fills */}
                      <path
                        d="M 12 40 C 40 22, 80 34, 136 18 C 180 36, 220 16, 260 28 C 300 14, 340 32, 384 18 C 424 30, 464 14, 508 10 L 508 90 L 12 90 Z"
                        fill="url(#sc-green-gradient)"
                      />

                      <path
                        d="M 12 76 C 40 64, 80 74, 136 58 C 180 72, 220 58, 260 68 C 300 58, 340 74, 384 60 C 424 72, 464 58, 508 52 L 508 90 L 12 90 Z"
                        fill="url(#sc-blue-gradient)"
                      />

                      {/* Green Clicks Line (Top Curve - Full Width Start to End) */}
                      <path
                        d="M 12 40 C 40 22, 80 34, 136 18 C 180 36, 220 16, 260 28 C 300 14, 340 32, 384 18 C 424 30, 464 14, 508 10"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-chart-line"
                      />

                      {/* Blue Impressions Line (Bottom Curve - Full Width Start to End) */}
                      <path
                        d="M 12 76 C 40 64, 80 74, 136 58 C 180 72, 220 58, 260 68 C 300 58, 340 74, 384 60 C 424 72, 464 58, 508 52"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-chart-line"
                      />

                      {/* Peak Glowing Data Dots */}
                      {[[12, 40], [136, 18], [260, 28], [384, 18], [508, 10]].map(([cx, cy], i) => (
                        <circle key={`g-${i}`} cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#059669" strokeWidth="2" />
                      ))}

                      {[[12, 76], [136, 58], [260, 68], [384, 60], [508, 52]].map(([cx, cy], i) => (
                        <circle key={`b-${i}`} cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                      ))}
                    </g>

                    <text
                      x="12"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="start"
                    >
                      03 May
                    </text>

                    <text
                      x="136"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="middle"
                    >
                      10 May
                    </text>

                    <text
                      x="260"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="middle"
                    >
                      17 May
                    </text>

                    <text
                      x="384"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="middle"
                    >
                      24 May
                    </text>

                    <text
                      x="508"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="end"
                    >
                      31 May
                    </text>
                  </svg>
                </div>
              </Panel>

              {/* ACTION REQUIRED */}

              <Panel>
                <PanelTitle
                  right={
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      View All Issues

                      <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                  }
                >
                  Action Required
                </PanelTitle>

                <div className="px-3 pt-2">
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

                        <span className="truncate font-semibold text-slate-900" style={{ color: "#0f172a", fontWeight: 600 }}>
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
              </Panel>
            </div>

            {/* =============================
                ROW 3
            ============================== */}

            <div className="grid min-h-0 grid-cols-[0.92fr_1.12fr_1.06fr] gap-2">

              {/* ANALYTICS */}

              <Panel className="flex flex-col justify-between h-full">
                <div>
                  <PanelTitle
                    right={
                      <div className="flex items-center gap-2">
                        <RangeDropdown
                          dropdownKey="analytics-range"
                          openDropdown={openDropdown}
                          setOpenDropdown={setOpenDropdown}
                          value={analyticsRange}
                          setValue={setAnalyticsRange}
                          options={analyticsRanges}
                        />

                        <button
                          type="button"
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                        >
                          View Report

                          <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                        </button>
                      </div>
                    }
                  >
                    Analytics Overview
                  </PanelTitle>

                  <div className="grid grid-cols-4 gap-1.5 px-3 pt-3">
                    {[
                      {
                        label: "Users",
                        value: analytics ? number(analytics.users) : "12,842",
                        delta: analytics ? growthText(analytics.growth.users) : "↑ 18.7%",
                        good: true,
                        bg: "bg-[#eff6ff] border-[#dbeafe]",
                        valColor: "text-blue-900",
                      },
                      {
                        label: "Page Views",
                        value: analytics ? number(analytics.pageViews) : "28,561",
                        delta: analytics ? growthText(analytics.growth.pageViews) : "↑ 22.4%",
                        good: true,
                        bg: "bg-[#f0fdf4] border-[#dcfce7]",
                        valColor: "text-emerald-900",
                      },
                      {
                        label: "Avg. Session",
                        value: analytics ? duration(analytics.averageSessionSeconds) : "02:45",
                        delta: analytics ? growthText(analytics.growth.averageSession) : "↑ 8.3%",
                        good: true,
                        bg: "bg-[#faf5ff] border-[#f3e8ff]",
                        valColor: "text-purple-900",
                      },
                      {
                        label: "Bounce Rate",
                        value: analytics ? `${analytics.bounceRate.toFixed(1)}%` : "32.6%",
                        delta: analytics ? growthText(analytics.growth.bounceRate, true) : "↓ 5.1%",
                        good: false,
                        bg: "bg-[#fff7ed] border-[#ffedd5]",
                        valColor: "text-amber-900",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-[7px] border px-2 py-1.5 ${item.bg}`}
                        style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px" }}
                      >
                        <p className="text-[9px] font-bold text-[#334666]">
                          {item.label}
                        </p>

                        <p className={`mt-0.5 text-[17px] font-semibold ${item.valColor}`} style={{ fontWeight: 600 }}>
                          <AnimatedCounter value={item.value} />
                        </p>

                        <p
                          className={`mt-0.5 text-[9px] font-bold ${item.good ? "text-emerald-700" : "text-rose-600"}`}
                        >
                          {item.delta}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto w-full min-h-0 px-3 pt-3 pb-1">
                  <svg
                    viewBox="0 0 430 110"
                    preserveAspectRatio="none"
                    className="h-[95px] w-full block overflow-visible"
                    style={{ width: "100%", display: "block" }}
                  >
                    <defs>
                      <linearGradient id="bar-blue-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>

                      <linearGradient id="bar-emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                    </defs>

                    <g className="animate-grow-chart" style={{ transformOrigin: "215px 90px" }}>
                      {[20, 44, 68].map((y) => (
                        <line
                          key={y}
                          x1="12"
                          x2="420"
                          y1={y}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      ))}

                      <line
                        x1="12"
                        x2="420"
                        y1="90"
                        y2="90"
                        stroke="#cbd5e1"
                        strokeWidth="1.2"
                      />

                      {[
                        { date: "03 May", x: 48, blueH: 48, emH: 36 },
                        { date: "10 May", x: 138, blueH: 62, emH: 48 },
                        { date: "17 May", x: 228, blueH: 52, emH: 42 },
                        { date: "24 May", x: 318, blueH: 70, emH: 56 },
                        { date: "31 May", x: 408, blueH: 80, emH: 66 },
                      ].map((item) => (
                        <g key={item.date}>
                          {/* Blue Bar (Users) */}
                          <rect
                            x={item.x - 12}
                            y={90 - item.blueH}
                            width="10"
                            height={item.blueH}
                            rx="3"
                            ry="3"
                            fill="url(#bar-blue-gradient)"
                          />
                          {/* Emerald Bar (Page Views) */}
                          <rect
                            x={item.x + 2}
                            y={90 - item.emH}
                            width="10"
                            height={item.emH}
                            rx="3"
                            ry="3"
                            fill="url(#bar-emerald-gradient)"
                          />
                          {/* Date Label */}
                          <text
                            x={item.x}
                            y="108"
                            textAnchor="middle"
                            fill="#2563eb"
                            fontSize="10.5"
                            fontWeight="600"
                          >
                            {item.date}
                          </text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </div>
              </Panel>

              {/* CORE WEB VITALS */}

              <Panel>
                <PanelTitle
                  right={
                    <div className="flex items-center gap-2">
                      <RangeDropdown
                        dropdownKey="web-vitals-range"
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                        value={webVitalsRange}
                        setValue={setWebVitalsRange}
                        options={webVitalsRanges}
                      />

                      <button
                        type="button"
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        View Performance

                        <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                    </div>
                  }
                >
                  Core Web Vitals (Field Data)
                </PanelTitle>

                <div className="grid grid-cols-3 gap-1.5 px-3 pt-3">
                  {[
                    {
                      label: "Largest Contentful Paint (LCP)",
                      value: pageSpeed?.lcp != null ? `${(pageSpeed.lcp / 1000).toFixed(1)}s` : "2.1s",
                      status: "Good",
                      score: "90%",
                      bg: "bg-[#eff6ff] border-[#dbeafe]",
                      valColor: "text-blue-900",
                      barColor: "bg-blue-600",
                      scoreColor: "text-blue-700",
                    },
                    {
                      label: "Interaction to Next Paint (INP)",
                      value: pageSpeed?.inp != null ? `${Math.round(pageSpeed.inp)}ms` : "128ms",
                      status: "Good",
                      score: "92%",
                      bg: "bg-[#f0fdf4] border-[#dcfce7]",
                      valColor: "text-emerald-900",
                      barColor: "bg-emerald-600",
                      scoreColor: "text-emerald-700",
                    },
                    {
                      label: "Cumulative Layout Shift (CLS)",
                      value: pageSpeed?.cls != null ? pageSpeed.cls.toFixed(2) : "0.06",
                      status: "Good",
                      score: "94%",
                      bg: "bg-[#faf5ff] border-[#f3e8ff]",
                      valColor: "text-purple-900",
                      barColor: "bg-purple-600",
                      scoreColor: "text-purple-700",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-[7px] border px-2 py-2 ${item.bg}`}
                      style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px" }}
                    >
                      <p className="text-[9.5px] font-bold text-slate-900" style={{ color: "#0f172a", fontWeight: 700 }}>
                        {item.label}
                      </p>

                      <p className={`mt-1 text-[16px] font-semibold ${item.valColor}`} style={{ fontWeight: 600 }}>
                        <AnimatedCounter value={item.value} />
                      </p>

                      <p className="mt-0.5 text-[9px] font-bold text-emerald-700">
                        {item.status}
                      </p>

                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200/60">
                        <div className={`h-full rounded-full ${item.barColor}`} style={{ width: item.score }} />
                      </div>

                      <p className={`mt-0.5 text-right text-[8px] font-bold ${item.scoreColor}`}>
                        {item.score}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-3 pt-2.5 pb-2">
                  <p className="mb-1 text-[10px] font-extrabold text-slate-900" style={{ color: "#0f172a", fontWeight: 800 }}>
                    Other Performance Metrics
                  </p>

                  <div className="grid grid-cols-[1fr_64px_64px] gap-x-2 text-[9px] font-bold">
                    <div className="rounded-l-[4px] bg-[#eaeff5] px-2 py-1 text-slate-700">
                      Metric
                    </div>

                    <div className="bg-[#eaeff5] px-2 py-1 text-center text-slate-700">
                      Mobile
                    </div>

                    <div className="rounded-r-[4px] bg-[#eaeff5] px-2 py-1 text-center text-slate-700">
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
                        "#2563eb",
                      ],
                      [
                        "Total Blocking Time (TBT)",
                        pageSpeed?.tbt != null ? `${Math.round(pageSpeed.tbt)}ms` : "120ms",
                        "80ms",
                        "#4B1426",
                      ],
                    ].map((row) => (
                      <div
                        key={row[0]}
                        className="contents"
                      >
                        <div className="px-2 py-1 font-medium text-slate-900" style={{ color: "#0f172a", fontWeight: 500 }}>
                          {row[0]}
                        </div>

                        <div
                          className="px-2 py-1 text-center font-bold"
                          style={{ color: row[3] || "#047857" }}
                        >
                          {row[1]}
                        </div>

                        <div
                          className="px-2 py-1 text-center font-bold"
                          style={{ color: row[3] || "#047857" }}
                        >
                          {row[2]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              {/* SITE STATUS */}

              <Panel>
                <PanelTitle
                  right={
                    <Link href="#" className="text-[9px] font-bold text-blue-600 hover:underline">
                      View Site Health
                    </Link>
                  }
                >
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
                      "Next.js Version",
                      "16.3.4",
                    ],
                    [
                      Wrench,
                      "Node.js Version",
                      "v24.20.0",
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

                        <span className={`font-bold ${label === "Last Backup" ? "text-[#4B1426]" : "text-emerald-700"}`}>
                          {value as string}
                        </span>

                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      </div>
                    )
                  )}
                </div>

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
                    <div className="flex items-center gap-3">
                      <Link href="#" className="text-[9px] font-bold text-blue-600 hover:underline">View All</Link>
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
                    </div>
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

              </Panel>

              {/* KEYWORD PERFORMANCE */}

              <Panel>
                <PanelTitle
                  right={
                    <div className="flex items-center gap-3">
                      <Link href="#" className="text-[9px] font-bold text-blue-600 hover:underline">View Data</Link>
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
                    </div>
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

              </Panel>

              {/* LOCATIONS */}

              <Panel>
                <PanelTitle
                  right={
                    <div className="flex items-center gap-3">
                      <Link href="#" className="text-[9px] font-bold text-blue-600 hover:underline">View Report</Link>
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
                    </div>
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
