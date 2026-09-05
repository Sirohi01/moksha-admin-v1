"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Reply,
  Search,
  Settings,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

/* ================================================================
   TYPES
================================================================ */

type ReviewStatus =
  | "Replied"
  | "Pending Reply";

type ReviewTab =
  | "all"
  | "new"
  | "pending"
  | "replied"
  | "negative";

type Review = {
  id: string;

  customer: string;
  subtitle: string;

  avatar?: string;

  rating: number;

  review: string;

  location: string;
  city: string;

  date: string;
  time: string;

  status: ReviewStatus;

  assignedTo: string;
  assignedAvatar?: string;
};

/* ================================================================
   DATA
================================================================ */

const REVIEWS: Review[] = [
  {
    id: "REV-001",
    customer: "Priya Sharma",
    subtitle: "Local Guide · 18 reviews",
    rating: 5,
    review:
      "Amazing place! The instructors are very knowledgeable and supportive. My health has improved a lot after joining...",
    location: "Main Center",
    city: "New Delhi",
    date: "22 Dec 2024",
    time: "10:14 AM",
    status: "Replied",
    assignedTo: "Sneha",
  },

  {
    id: "REV-002",
    customer: "Rahul Verma",
    subtitle: "Local Guide · 32 reviews",
    rating: 5,
    review:
      "Excellent yoga classes and peaceful environment. Highly recommended for anyone looking to improve their mental...",
    location: "West Delhi",
    city: "",
    date: "21 Dec 2024",
    time: "6:30 PM",
    status: "Replied",
    assignedTo: "Aman",
  },

  {
    id: "REV-003",
    customer: "Sneha Kapoor",
    subtitle: "3 reviews",
    rating: 4,
    review:
      "Good experience overall. Trainers are professional. Would be great if class timings were a bit more flexible.",
    location: "South Delhi",
    city: "",
    date: "20 Dec 2024",
    time: "4:12 PM",
    status: "Pending Reply",
    assignedTo: "Ritika",
  },

  {
    id: "REV-004",
    customer: "Amit Gupta",
    subtitle: "Local Guide · 45 reviews",
    rating: 2,
    review:
      "Not satisfied with the recent batch. The class was often delayed and the hall was crowded.",
    location: "Noida",
    city: "",
    date: "19 Dec 2024",
    time: "9:45 AM",
    status: "Pending Reply",
    assignedTo: "Vikas",
  },

  {
    id: "REV-005",
    customer: "Neha Mehta",
    subtitle: "5 reviews",
    rating: 5,
    review:
      "One of the best yoga centers in Delhi. Clean, calm and very positive atmosphere.",
    location: "Gurugram",
    city: "",
    date: "18 Dec 2024",
    time: "7:20 PM",
    status: "Replied",
    assignedTo: "Sneha",
  },
];

/* ================================================================
   RATINGS
================================================================ */

const RATING_BREAKDOWN = [
  {
    stars: 5,
    count: 892,
    percent: 70,
    color: "#00A85A",
  },
  {
    stars: 4,
    count: 258,
    percent: 20,
    color: "#45B97C",
  },
  {
    stars: 3,
    count: 79,
    percent: 6,
    color: "#F4BF43",
  },
  {
    stars: 2,
    count: 32,
    percent: 2,
    color: "#F57C18",
  },
  {
    stars: 1,
    count: 23,
    percent: 2,
    color: "#EF3E42",
  },
];

const LOCATION_RATINGS = [
  {
    name: "The Yogshala - Main Center",
    rating: "4.9",
    count: 642,
  },
  {
    name: "The Yogshala - West Delhi",
    rating: "4.7",
    count: 298,
  },
  {
    name: "The Yogshala - South Delhi",
    rating: "4.6",
    count: 184,
  },
  {
    name: "The Yogshala - Noida",
    rating: "4.8",
    count: 118,
  },
  {
    name: "The Yogshala - Gurugram",
    rating: "4.7",
    count: 42,
  },
];

const TREND = [
  {
    label: "Jan",
    value: 3.8,
  },
  {
    label: "Feb",
    value: 4.1,
  },
  {
    label: "Mar",
    value: 4.1,
  },
  {
    label: "Apr",
    value: 4.0,
  },
  {
    label: "May",
    value: 4.4,
  },
  {
    label: "Jun",
    value: 4.25,
  },
  {
    label: "Jul",
    value: 4.5,
  },
  {
    label: "Aug",
    value: 4.75,
  },
  {
    label: "Sep",
    value: 4.48,
  },
  {
    label: "Oct",
    value: 4.68,
  },
  {
    label: "Nov",
    value: 4.52,
  },
  {
    label: "Dec",
    value: 4.8,
  },
];

/* ================================================================
   ALERTS
================================================================ */

const NEGATIVE_ALERTS = [
  {
    id: "NEG-001",
    name: "Amit Gupta",
    location: "Noida",
    rating: 1,
    date: "19 Dec 2024, 9:45 AM",
    text:
      "Not satisfied with the recent batch. The class was often delayed...",
  },

  {
    id: "NEG-002",
    name: "Rohit Mehra",
    location: "South Delhi",
    rating: 2,
    date: "18 Dec 2024, 2:20 PM",
    text:
      "Good location but the staff response can be better. Waiting time...",
  },
];

/* ================================================================
   PAGE
================================================================ */

