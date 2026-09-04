"use client";

import { useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CalendarPlus2,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Mail,
  MessageCircleMore,
  MessagesSquare,
  MessageSquareText,
  MoreVertical,
  Phone,
  PhoneCall,
  Plus,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  UserRoundPlus,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

/* ============================================================
   STATS DATA
============================================================ */

const stats = [
  {
    label: "Total Communications",
    value: "562",
    change: "18.6%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: MessagesSquare,
    iconBg: "#EEE9FF",
    iconColor: "#7550EF",
  },
  {
    label: "Emails Sent",
    value: "245",
    change: "16.3%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: Send,
    iconBg: "#E8F1FF",
    iconColor: "#2679E8",
  },
  {
    label: "WhatsApp Messages",
    value: "188",
    change: "20.5%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: FaWhatsapp,
    iconBg: "#E6F7EB",
    iconColor: "#15994D",
  },
  {
    label: "Calls Made",
    value: "96",
    change: "12.8%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: Phone,
    iconBg: "#E1F6F0",
    iconColor: "#159B88",
  },
  {
    label: "Pending Follow-ups",
    value: "27",
    change: "7.4%",
    compare: "vs Apr 2026",
    direction: "down",
    icon: CalendarDays,
    iconBg: "#F3E8FF",
    iconColor: "#A448EF",
  },
  {
    label: "Completed Follow-ups",
    value: "251",
    change: "22.1%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: CheckCircle2,
    iconBg: "#E8F7EA",
    iconColor: "#189A49",
  },
];

/* ============================================================
   COMMUNICATION TABLE DATA
============================================================ */

const communications = [
  {
    id: "COM-2026-0562",
    name: "TechNova Solutions Pvt. Ltd.",
    email: "rohit.mehra@technova.com",
    phone: "+91 98765 43210",
    channel: "Email",
    subject: "CSR Partnership Opportunity",
    description: "Shared proposal & brochure",
    enquiry: "CSR & Partners",
    status: "Replied",
    lastDate: "31 May 2026",
    lastTime: "10:25 AM",
    nextDate: "04 Jun 2026",
    nextTime: "11:00 AM",
  },
  {
    id: "COM-2026-0561",
    name: "Priya Patel",
    email: "priya.patel@gmail.com",
    phone: "+91 91234 56789",
    channel: "WhatsApp",
    subject: "Volunteer Registration",
    description: "Interested in volunteering",
    enquiry: "Volunteers",
    status: "Pending",
    lastDate: "30 May 2026",
    lastTime: "04:15 PM",
    nextDate: "02 Jun 2026",
    nextTime: "04:00 PM",
  },
  {
    id: "COM-2026-0560",
    name: "GreenFuture Foundation",
    email: "info@greenfuture.org",
    phone: "+91 98711 44556",
    channel: "Call",
    subject: "Community Outreach Support",
    description: "Discussion on collaboration",
    enquiry: "CSR & Partners",
    status: "Completed",
    lastDate: "29 May 2026",
    lastTime: "02:05 PM",
    nextDate: "-",
    nextTime: "",
  },
  {
    id: "COM-2026-0559",
    name: "Sunrise Pharma Ltd.",
    email: "vikram.kapoor@sunrisepharma.com",
    phone: "+91 98123 66789",
    channel: "Email",
    subject: "Request for Assistance",
    description: "Ambulance support enquiry",
    enquiry: "General Enquiry",
    status: "Replied",
    lastDate: "28 May 2026",
    lastTime: "11:20 AM",
    nextDate: "31 May 2026",
    nextTime: "10:00 AM",
  },
  {
    id: "COM-2026-0558",
    name: "Neha Sinha",
    email: "neha.sinha@carewell.org",
    phone: "+91 93456 77889",
    channel: "WhatsApp",
    subject: "Sewa Help Request Follow-up",
    description: "Case verification update",
    enquiry: "Sewa Help",
    status: "Pending",
    lastDate: "27 May 2026",
    lastTime: "03:10 PM",
    nextDate: "29 May 2026",
    nextTime: "03:00 PM",
  },
  {
    id: "COM-2026-0557",
    name: "Amit Rawat",
    email: "amit.rawat@outlook.com",
    phone: "+91 99887 66554",
    channel: "Call",
    subject: "Ritual & Priest Support",
    description: "Details about arrangements",
    enquiry: "Sewa Help",
    status: "Completed",
    lastDate: "26 May 2026",
    lastTime: "01:25 PM",
    nextDate: "-",
    nextTime: "",
  },
  {
    id: "COM-2026-0556",
    name: "LifeLine Industries Ltd.",
    email: "pooja.nair@lifelineind.com",
    phone: "+91 98111 22334",
    channel: "Email",
    subject: "CSR Funding Discussion",
    description: "Budget & scope discussion",
    enquiry: "CSR & Partners",
    status: "Replied",
    lastDate: "25 May 2026",
    lastTime: "12:50 PM",
    nextDate: "28 May 2026",
    nextTime: "11:00 AM",
  },
  {
    id: "COM-2026-0555",
    name: "Deepak Bansal",
    email: "deepak.bansal@rediffmail.com",
    phone: "+91 98711 44556",
    channel: "WhatsApp",
    subject: "Support for Moksha Sewa",
    description: "General contribution enquiry",
    enquiry: "Donation / Support",
    status: "Pending",
    lastDate: "24 May 2026",
    lastTime: "09:40 AM",
    nextDate: "26 May 2026",
    nextTime: "10:00 AM",
  },
];

/* ============================================================
   COMMUNICATION CHANNELS
============================================================ */

const channelStats = [
  {
    label: "Email",
    value: "245 (43.6%)",
    width: 43.6,
    icon: Mail,
    bg: "#E8F1FF",
    iconColor: "#2779E4",
    barColor: "#2177D9",
  },
  {
    label: "WhatsApp",
    value: "188 (33.5%)",
    width: 33.5,
    icon: FaWhatsapp,
    bg: "#E8F7EA",
    iconColor: "#21964D",
    barColor: "#47A469",
  },
  {
    label: "Calls",
    value: "96 (17.1%)",
    width: 17.1,
    icon: Phone,
    bg: "#EEF8E4",
    iconColor: "#75A83A",
    barColor: "#F6A214",
  },
  {
    label: "SMS",
    value: "21 (3.7%)",
    width: 10,
    icon: MessageSquareText,
    bg: "#E9F6E9",
    iconColor: "#29925C",
    barColor: "#8D55DF",
  },
  {
    label: "Others",
    value: "12 (2.1%)",
    width: 7,
    icon: MoreVertical,
    bg: "#EFEFFF",
    iconColor: "#6255D0",
    barColor: "#8998AF",
  },
];

const quickActions = [
  {
    label: "New Communication",
    icon: UserRoundPlus,
  },
  {
    label: "Schedule Follow-up",
    icon: CalendarPlus2,
  },
  {
    label: "Send Bulk Email",
    icon: Send,
  },
  {
    label: "Message Templates",
    icon: MessageSquareText,
  },
  {
    label: "View All Conversations",
    icon: MessageCircleMore,
  },
];

/* ============================================================
   STYLES HELPERS
============================================================ */

function enquiryStyle(type: string) {
  switch (type) {
    case "CSR & Partners":
      return {
        background: "#E5F5E8",
        color: "#257844",
        border: "#CFE9D5",
      };

    case "Volunteers":
      return {
        background: "#F1E8FD",
        color: "#894ADE",
        border: "#E6D7FB",
      };

    case "General Enquiry":
      return {
        background: "#E7F2FE",
        color: "#2874CC",
        border: "#D3E6FA",
      };

    case "Sewa Help":
      return {
        background: "#FCE8ED",
        color: "#DB5771",
        border: "#F6D5DC",
      };

    case "Donation / Support":
      return {
        background: "#FFF1D8",
        color: "#D98E13",
        border: "#F9E2B8",
      };

    default:
      return {
        background: "#F3F4F6",
        color: "#475467",
        border: "#E4E7EC",
      };
  }
}

function statusStyle(status: string) {
  switch (status) {
    case "Replied":
      return {
        background: "#E4F4E7",
        color: "#247843",
        border: "#D0EAD5",
      };

    case "Pending":
      return {
        background: "#FFF1D8",
        color: "#E29515",
        border: "#F8E0B4",
      };

    case "Completed":
      return {
        background: "#E7F2FE",
        color: "#2874CD",
        border: "#D5E6FA",
      };

    default:
      return {
        background: "#F2F4F7",
        color: "#475467",
        border: "#EAECF0",
      };
  }
}

function getChannelStyle(channel: string) {
  switch (channel) {
    case "Email":
      return {
        background: "#E9F2FF",
        color: "#2872CE",
        border: "#D5E6FB",
      };

    case "WhatsApp":
      return {
        background: "#E6F6E9",
        color: "#26894C",
        border: "#CFEAD5",
      };

    default:
      return {
        background: "#FFF3D9",
        color: "#D99316",
        border: "#F7DFAD",
      };
  }
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  item,
}: {
  item: (typeof stats)[number];
}) {
  const Icon = item.icon;

  return (
    <div
      className="
        h-[108px]
        min-w-0
        rounded-[7px]
        border
        border-[#E1E6EC]
        bg-white
        px-[9px]
        py-[9px]
      "
    >
      <div className="flex h-full min-w-0 items-center gap-[8px]">
        {/* ICON */}

        <div
          className="
            flex
            h-[42px]
            w-[42px]
            shrink-0
            items-center
            justify-center
            rounded-full
          "
          style={{
            backgroundColor: item.iconBg,
          }}
        >
          <Icon
            size={24}
            strokeWidth={2}
            style={{
              color: item.iconColor,
            }}
          />
        </div>

        {/* TEXT */}

        <div className="min-w-0 flex-1">
          {/* TITLE */}

          <div
            className="
              w-full
              text-[7.7px]
              font-[700]
              leading-[10px]
              text-[#172863]
              whitespace-normal
            "
          >
            {item.label}
          </div>

          {/* VALUE */}

          <div
            className="
              mt-[3px]
              whitespace-nowrap
              text-[23px]
              font-[800]
              leading-[25px]
              text-[#00642F]
            "
          >
            {item.value}
          </div>

          {/* CHANGE */}

          <div
            className="
              mt-[6px]
              flex
              min-w-0
              items-center
              gap-[3px]
              whitespace-nowrap
            "
          >
            {item.direction === "up" ? (
              <ArrowUp
                size={8}
                strokeWidth={3}
                className="shrink-0 text-[#169248]"
              />
            ) : (
              <ArrowDown
                size={8}
                strokeWidth={3}
                className="shrink-0 text-[#F04438]"
              />
            )}

            <span
              className={`
                shrink-0
                text-[6.8px]
                font-[700]
                ${item.direction === "up"
                  ? "text-[#169248]"
                  : "text-[#F04438]"
                }
              `}
            >
              {item.change}
            </span>

            <span
              className="
                shrink-0
                whitespace-nowrap
                text-[6.2px]
                font-[600]
                text-[#506083]
              "
            >
              {item.compare}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BADGE
============================================================ */

function Badge({
  text,
  style,
}: {
  text: string;
  style: {
    background: string;
    color: string;
    border: string;
  };
}) {
  return (
    <span
      className="
        inline-flex
        max-w-full
        items-center
        whitespace-nowrap
        rounded-[4px]
        border
        px-[6px]
        py-[4px]
        text-[7px]
        font-[700]
        leading-none
      "
      style={{
        backgroundColor: style.background,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {text}
    </span>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="
        flex
        h-[40px]
        min-w-0
        items-center
        justify-between
        gap-[7px]
        rounded-[6px]
        border
        border-[#E0E5EB]
        bg-white
        px-[11px]
        text-[8.4px]
        font-[700]
        text-[#172762]
      "
    >
      <span className="whitespace-nowrap">
        {text}
      </span>

      <ChevronDown
        size={12}
        strokeWidth={2.2}
        className="shrink-0"
      />
    </button>
  );
}

/* ============================================================
   MAIN
============================================================ */

export default function CommunicationsFollowUps() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return communications;
    }

    return communications.filter((item) => {
      const completeText = [
        item.id,
        item.name,
        item.email,
        item.phone,
        item.channel,
        item.subject,
        item.description,
        item.enquiry,
        item.status,
      ]
        .join(" ")
        .toLowerCase();

      return completeText.includes(query);
    });
  }, [search]);

  return (
    <section
      className="
        w-full
        min-w-0
        bg-white
        px-[16px]
        pb-[14px]
        pt-[11px]
      "
    >
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex items-start justify-between gap-[20px]">
        <div className="min-w-0">
          <h1
            className="
              text-[20px]
              font-[800]
              leading-[25px]
              tracking-[-0.4px]
              text-[#005E2E]
            "
          >
            Communications &amp; Follow-ups
          </h1>

          <p
            className="
              mt-[2px]
              text-[9.5px]
              font-[500]
              leading-[14px]
              text-[#344574]
            "
          >
            Track conversations, messages and follow-ups across all enquiries
            and leads.
          </p>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[12px]
            pt-[2px]
          "
        >
          <button
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#E0E5EB]
              bg-white
              px-[15px]
              text-[9px]
              font-[700]
              text-[#172762]
            "
          >
            <Download size={14} />

            Export
          </button>

          <button
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#E0E5EB]
              bg-white
              px-[15px]
              text-[9px]
              font-[700]
              text-[#172762]
            "
          >
            <SlidersHorizontal size={14} />

            Filters
          </button>

          <button
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              bg-[#005F2E]
              px-[17px]
              text-[9px]
              font-[700]
              text-white
              shadow-[0_2px_5px_rgba(0,95,46,0.12)]
            "
          >
            <Plus size={15} />

            New Communication
          </button>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          mt-[21px]
          grid
          w-full
          min-w-0
          grid-cols-[minmax(0,1fr)_255px]
          gap-[16px]
        "
      >
        {/* ====================================================
            LEFT
        ==================================================== */}

        <main className="min-w-0">
          {/* ==================================================
              TOP CARDS
          ================================================== */}

          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-6
              gap-[9px]
            "
          >
            {stats.map((item) => (
              <StatCard
                key={item.label}
                item={item}
              />
            ))}
          </div>

          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <div
            className="
              mt-[20px]
              grid
              w-full
              min-w-0
              grid-cols-[minmax(190px,1.7fr)_122px_112px_133px_minmax(150px,1.15fr)_76px]
              gap-[9px]
            "
          >
            {/* SEARCH */}

            <div
              className="
                flex
                h-[40px]
                min-w-0
                items-center
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[11px]
              "
            >
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email, subject or notes..."
                className="
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[8.4px]
                  font-[600]
                  text-[#172762]
                  outline-none
                  placeholder:text-[#536184]
                "
              />

              <Search
                size={15}
                strokeWidth={2}
                className="ml-[7px] shrink-0 text-[#1D377A]"
              />
            </div>

            <FilterButton text="All Channels" />

            <FilterButton text="All Status" />

            <FilterButton text="All Enquiry Types" />

            {/* DATE */}

            <button
              className="
                flex
                h-[40px]
                min-w-0
                items-center
                gap-[8px]
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[11px]
                text-[8.2px]
                font-[600]
                text-[#536080]
              "
            >
              <CalendarRange
                size={14}
                strokeWidth={2}
                className="shrink-0 text-[#213C79]"
              />

              <span className="whitespace-nowrap">
                Select Date Range
              </span>
            </button>

            {/* RESET */}

            <button
              onClick={() => setSearch("")}
              className="
                flex
                h-[40px]
                items-center
                justify-center
                gap-[5px]
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[7px]
                text-[7.8px]
                font-[700]
                text-[#172762]
              "
            >
              <RotateCcw size={12} />

              Reset
            </button>
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div
            className="
              mt-[11px]
              w-full
              min-w-0
              overflow-hidden
              rounded-[6px]
              border
              border-[#E2E6EB]
              bg-white
            "
          >
            <table
              className="
                w-full
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
              </colgroup>

              <thead>
                <tr
                  className="
                    h-[34px]
                    bg-[#005F2E]
                    text-left
                    text-white
                  "
                >
                  <th className="px-[8px] text-[7.5px] font-[700]">
                    ID
                  </th>

                  <th className="px-[8px] text-[7.5px] font-[700]">
                    Contact / Organization
                  </th>

                  <th className="px-[6px] text-[7.5px] font-[700]">
                    Channel
                  </th>

                  <th className="px-[8px] text-[7.5px] font-[700]">
                    Subject / Conversation
                  </th>

                  <th className="px-[6px] text-[7.5px] font-[700]">
                    Enquiry Type
                  </th>

                  <th className="px-[6px] text-[7.5px] font-[700]">
                    Status
                  </th>

                  <th className="px-[6px] text-[7.5px] font-[700]">
                    Last Activity
                  </th>

                  <th className="px-[6px] text-[7.5px] font-[700]">
                    Next Follow-up
                  </th>

                  <th className="px-[6px] text-[7.5px] font-[700]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const channelColors =
                    getChannelStyle(row.channel);

                  return (
                    <tr
                      key={row.id}
                      className="
                        h-[67px]
                        border-b
                        border-[#E8EBEF]
                        bg-white
                        last:border-b-0
                        hover:bg-[#FBFCFD]
                      "
                    >
                      {/* ID */}

                      <td className="px-[7px] align-middle">
                        <span
                          className="
                            whitespace-nowrap
                            text-[7px]
                            font-[700]
                            text-[#13763E]
                          "
                        >
                          {row.id}
                        </span>
                      </td>

                      {/* CONTACT */}

                      <td className="min-w-0 px-[8px] align-middle">
                        <div className="min-w-0">
                          <p
                            className="
                              truncate
                              text-[7.8px]
                              font-[700]
                              leading-[11px]
                              text-[#192B66]
                            "
                          >
                            {row.name}
                          </p>

                          <p
                            className="
                              mt-[4px]
                              truncate
                              text-[6.7px]
                              font-[500]
                              leading-[10px]
                              text-[#293B70]
                            "
                          >
                            {row.email}
                          </p>

                          <p
                            className="
                              mt-[2px]
                              whitespace-nowrap
                              text-[6.7px]
                              font-[500]
                              leading-[10px]
                              text-[#293B70]
                            "
                          >
                            {row.phone}
                          </p>
                        </div>
                      </td>

                      {/* CHANNEL */}

                      <td className="px-[5px] align-middle">
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-[3px]
                            whitespace-nowrap
                            rounded-[4px]
                            border
                            px-[5px]
                            py-[4px]
                            text-[6.7px]
                            font-[700]
                            leading-none
                          "
                          style={{
                            background:
                              channelColors.background,
                            color: channelColors.color,
                            borderColor:
                              channelColors.border,
                          }}
                        >
                          {row.channel === "Email" && (
                            <Mail size={8} />
                          )}

                          {row.channel ===
                            "WhatsApp" && (
                              <FaWhatsapp size={8} />
                            )}

                          {row.channel === "Call" && (
                            <Phone size={8} />
                          )}

                          {row.channel}
                        </span>
                      </td>

                      {/* SUBJECT */}

                      <td className="min-w-0 px-[8px] align-middle">
                        <p
                          className="
                            truncate
                            text-[7.6px]
                            font-[700]
                            leading-[11px]
                            text-[#192B66]
                          "
                        >
                          {row.subject}
                        </p>

                        <p
                          className="
                            mt-[4px]
                            truncate
                            text-[6.7px]
                            font-[500]
                            leading-[10px]
                            text-[#304276]
                          "
                        >
                          {row.description}
                        </p>
                      </td>

                      {/* ENQUIRY */}

                      <td className="px-[5px] align-middle">
                        <Badge
                          text={row.enquiry}
                          style={enquiryStyle(
                            row.enquiry
                          )}
                        />
                      </td>

                      {/* STATUS */}

                      <td className="px-[5px] align-middle">
                        <Badge
                          text={row.status}
                          style={statusStyle(
                            row.status
                          )}
                        />
                      </td>

                      {/* LAST ACTIVITY */}

                      <td className="px-[5px] align-middle">
                        <p
                          className="
                            whitespace-nowrap
                            text-[6.7px]
                            font-[500]
                            leading-[10px]
                            text-[#26396D]
                          "
                        >
                          {row.lastDate}
                        </p>

                        <p
                          className="
                            mt-[2px]
                            whitespace-nowrap
                            text-[6.7px]
                            font-[500]
                            leading-[10px]
                            text-[#26396D]
                          "
                        >
                          {row.lastTime}
                        </p>
                      </td>

                      {/* NEXT FOLLOW-UP */}

                      <td className="px-[5px] align-middle">
                        <p
                          className="
                            whitespace-nowrap
                            text-[6.7px]
                            font-[500]
                            leading-[10px]
                            text-[#26396D]
                          "
                        >
                          {row.nextDate}
                        </p>

                        {row.nextTime && (
                          <p
                            className="
                              mt-[2px]
                              whitespace-nowrap
                              text-[6.7px]
                              font-[500]
                              leading-[10px]
                              text-[#26396D]
                            "
                          >
                            {row.nextTime}
                          </p>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-[5px] align-middle">
                        <div className="flex items-center gap-[5px]">
                          <button
                            className="
                              flex
                              h-[28px]
                              w-[29px]
                              shrink-0
                              items-center
                              justify-center
                              rounded-[5px]
                              border
                              border-[#E3E7EC]
                              bg-white
                              text-[#263C76]
                            "
                          >
                            <Eye size={11} />
                          </button>

                          <button
                            className="
                              flex
                              h-[28px]
                              w-[29px]
                              shrink-0
                              items-center
                              justify-center
                              rounded-[5px]
                              border
                              border-[#E3E7EC]
                              bg-white
                              text-[#263C76]
                            "
                          >
                            <MoreVertical size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div
              className="
                flex
                h-[48px]
                items-center
                justify-between
                gap-[10px]
                border-t
                border-[#E6E9ED]
                px-[9px]
              "
            >
              <p
                className="
                  shrink-0
                  whitespace-nowrap
                  text-[6.7px]
                  font-[600]
                  text-[#475A83]
                "
              >
                Showing 1 to 8 of 562 communications
              </p>

              <div className="flex items-center gap-[5px]">
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="
                    flex
                    h-[27px]
                    w-[27px]
                    items-center
                    justify-center
                    rounded-[4px]
                    border
                    border-[#E3E7ED]
                    bg-white
                    text-[#536180]
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft size={12} />
                </button>

                {[1, 2, 3].map((number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`
                      flex
                      h-[27px]
                      w-[27px]
                      items-center
                      justify-center
                      rounded-[4px]
                      border
                      text-[7.5px]
                      font-[700]
                      ${page === number
                        ? "border-[#006132] bg-[#006132] text-white"
                        : "border-[#E3E7ED] bg-white text-[#334575]"
                      }
                    `}
                  >
                    {number}
                  </button>
                ))}

                <button
                  className="
                    flex
                    h-[27px]
                    w-[27px]
                    items-center
                    justify-center
                    rounded-[4px]
                    border
                    border-[#E3E7ED]
                    bg-white
                    text-[8px]
                    text-[#596584]
                  "
                >
                  ...
                </button>

                <button
                  onClick={() => setPage(71)}
                  className={`
                    flex
                    h-[27px]
                    w-[27px]
                    items-center
                    justify-center
                    rounded-[4px]
                    border
                    text-[7.5px]
                    font-[700]
                    ${page === 71
                      ? "border-[#006132] bg-[#006132] text-white"
                      : "border-[#E3E7ED] bg-white text-[#334575]"
                    }
                  `}
                >
                  71
                </button>

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.min(71, current + 1)
                    )
                  }
                  className="
                    flex
                    h-[27px]
                    w-[27px]
                    items-center
                    justify-center
                    rounded-[4px]
                    border
                    border-[#E3E7ED]
                    bg-white
                    text-[#334575]
                  "
                >
                  <ChevronRight size={12} />
                </button>
              </div>

              <button
                className="
                  flex
                  h-[28px]
                  w-[94px]
                  shrink-0
                  items-center
                  justify-between
                  rounded-[4px]
                  border
                  border-[#E3E7ED]
                  bg-white
                  px-[9px]
                  text-[6.7px]
                  font-[700]
                  text-[#536180]
                "
              >
                10 per page

                <ChevronDown size={11} />
              </button>
            </div>
          </div>
        </main>

        {/* ====================================================
            RIGHT SIDEBAR
        ==================================================== */}

        <aside className="w-[255px] min-w-0">
          {/* ==================================================
              COMMUNICATION OVERVIEW
          ================================================== */}

          <div
            className="
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-white
              px-[12px]
              pb-[13px]
              pt-[12px]
            "
          >
            <div className="flex items-center justify-between gap-[7px]">
              <h2
                className="
                  whitespace-nowrap
                  text-[8.7px]
                  font-[700]
                  text-[#1F2430]
                "
              >
                Communication Overview
              </h2>

              <button
                className="
                  flex
                  shrink-0
                  items-center
                  gap-[3px]
                  text-[6.7px]
                  font-[700]
                  text-[#167E48]
                "
              >
                View Report

                <ArrowRight size={9} />
              </button>
            </div>

            <div className="mt-[17px] flex items-center gap-[10px]">
              {/* DONUT */}

              <div
                className="
                  relative
                  flex
                  h-[94px]
                  w-[94px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                "
                style={{
                  background:
                    "conic-gradient(#007B3C 0deg 157deg,#49A861 157deg 278deg,#F6A313 278deg 340deg,#F01B1F 340deg 360deg)",
                }}
              >
                <div
                  className="
                    flex
                    h-[60px]
                    w-[60px]
                    flex-col
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                  "
                >
                  <strong
                    className="
                      text-[18px]
                      font-[800]
                      leading-none
                      text-[#111]
                    "
                  >
                    562
                  </strong>

                  <span
                    className="
                      mt-[4px]
                      text-[6.4px]
                      font-[600]
                      text-[#44537B]
                    "
                  >
                    Total
                  </span>
                </div>
              </div>

              {/* LEGEND */}

              <div className="min-w-0 flex-1 space-y-[10px]">
                {[
                  {
                    label: "Email",
                    value: "245 (43.6%)",
                    color: "#007D3B",
                  },
                  {
                    label: "WhatsApp",
                    value: "188 (33.5%)",
                    color: "#6CB21A",
                  },
                  {
                    label: "Calls",
                    value: "96 (17.1%)",
                    color: "#F4A112",
                  },
                  {
                    label: "Others",
                    value: "33 (5.8%)",
                    color: "#EF1F23",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="
                      flex
                      min-w-0
                      items-center
                      justify-between
                      gap-[4px]
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-[5px]
                      "
                    >
                      <span
                        className="
                          h-[6px]
                          w-[6px]
                          shrink-0
                          rounded-full
                        "
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />

                      <span
                        className="
                          whitespace-nowrap
                          text-[6.3px]
                          font-[600]
                          text-[#26386D]
                        "
                      >
                        {item.label}
                      </span>
                    </div>

                    <span
                      className="
                        shrink-0
                        whitespace-nowrap
                        text-[5.9px]
                        font-[600]
                        text-[#26386D]
                      "
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================
              CHANNELS
          ================================================== */}

          <div
            className="
              mt-[14px]
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-white
              px-[12px]
              pb-[14px]
              pt-[12px]
            "
          >
            <h2
              className="
                text-[8.8px]
                font-[700]
                text-[#1F2430]
              "
            >
              Communication Channels
            </h2>

            <div className="mt-[16px] space-y-[11px]">
              {channelStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="
                      grid
                      grid-cols-[77px_minmax(0,1fr)_53px]
                      items-center
                      gap-[5px]
                    "
                  >
                    <div className="flex min-w-0 items-center gap-[5px]">
                      <div
                        className="
                          flex
                          h-[19px]
                          w-[19px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                        "
                        style={{
                          backgroundColor: item.bg,
                        }}
                      >
                        <Icon
                          size={9}
                          strokeWidth={2}
                          style={{
                            color: item.iconColor,
                          }}
                        />
                      </div>

                      <span
                        className="
                          whitespace-nowrap
                          text-[6.6px]
                          font-[700]
                          text-[#26376D]
                        "
                      >
                        {item.label}
                      </span>
                    </div>

                    <div
                      className="
                        h-[5px]
                        min-w-0
                        overflow-hidden
                        rounded-full
                        bg-[#E9EDF2]
                      "
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.width}%`,
                          backgroundColor:
                            item.barColor,
                        }}
                      />
                    </div>

                    <span
                      className="
                        whitespace-nowrap
                        text-right
                        text-[5.9px]
                        font-[600]
                        text-[#26376D]
                      "
                    >
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <div
            className="
              mt-[14px]
              overflow-hidden
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-[#FAFBFE]
            "
          >
            <div className="px-[12px] pb-[7px] pt-[12px]">
              <h2
                className="
                  text-[9.7px]
                  font-[700]
                  text-[#193775]
                "
              >
                Quick Actions
              </h2>
            </div>

            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  className="
                    flex
                    h-[34px]
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-[#EDF0F4]
                    px-[12px]
                    text-[#1A2F6D]
                    last:border-b-0
                  "
                >
                  <span className="flex min-w-0 items-center gap-[8px]">
                    <Icon
                      size={12}
                      className="shrink-0"
                    />

                    <span
                      className="
                        whitespace-nowrap
                        text-[7.2px]
                        font-[700]
                      "
                    >
                      {action.label}
                    </span>
                  </span>

                  <ArrowRight
                    size={10}
                    className="shrink-0"
                  />
                </button>
              );
            })}
          </div>

          {/* ==================================================
              HELP
          ================================================== */}

          <div
            className="
              mt-[14px]
              rounded-[7px]
              border
              border-[#E2E8E4]
              bg-[#FAFCFA]
              px-[14px]
              pb-[16px]
              pt-[14px]
            "
          >
            <h2
              className="
                text-[10px]
                font-[800]
                text-[#08602E]
              "
            >
              Need Help?
            </h2>

            <p
              className="
                mt-[7px]
                text-[7px]
                font-[500]
                text-[#44537C]
              "
            >
              For any assistance, contact our team.
            </p>

            <div className="mt-[12px] flex items-center gap-[8px]">
              <PhoneCall
                size={15}
                className="shrink-0 text-[#208447]"
              />

              <span
                className="
                  whitespace-nowrap
                  text-[8.5px]
                  font-[800]
                  text-[#21713A]
                "
              >
                +91 98765 43210
              </span>
            </div>

            <div
              className="
                mt-[11px]
                flex
                min-w-0
                items-center
                gap-[8px]
              "
            >
              <Mail
                size={15}
                className="shrink-0 text-[#208447]"
              />

              <span
                className="
                  whitespace-nowrap
                  text-[7.3px]
                  font-[700]
                  text-[#283C74]
                "
              >
                support@mokshasewa.org
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}