export default function GoogleReviewsPage() {
  const [tab, setTab] =
    useState<ReviewTab>("all");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(5);

  const [syncing, setSyncing] =
    useState(false);

  const [checked, setChecked] =
    useState<string[]>([]);

  /* ==============================================================
     FILTER
  ============================================================== */

  const visibleReviews =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return REVIEWS.filter(
        (review) => {
          if (
            tab === "pending" &&
            review.status !==
            "Pending Reply"
          ) {
            return false;
          }

          if (
            tab === "replied" &&
            review.status !==
            "Replied"
          ) {
            return false;
          }

          if (
            tab === "negative" &&
            review.rating > 2
          ) {
            return false;
          }

          if (
            tab === "new" &&
            review.id !==
            "REV-001"
          ) {
            /*
             * API data aane par
             * yahan actual "new"
             * condition use karna.
             */
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            review.customer,
            review.subtitle,
            review.review,
            review.location,
            review.city,
            review.assignedTo,
            review.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }
      );
    }, [tab, search]);

  /* ==============================================================
     SELECT
  ============================================================== */

  function toggleReview(
    id: string
  ) {
    setChecked((current) =>
      current.includes(id)
        ? current.filter(
          (item) =>
            item !== id
        )
        : [...current, id]
    );
  }

  function toggleAll() {
    const ids =
      visibleReviews.map(
        (review) =>
          review.id
      );

    const allSelected =
      ids.every((id) =>
        checked.includes(id)
      );

    if (allSelected) {
      setChecked((current) =>
        current.filter(
          (id) =>
            !ids.includes(id)
        )
      );
      return;
    }

    setChecked((current) =>
      Array.from(
        new Set([
          ...current,
          ...ids,
        ])
      )
    );
  }

  /* ==============================================================
     SYNC
  ============================================================== */

  function syncReviews() {
    if (syncing) {
      return;
    }

    setSyncing(true);

    window.setTimeout(
      () => {
        setSyncing(false);
      },
      1000
    );
  }

  return (
    <section
      className="
        min-h-full
        w-full
        min-w-0
        overflow-hidden
        bg-[linear-gradient(180deg,#f8fbff_0%,#f7fbfd_55%,#f7fafc_100%)]
        px-[16px]
        pb-[17px]
        pt-[10px]
        text-[#172957]
      "
    >
      {/* ==========================================================
          TOP BREADCRUMB
      ========================================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          justify-between
          gap-[18px]
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-[8px]
            text-[13px]
            font-[500]
            text-[#66748c]
          "
        >
          <span>
            Reputation Management
          </span>

          <ChevronRight
            size={15}
            className="
              shrink-0
              text-[#405273]
            "
          />

          <span
            className="
              font-[800]
              text-[#152957]
            "
          >
            Google Reviews
          </span>
        </div>

        {/* RIGHT TOP BUTTONS */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[12px]
          "
        >
          <button
            type="button"
            className="
              flex
              h-[39px]
              items-center
              gap-[8px]
              rounded-[7px]
              border
              border-[#dae2ea]
              bg-white
              px-[16px]
              text-[12px]
              font-[700]
              text-[#25375f]
              shadow-[0_1px_2px_rgba(25,45,75,0.03)]
            "
          >
            <Tag
              size={14}
              strokeWidth={2}
            />

            View on Google

            <ExternalLink
              size={12}
            />
          </button>

          <button
            type="button"
            className="
              flex
              h-[39px]
              items-center
              gap-[8px]
              rounded-[7px]
              border
              border-[#dae2ea]
              bg-white
              px-[16px]
              text-[12px]
              font-[700]
              text-[#25375f]
              shadow-[0_1px_2px_rgba(25,45,75,0.03)]
            "
          >
            <Settings
              size={15}
            />

            Integration Settings
          </button>
        </div>
      </div>

      {/* ==========================================================
          TITLE / CONTROLS
      ========================================================== */}

      <div
        className="
          mt-[14px]
          flex
          min-w-0
          items-start
          justify-between
          gap-[20px]
        "
      >
        {/* TITLE */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-[15px]
          "
        >
          <GoogleLogo />

          <div className="min-w-0">
            <h1
              className="
                text-[31px]
                font-[800]
                leading-[1]
                tracking-[-0.035em]
                text-[#102554]
              "
            >
              Google Reviews
            </h1>

            <p
              className="
                mt-[8px]
                truncate
                text-[13px]
                font-[500]
                text-[#60708c]
              "
            >
              Manage and respond to
              your Google Business
              Profile reviews from
              one place.
            </p>
          </div>
        </div>

        {/* CONTROLS */}

        <div
          className="
            flex
            shrink-0
            flex-col
            items-end
            gap-[7px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-[10px]
            "
          >
            <ControlButton
              icon={
                <MapPin
                  size={16}
                />
              }
              className="w-[175px]"
            >
              All Locations
            </ControlButton>

            <ControlButton
              icon={
                <CalendarDays
                  size={16}
                />
              }
              className="w-[284px]"
            >
              01 Jan 2025 - 31 Dec
              2025
            </ControlButton>

            <button
              type="button"
              onClick={
                syncReviews
              }
              className="
                flex
                h-[43px]
                w-[238px]
                items-center
                justify-center
                gap-[10px]
                rounded-[7px]
                bg-[#00864a]
                text-[14px]
                font-[800]
                text-white
                shadow-[0_3px_8px_rgba(0,134,74,0.16)]
                transition
                hover:bg-[#007640]
              "
            >
              <RefreshCw
                size={17}
                className={
                  syncing
                    ? "animate-spin"
                    : ""
                }
              />

              {syncing
                ? "Syncing..."
                : "Sync Reviews"}
            </button>
          </div>

          <div
            className="
              flex
              items-center
              gap-[15px]
              pr-[5px]
              text-[11px]
              font-[500]
              text-[#61718b]
            "
          >
            <span
              className="
                flex
                items-center
                gap-[6px]
              "
            >
              <span
                className="
                  h-[8px]
                  w-[8px]
                  rounded-full
                  bg-[#14a55b]
                "
              />

              Last synced: 24 Dec
              2024, 10:45 AM
            </span>

            <button
              type="button"
              onClick={
                syncReviews
              }
              className="
                font-[700]
                text-[#2475c4]
              "
            >
              Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================
          TOP DASHBOARD

          LEFT:
            metrics + rating analytics

          RIGHT:
            negative alert panel
      ========================================================== */}

      <div
        className="
          mt-[20px]
          grid
          min-w-0
          gap-[12px]
          xl:grid-cols-[minmax(0,1fr)_320px]
          2xl:grid-cols-[minmax(0,1fr)_390px]
        "
      >
        {/* ========================================================
            LEFT
        ======================================================== */}

        <div
          className="
            min-w-0
          "
        >
          {/* METRIC CARDS */}

          <div
            className="
              grid
              min-w-0
              grid-cols-2
              gap-[10px]
              lg:grid-cols-4
            "
          >
            <OverallRatingCard />

            <MetricCard
              title="Total Reviews"
              value="1,284"
              icon={
                <MessageCircle
                  size={24}
                />
              }
              iconBg="#e4f2ff"
              iconColor="#2077df"
              change="↑ 12%"
              changeColor="#159355"
              note="vs previous period"
            />

            <MetricCard
              title="New Reviews"
              value="48"
              icon={
                <Sparkles
                  size={24}
                />
              }
              iconBg="#fff2cf"
              iconColor="#ffb100"
              change="↑ 33%"
              changeColor="#159355"
              note="in last 30 days"
            />

            <MetricCard
              title="Pending Replies"
              value="12"
              icon={
                <Reply
                  size={24}
                />
              }
              iconBg="#fde9ed"
              iconColor="#e52043"
              change="↑ 71%"
              changeColor="#e2293f"
              note="need your response"
            />
          </div>

          {/* ======================================================
              ANALYTICS
          ====================================================== */}

          <div
            className="
              mt-[12px]
              grid
              min-w-0
              gap-[10px]
              xl:grid-cols-[0.9fr_1.15fr_0.78fr]
            "
          >
            <RatingBreakdown />

            <RatingTrend />

            <ReviewsByLocation />
          </div>
        </div>

        {/* ========================================================
            NEGATIVE REVIEW ALERTS
        ======================================================== */}

        <NegativeReviewAlerts />
      </div>

      {/* ==========================================================
          REVIEWS TABLE CARD
      ========================================================== */}

      <div
        className="
          mt-[16px]
          min-w-0
          overflow-hidden
          rounded-[8px]
          border
          border-[#e1e6eb]
          bg-white
          shadow-[0_2px_5px_rgba(19,38,68,0.03)]
        "
      >
        {/* ========================================================
            TOOLBAR
        ======================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            justify-between
            gap-[14px]
            border-b
            border-[#e6eaf0]
            px-[5px]
            py-[10px]
          "
        >
          {/* TABS */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-[7px]
            "
          >
            <ReviewTabButton
              active={
                tab === "all"
              }
              onClick={() => {
                setTab("all");
                setPage(1);
              }}
            >
              All Reviews (1,284)
            </ReviewTabButton>

            <ReviewTabButton
              active={
                tab === "new"
              }
              onClick={() => {
                setTab("new");
                setPage(1);
              }}
            >
              New (48)
            </ReviewTabButton>

            <ReviewTabButton
              active={
                tab ===
                "pending"
              }
              onClick={() => {
                setTab("pending");
                setPage(1);
              }}
            >
              Pending Reply (12)
            </ReviewTabButton>

            <ReviewTabButton
              active={
                tab ===
                "replied"
              }
              onClick={() => {
                setTab("replied");
                setPage(1);
              }}
            >
              Replied (1,262)
            </ReviewTabButton>

            <ReviewTabButton
              active={
                tab ===
                "negative"
              }
              onClick={() => {
                setTab("negative");
                setPage(1);
              }}
            >
              Negative (55)
            </ReviewTabButton>
          </div>

          {/* FILTERS */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-[9px]
            "
          >
            <div
              className="
                flex
                h-[39px]
                w-[315px]
                items-center
                rounded-[6px]
                border
                border-[#dce3ea]
                bg-white
                px-[13px]
              "
            >
              <Search
                size={16}
                className="
                  mr-[9px]
                  shrink-0
                  text-[#536584]
                "
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search reviews, customer name, keywords..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[12px]
                  font-[500]
                  text-[#2c3f68]
                  outline-none
                  placeholder:text-[#77849a]
                "
              />
            </div>

            <ToolbarButton
              icon={
                <Filter
                  size={15}
                />
              }
            >
              Filters
            </ToolbarButton>

            <ToolbarButton
              icon={
                <Download
                  size={15}
                />
              }
            >
              Export
            </ToolbarButton>

            <button
              type="button"
              className="
                flex
                h-[39px]
                items-center
                gap-[8px]
                rounded-[6px]
                bg-[#00864a]
                px-[16px]
                text-[12px]
                font-[800]
                text-white
              "
            >
              <MoreHorizontal
                size={16}
              />

              View All
            </button>
          </div>
        </div>

        {/* ========================================================
            TABLE
        ======================================================== */}

        <div
          className="
            w-full
            min-w-0
            overflow-x-auto
          "
        >
          <table
            className="
              w-full
              min-w-[1180px]
              table-fixed
              border-collapse
            "
          >
            <colgroup>
              <col
                style={{
                  width: "3%",
                }}
              />

              <col
                style={{
                  width: "15%",
                }}
              />

              <col
                style={{
                  width: "7%",
                }}
              />

              <col
                style={{
                  width: "24%",
                }}
              />

              <col
                style={{
                  width: "10%",
                }}
              />

              <col
                style={{
                  width: "8%",
                }}
              />

              <col
                style={{
                  width: "9%",
                }}
              />

              <col
                style={{
                  width: "11%",
                }}
              />

              <col
                style={{
                  width: "13%",
                }}
              />
            </colgroup>

            <thead>
              <tr
                className="
                  h-[45px]
                  bg-[#f8fafc]
                  text-left
                "
              >
                <th
                  className="
                    px-[13px]
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      visibleReviews
                        .length >
                      0 &&
                      visibleReviews.every(
                        (
                          review
                        ) =>
                          checked.includes(
                            review.id
                          )
                      )
                    }
                    onChange={
                      toggleAll
                    }
                    className="
                      h-[14px]
                      w-[14px]
                      accent-[#00864a]
                    "
                  />
                </th>

                <TableHead>
                  Customer
                </TableHead>

                <TableHead>
                  Rating
                </TableHead>

                <TableHead>
                  Review
                </TableHead>

                <TableHead>
                  Location
                </TableHead>

                <TableHead>
                  Date
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Assigned To
                </TableHead>

                <TableHead>
                  Actions
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {visibleReviews.map(
                (review) => (
                  <ReviewRow
                    key={
                      review.id
                    }
                    review={
                      review
                    }
                    checked={checked.includes(
                      review.id
                    )}
                    onToggle={() =>
                      toggleReview(
                        review.id
                      )
                    }
                  />
                )
              )}

              {visibleReviews
                .length ===
                0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="
                      h-[150px]
                      text-center
                      text-[13px]
                      font-[600]
                      text-[#718099]
                    "
                    >
                      No reviews found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* ========================================================
            TABLE FOOTER
        ======================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            justify-between
            gap-[16px]
            border-t
            border-[#e4e8ed]
            px-[15px]
            py-[12px]
          "
        >
          <p
            className="
              text-[11px]
              font-[600]
              text-[#63718b]
            "
          >
            Showing 1–5 of 1,284
            reviews
          </p>

          <div
            className="
              flex
              items-center
              gap-[5px]
            "
          >
            <PageButton>
              <ChevronLeft
                size={14}
              />
            </PageButton>

            <PageButton
              active={
                page === 1
              }
              onClick={() =>
                setPage(1)
              }
            >
              1
            </PageButton>

            <PageButton
              active={
                page === 2
              }
              onClick={() =>
                setPage(2)
              }
            >
              2
            </PageButton>

            <PageButton
              active={
                page === 3
              }
              onClick={() =>
                setPage(3)
              }
            >
              3
            </PageButton>

            <PageButton>
              4
            </PageButton>

            <PageButton>
              5
            </PageButton>

            <span
              className="
                px-[4px]
                text-[12px]
                font-[700]
                text-[#62708b]
              "
            >
              ...
            </span>

            <PageButton>
              257
            </PageButton>

            <PageButton>
              <ChevronRight
                size={14}
              />
            </PageButton>

            <div
              className="
                ml-[22px]
                flex
                items-center
                gap-[10px]
              "
            >
              <span
                className="
                  whitespace-nowrap
                  text-[11px]
                  font-[600]
                  text-[#66738a]
                "
              >
                Rows per page:
              </span>

              <div
                className="
                  relative
                "
              >
                <select
                  value={
                    rowsPerPage
                  }
                  onChange={(
                    event
                  ) =>
                    setRowsPerPage(
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  }
                  className="
                    h-[34px]
                    w-[65px]
                    appearance-none
                    rounded-[6px]
                    border
                    border-[#dce3ea]
                    bg-white
                    px-[12px]
                    pr-[27px]
                    text-[11px]
                    font-[700]
                    text-[#32446c]
                    outline-none
                  "
                >
                  <option value={5}>
                    5
                  </option>

                  <option value={10}>
                    10
                  </option>

                  <option value={20}>
                    20
                  </option>
                </select>

                <ChevronDown
                  size={12}
                  className="
                    pointer-events-none
                    absolute
                    right-[8px]
                    top-1/2
                    -translate-y-1/2
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   GOOGLE LOGO
================================================================ */

function GoogleLogo() {
  return (
    <div
      className="
        flex
        h-[74px]
        w-[74px]
        shrink-0
        items-center
        justify-center
        rounded-[10px]
        bg-white
        shadow-[0_4px_14px_rgba(25,45,75,0.05)]
      "
    >
      <svg
        viewBox="0 0 48 48"
        className="
          h-[52px]
          w-[52px]
        "
      >
        <path
          fill="#FFC107"
          d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12 0-6.6 5.4-12 12-12 3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 15 4 7.3 9.1 3.5 16.6l6.6 5.1C11.9 16.1 17.4 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4Z"
        />

        <path
          fill="#FF3D00"
          d="M3.5 16.6 10.1 21.7C11.9 16.1 17.4 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 15 4 7.3 9.1 3.5 16.6Z"
        />

        <path
          fill="#4CAF50"
          d="M24 44c5.1 0 9.7-1.9 13.2-5.1l-6.1-5.2C29.1 35.2 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-7.9l-6.6 5.1C9.9 39.5 16.4 44 24 44Z"
        />

        <path
          fill="#1976D2"
          d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.1 5.2C36.8 39.3 44 34 44 24c0-1.3-.1-2.6-.4-3.9Z"
        />
      </svg>
    </div>
  );
}

/* ================================================================
   CONTROLS
================================================================ */

function ControlButton({
  icon,
  children,
  className = "",
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`
        flex
        h-[43px]
        items-center
        gap-[9px]
        rounded-[7px]
        border
        border-[#dce3ea]
        bg-white
        px-[14px]
        text-[12px]
        font-[700]
        text-[#35456a]
        shadow-[0_1px_2px_rgba(25,45,75,0.03)]
        ${className}
      `}
    >
      <span
        className="
          shrink-0
          text-[#344970]
        "
      >
        {icon}
      </span>

      <span
        className="
          min-w-0
          flex-1
          truncate
          text-left
        "
      >
        {children}
      </span>

      <ChevronDown
        size={14}
        className="
          shrink-0
        "
      />
    </button>
  );
}

/* ================================================================
   METRIC CARD
================================================================ */

function MetricCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  change,
  changeColor,
  note,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  change: string;
  changeColor: string;
  note: string;
}) {
  return (
    <div
      className="
        flex
        h-[116px]
        min-w-0
        items-start
        gap-[14px]
        overflow-hidden
        rounded-[8px]
        border
        border-[#e2e7ed]
        bg-white
        px-[16px]
        py-[15px]
        shadow-[0_2px_5px_rgba(25,45,75,0.03)]
      "
    >
      <div
        className="
          flex
          h-[46px]
          w-[46px]
          shrink-0
          items-center
          justify-center
          rounded-[8px]
        "
        style={{
          backgroundColor:
            iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            truncate
            text-[13px]
            font-[600]
            text-[#415170]
          "
        >
          {title}
        </p>

        <div
          className="
            mt-[9px]
            flex
            min-w-0
            items-end
            gap-[10px]
          "
        >
          <strong
            className="
              text-[28px]
              font-[800]
              leading-none
              tracking-[-0.025em]
              text-[#102554]
            "
          >
            {value}
          </strong>

          <span
            className="
              mb-[2px]
              whitespace-nowrap
              text-[12px]
              font-[800]
            "
            style={{
              color:
                changeColor,
            }}
          >
            {change}
          </span>
        </div>

        <p
          className="
            mt-[7px]
            truncate
            text-[10px]
            font-[500]
            text-[#718099]
          "
        >
          {note}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   OVERALL RATING
================================================================ */

function OverallRatingCard() {
  return (
    <div
      className="
        flex
        h-[116px]
        min-w-0
        items-start
        gap-[14px]
        overflow-hidden
        rounded-[8px]
        border
        border-[#e2e7ed]
        bg-white
        px-[16px]
        py-[15px]
        shadow-[0_2px_5px_rgba(25,45,75,0.03)]
      "
    >
      <div
        className="
          flex
          h-[46px]
          w-[46px]
          shrink-0
          items-center
          justify-center
          rounded-[8px]
          bg-[#e2f7ed]
          text-[#079552]
        "
      >
        <BadgeCheck
          size={25}
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-[13px]
            font-[600]
            text-[#415170]
          "
        >
          Overall Rating
        </p>

        <div
          className="
            mt-[8px]
            flex
            items-center
            gap-[8px]
          "
        >
          <strong
            className="
              text-[28px]
              font-[800]
              leading-none
              tracking-[-0.025em]
              text-[#102554]
            "
          >
            4.8
          </strong>

          <Stars
            rating={5}
            size={19}
          />

          <span
            className="
              rounded-[5px]
              bg-[#def6e9]
              px-[7px]
              py-[4px]
              text-[10px]
              font-[800]
              text-[#149355]
            "
          >
            ↑ 0.2
          </span>
        </div>

        <p
          className="
            mt-[7px]
            text-[10px]
            font-[500]
            text-[#718099]
          "
        >
          Based on 1,284 reviews
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   CARD SHELL
================================================================ */

function DashboardCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="
        min-w-0
        overflow-hidden
        rounded-[8px]
        border
        border-[#e1e6ec]
        bg-white
        px-[14px]
        pb-[13px]
        pt-[13px]
        shadow-[0_2px_5px_rgba(25,45,75,0.03)]
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-[10px]
        "
      >
        <h2
          className="
            text-[14px]
            font-[800]
            text-[#20345e]
          "
        >
          {title}
        </h2>

        {right}
      </div>

      {children}
    </div>
  );
}

/* ================================================================
   RATING BREAKDOWN
================================================================ */

function RatingBreakdown() {
  return (
    <DashboardCard
      title="Rating Breakdown"
    >
      <div
        className="
          mt-[14px]
          space-y-[10px]
        "
      >
        {RATING_BREAKDOWN.map(
          (rating) => (
            <div
              key={
                rating.stars
              }
              className="
                grid
                grid-cols-[27px_15px_minmax(0,1fr)_68px]
                items-center
                gap-[6px]
              "
            >
              <span
                className="
                  text-right
                  text-[11px]
                  font-[700]
                  text-[#50607c]
                "
              >
                {rating.stars}
              </span>

              <Star
                size={14}
                className="
                  fill-[#08a45b]
                  text-[#08a45b]
                "
              />

              <div
                className="
                  h-[19px]
                  overflow-hidden
                  rounded-[3px]
                  bg-[#e8edf1]
                "
              >
                <div
                  className="
                    h-full
                    rounded-[3px]
                  "
                  style={{
                    width: `${rating.percent}%`,
                    backgroundColor:
                      rating.color,
                  }}
                />
              </div>

              <span
                className="
                  whitespace-nowrap
                  text-[11px]
                  font-[600]
                  text-[#53617b]
                "
              >
                {rating.count} (
                {rating.percent}%)
              </span>
            </div>
          )
        )}
      </div>
    </DashboardCard>
  );
}

/* ================================================================
   TREND
================================================================ */

function RatingTrend() {
  return (
    <DashboardCard
      title="Rating Trend"
      right={
        <p
          className="
            text-[11px]
            font-[500]
            text-[#68758d]
          "
        >
          Avg. Rating:{" "}

          <strong
            className="
              text-[#20345e]
            "
          >
            4.8
          </strong>
        </p>
      }
    >
      <div
        className="
          mt-[9px]
          h-[157px]
          w-full
          min-w-0
        "
      >
        <RatingTrendChart />
      </div>
    </DashboardCard>
  );
}

function RatingTrendChart() {
  const width = 520;
  const height = 180;

  const left = 39;
  const right = 15;
  const top = 14;
  const bottom = 32;

  const minValue = 3;
  const maxValue = 5;

  const chartWidth =
    width - left - right;

  const chartHeight =
    height - top - bottom;

  const points =
    TREND.map(
      (item, index) => {
        const x =
          left +
          (index /
            (TREND.length -
              1)) *
          chartWidth;

        const y =
          top +
          chartHeight -
          ((item.value -
            minValue) /
            (maxValue -
              minValue)) *
          chartHeight;

        return {
          ...item,
          x,
          y,
        };
      }
    );

  const line =
    points
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");

  const areaPath = `
    M ${points[0].x} ${top + chartHeight
    }
    ${points
      .map(
        (point) =>
          `L ${point.x} ${point.y}`
      )
      .join(" ")}
    L ${points[
      points.length - 1
    ].x
    } ${top + chartHeight}
    Z
  `;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="
        h-full
        w-full
      "
    >
      <defs>
        <linearGradient
          id="rating-area"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#36b875"
            stopOpacity=".30"
          />

          <stop
            offset="100%"
            stopColor="#36b875"
            stopOpacity=".04"
          />
        </linearGradient>
      </defs>

      {[3, 3.5, 4, 4.5, 5].map(
        (value) => {
          const y =
            top +
            chartHeight -
            ((value -
              minValue) /
              (maxValue -
                minValue)) *
            chartHeight;

          return (
            <g key={value}>
              <line
                x1={left}
                x2={
                  width -
                  right
                }
                y1={y}
                y2={y}
                stroke="#e3e8eb"
                strokeWidth="1"
              />

              <text
                x="0"
                y={y + 4}
                fontSize="11"
                fill="#738097"
              >
                {value.toFixed(
                  1
                )}
              </text>
            </g>
          );
        }
      )}

      <path
        d={areaPath}
        fill="url(#rating-area)"
      />

      <polyline
        points={line}
        fill="none"
        stroke="#129755"
        strokeWidth="2.4"
      />

      {points.map(
        (point) => (
          <g
            key={
              point.label
            }
          >
            <circle
              cx={point.x}
              cy={point.y}
              r="4.3"
              fill="#119755"
              stroke="#ffffff"
              strokeWidth="1.7"
            />

            <text
              x={point.x}
              y={
                height - 8
              }
              textAnchor="middle"
              fontSize="10"
              fill="#68758d"
            >
              {point.label}
            </text>
          </g>
        )
      )}
    </svg>
  );
}

/* ================================================================
   REVIEWS BY LOCATION
================================================================ */

function ReviewsByLocation() {
  return (
    <DashboardCard
      title="Reviews by Location"
      right={
        <button
          type="button"
          className="
            flex
            items-center
            gap-[4px]
            text-[11px]
            font-[700]
            text-[#1681d0]
          "
        >
          View All

          <ChevronRight
            size={13}
          />
        </button>
      }
    >
      <div
        className="
          mt-[12px]
          divide-y
          divide-[#eef1f3]
        "
      >
        {LOCATION_RATINGS.map(
          (location) => (
            <div
              key={
                location.name
              }
              className="
                grid
                grid-cols-[minmax(0,1fr)_35px_18px_46px]
                items-center
                gap-[4px]
                py-[7px]
              "
            >
              <p
                className="
                  truncate
                  text-[10px]
                  font-[700]
                  text-[#33456b]
                "
              >
                {location.name}
              </p>

              <span
                className="
                  text-right
                  text-[11px]
                  font-[800]
                  text-[#263a66]
                "
              >
                {location.rating}
              </span>

              <Star
                size={13}
                className="
                  fill-[#ffb000]
                  text-[#ffb000]
                "
              />

              <span
                className="
                  text-right
                  text-[10px]
                  font-[500]
                  text-[#6c7990]
                "
              >
                ({location.count})
              </span>
            </div>
          )
        )}
      </div>
    </DashboardCard>
  );
}

/* ================================================================
   NEGATIVE ALERT PANEL
================================================================ */

function NegativeReviewAlerts() {
  return (
    <aside
      className="
        min-w-0
        overflow-hidden
        rounded-[8px]
        border
        border-[#f1c8ce]
        bg-white
        shadow-[0_2px_5px_rgba(25,45,75,0.03)]
      "
    >
      <div
        className="
          flex
          h-[53px]
          items-center
          justify-between
          border-b
          border-[#f3d7db]
          bg-[#fff9fa]
          px-[15px]
        "
      >
        <div
          className="
            flex
            items-center
            gap-[9px]
          "
        >
          <span
            className="
              flex
              h-[31px]
              w-[31px]
              items-center
              justify-center
              rounded-[7px]
              bg-[#fde8ed]
              text-[#d9092f]
            "
          >
            <span
              className="
                text-[20px]
              "
            >
              ♟
            </span>
          </span>

          <h2
            className="
              text-[14px]
              font-[800]
              text-[#a52236]
            "
          >
            Negative Review
            Alerts
          </h2>
        </div>

        <button
          type="button"
          className="
            flex
            items-center
            gap-[3px]
            text-[11px]
            font-[700]
            text-[#1c76bd]
          "
        >
          View All

          <ChevronRight
            size={13}
          />
        </button>
      </div>

      <div
        className="
          divide-y
          divide-[#f1dce0]
        "
      >
        {NEGATIVE_ALERTS.map(
          (alert) => (
            <div
              key={
                alert.id
              }
              className="
                px-[16px]
                py-[15px]
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-[11px]
                "
              >
                <div
                  className={`
                    flex
                    h-[30px]
                    min-w-[40px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[7px]
                    px-[7px]
                    text-[12px]
                    font-[800]
                    text-white

                    ${alert.rating ===
                      1
                      ? "bg-[#df082c]"
                      : "bg-[#f15c14]"
                    }
                  `}
                >
                  {alert.rating}
                  <Star
                    size={12}
                    className="
                      ml-[2px]
                      fill-white
                      text-white
                    "
                  />
                </div>

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-[10px]
                    "
                  >
                    <div>
                      <h3
                        className="
                          text-[12px]
                          font-[800]
                          text-[#2d3c60]
                        "
                      >
                        {alert.name}
                      </h3>

                      <p
                        className="
                          mt-[3px]
                          text-[10px]
                          font-[500]
                          text-[#718099]
                        "
                      >
                        {alert.location}
                      </p>
                    </div>

                    <span
                      className="
                        whitespace-nowrap
                        text-[9px]
                        font-[500]
                        text-[#7d8799]
                      "
                    >
                      {alert.date}
                    </span>
                  </div>

                  <p
                    className="
                      mt-[9px]
                      text-[10px]
                      font-[500]
                      leading-[1.5]
                      text-[#40506d]
                    "
                  >
                    {alert.text}
                  </p>

                  <div
                    className="
                      mt-[9px]
                      flex
                      justify-end
                    "
                  >
                    <button
                      type="button"
                      className="
                        h-[35px]
                        rounded-[6px]
                        bg-[#d8092d]
                        px-[16px]
                        text-[10px]
                        font-[800]
                        text-white
                      "
                    >
                      Respond Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </aside>
  );
}

/* ================================================================
   TAB
================================================================ */

function ReviewTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        flex
        h-[40px]
        items-center
        justify-center
        whitespace-nowrap
        rounded-[6px]
        px-[14px]
        text-[11px]
        font-[700]
        transition-colors

        ${active
          ? "bg-[#00864a] text-white"
          : "bg-[#f2f5f7] text-[#50607d] hover:bg-[#e9eef2]"
        }
      `}
    >
      {children}

      {active && (
        <span
          className="
            absolute
            -bottom-[11px]
            left-[15%]
            right-[15%]
            h-[3px]
            rounded-full
            bg-[#20aa68]
          "
        />
      )}
    </button>
  );
}

/* ================================================================
   TOOLBAR
================================================================ */

function ToolbarButton({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="
        flex
        h-[39px]
        items-center
        gap-[8px]
        rounded-[6px]
        border
        border-[#dae1e8]
        bg-white
        px-[15px]
        text-[11px]
        font-[700]
        text-[#32446c]
      "
    >
      {icon}

      {children}
    </button>
  );
}

/* ================================================================
   TABLE
================================================================ */

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th
      className="
        px-[10px]
        text-[10px]
        font-[700]
        text-[#4c5b76]
      "
    >
      {children}
    </th>
  );
}

function ReviewRow({
  review,
  checked,
  onToggle,
}: {
  review: Review;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <tr
      className="
        h-[74px]
        border-t
        border-[#e8ebef]
        bg-white
        hover:bg-[#fbfcfd]
      "
    >
      {/* CHECK */}

      <td
        className="
          px-[13px]
        "
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="
            h-[14px]
            w-[14px]
            accent-[#00864a]
          "
        />
      </td>

      {/* CUSTOMER */}

      <td
        className="
          min-w-0
          px-[10px]
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-[10px]
          "
        >
          <Avatar
            name={
              review.customer
            }
          />

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                truncate
                text-[11px]
                font-[800]
                text-[#233761]
              "
            >
              {review.customer}
            </p>

            <p
              className="
                mt-[3px]
                truncate
                text-[9px]
                font-[500]
                text-[#6c7890]
              "
            >
              {review.subtitle}
            </p>
          </div>
        </div>
      </td>

      {/* RATING */}

      <td
        className="
          px-[7px]
        "
      >
        <Stars
          rating={
            review.rating
          }
          size={14}
        />
      </td>

      {/* REVIEW */}

      <td
        className="
          min-w-0
          px-[9px]
        "
      >
        <p
          className="
            line-clamp-2
            text-[10px]
            font-[500]
            leading-[1.45]
            text-[#3c4b68]
          "
        >
          {review.review}
        </p>
      </td>

      {/* LOCATION */}

      <td
        className="
          px-[8px]
        "
      >
        <div
          className="
            flex
            items-start
            gap-[8px]
          "
        >
          <MapPin
            size={20}
            className="
              mt-[1px]
              shrink-0
              fill-[#09a55b]
              text-[#09a55b]
            "
          />

          <div>
            <p
              className="
                text-[10px]
                font-[600]
                text-[#3a4b6c]
              "
            >
              {review.location}
            </p>

            {review.city && (
              <p
                className="
                  mt-[2px]
                  text-[9px]
                  text-[#778399]
                "
              >
                {review.city}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* DATE */}

      <td
        className="
          px-[8px]
        "
      >
        <p
          className="
            text-[10px]
            font-[600]
            text-[#40506f]
          "
        >
          {review.date}
        </p>

        <p
          className="
            mt-[3px]
            text-[9px]
            font-[500]
            text-[#718099]
          "
        >
          {review.time}
        </p>
      </td>

      {/* STATUS */}

      <td
        className="
          px-[7px]
        "
      >
        <StatusBadge
          status={
            review.status
          }
        />
      </td>

      {/* ASSIGNED */}

      <td
        className="
          px-[7px]
        "
      >
        <div
          className="
            flex
            items-center
            gap-[8px]
          "
        >
          <Avatar
            name={
              review.assignedTo
            }
            small
          />

          <span
            className="
              truncate
              text-[10px]
              font-[600]
              text-[#3a4b6c]
            "
          >
            {review.assignedTo}
          </span>
        </div>
      </td>

      {/* ACTION */}

      <td
        className="
          px-[8px]
        "
      >
        <div
          className="
            flex
            items-center
            gap-[10px]
          "
        >
          {review.status ===
            "Pending Reply" ? (
            <button
              type="button"
              className="
                h-[37px]
                min-w-[90px]
                rounded-[6px]
                bg-[#00864a]
                px-[15px]
                text-[10px]
                font-[800]
                text-white
              "
            >
              Reply
            </button>
          ) : (
            <button
              type="button"
              className="
                h-[37px]
                min-w-[90px]
                rounded-[6px]
                border
                border-[#dce2e8]
                bg-white
                px-[15px]
                text-[10px]
                font-[700]
                text-[#40506d]
              "
            >
              View
            </button>
          )}

          <button
            type="button"
            className="
              flex
              h-[37px]
              w-[42px]
              items-center
              justify-center
              rounded-[6px]
              border
              border-[#dce2e8]
              bg-white
              text-[#31446d]
            "
          >
            <MoreHorizontal
              size={17}
            />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ================================================================
   STARS
================================================================ */

function Stars({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-[2px]
        whitespace-nowrap
      "
    >
      {Array.from({
        length: 5,
      }).map((_, index) => {
        const filled =
          index < rating;

        return (
          <Star
            key={index}
            size={size}
            className={
              filled
                ? "fill-[#ffb400] text-[#ffb400]"
                : "fill-[#e9edf1] text-[#e9edf1]"
            }
          />
        );
      })}
    </div>
  );
}

/* ================================================================
   AVATAR
================================================================ */

function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  const initials =
    name
      .split(" ")
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const gradients = [
    "from-[#f1b38b] to-[#7d472f]",
    "from-[#81b6a5] to-[#274e4e]",
    "from-[#f39bb5] to-[#be4770]",
    "from-[#b0a4e4] to-[#56458c]",
  ];

  const gradient =
    gradients[
    name.length %
    gradients.length
    ];

  return (
    <div
      className={`
        relative
        flex
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-gradient-to-br
        ${gradient}
        font-[800]
        text-white
        shadow-[0_1px_3px_rgba(21,40,70,0.15)]

        ${small
          ? "h-[30px] w-[30px] text-[9px]"
          : "h-[39px] w-[39px] text-[10px]"
        }
      `}
    >
      {initials}

      {!small && (
        <span
          className="
            absolute
            -bottom-[2px]
            -right-[2px]
            flex
            h-[14px]
            w-[14px]
            items-center
            justify-center
            rounded-full
            border-2
            border-white
            bg-[#ff9f1c]
          "
        >
          <Star
            size={7}
            className="
              fill-white
              text-white
            "
          />
        </span>
      )}
    </div>
  );
}

/* ================================================================
   STATUS
================================================================ */

function StatusBadge({
  status,
}: {
  status: ReviewStatus;
}) {
  const replied =
    status === "Replied";

  return (
    <span
      className={`
        inline-flex
        min-w-[75px]
        items-center
        justify-center
        rounded-[5px]
        px-[9px]
        py-[7px]
        text-[9px]
        font-[700]

        ${replied
          ? "bg-[#dcf5e7] text-[#138a4d]"
          : "bg-[#fff0ca] text-[#b87908]"
        }
      `}
    >
      {status}
    </span>
  );
}

/* ================================================================
   PAGINATION
================================================================ */

function PageButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-[31px]
        min-w-[31px]
        items-center
        justify-center
        rounded-[5px]
        border
        px-[7px]
        text-[10px]
        font-[700]

        ${active
          ? "border-[#00864a] bg-[#00864a] text-white"
          : "border-[#dfe5ea] bg-white text-[#53617d]"
        }
      `}
    >
      {children}
    </button>
  );
}