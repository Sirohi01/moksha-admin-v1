"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  Mail,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Flame,
  Wallet,
  Siren,
  History,
  UserPlus,
  Truck,
  Megaphone,
  Receipt,
  Trophy,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { reportsApi, ReportsOverview } from "@/lib/reportsApi";
import { enquiriesApi } from "@/lib/enquiriesApi";
import { auditApi } from "@/lib/auditApi";
import { casesApi, SlaBreach } from "@/lib/casesApi";
import { volunteersApi } from "@/lib/volunteersApi";
import { formatCurrency, formatDateTime, CASE_STATUS_META } from "@/lib/statusMeta";
import { CaseStatus, AuditLogEntry, VolunteerSummary, Enquiry } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

interface DashboardData {
  overview: ReportsOverview;
  enquiries: Enquiry[];
  breaches: SlaBreach[];
  activity: AuditLogEntry[];
  topVolunteers: VolunteerSummary[];
}

const STATUS_ORDER: CaseStatus[] = [
  "NEW",
  "UNDER_VERIFICATION",
  "APPROVED",
  "VOLUNTEER_ASSIGNED",
  "TRANSPORT_ARRANGED",
  "CREMATION_IN_PROGRESS",
  "CREMATION_COMPLETED",
  "DOCS_UPLOADED",
];

const CAUSE_LABELS: Record<string, string> = {
  general: "General Sewa",
  cremation: "Cremation",
  ambulance: "Ambulance",
  annadan: "Annadan",
};

// Fixed categorical order, validated for CVD-safe separation (dataviz skill's palette validator —
// distinct hues rather than tints of the single magnitude accent, since this chart's job is
// composition-of-a-total across causes, not a single-hue magnitude comparison.
const CAUSE_COLORS: Record<string, string> = {
  general: "#A6752E",
  cremation: "#C1502E",
  ambulance: "#0891A8",
  annadan: "#6B4FA0",
};
const CAUSE_COLOR_FALLBACK = "#8A8578";

// Same validated 4-hue set as CAUSE_COLORS, reused for the KPI tiles so the dashboard draws from
// one consistent palette rather than inventing new colors per section.
const KPI_COLORS = {
  cases: "#A6752E",
  requests: "#0891A8",
  volunteers: "#C1502E",
  donations: "#6B4FA0",
};

// Single-hue ordinal ramp (light -> dark = earlier -> later pipeline stage), validated with the
// dataviz skill's palette validator in --ordinal mode (monotone lightness, >=0.06 OKLCH step gaps,
// light-end contrast >=2:1 against the card surface) — a stage's place in the pipeline is order,
// not identity, so this stays one hue rather than switching to distinct categorical colors.
const PIPELINE_COLORS: Record<CaseStatus, string> = {
  NEW: "#c99245",
  UNDER_VERIFICATION: "#b47e2e",
  APPROVED: "#9f6b13",
  VOLUNTEER_ASSIGNED: "#8b5700",
  TRANSPORT_ARRANGED: "#774500",
  CREMATION_IN_PROGRESS: "#633200",
  CREMATION_COMPLETED: "#502000",
  DOCS_UPLOADED: "#3d0e00",
  CLOSED: "#3d0e00",
  REJECTED: "#8A8578",
  CANCELLED: "#8A8578",
};

const QUICK_ACTIONS = [
  { label: "New Requests", href: "/requests", icon: ClipboardList },
  { label: "Record Donation", href: "/donations", icon: HeartHandshake },
  { label: "New Campaign", href: "/campaigns", icon: Megaphone },
  { label: "Invite Staff", href: "/staff", icon: UserPlus },
  { label: "Add Vehicle", href: "/vehicles", icon: Truck },
  { label: "Review Expenses", href: "/cases", icon: Receipt },
];

interface MagnitudeDatum {
  label: string;
  value: number;
}

function ChartTooltip({
  active,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: { label: string; value: number } }>;
  valueFormatter?: (value: number) => string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  const { label, value } = datum;
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs shadow-lg">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="text-text-secondary">{valueFormatter ? valueFormatter(value) : value}</p>
    </div>
  );
}

// A few placeholder rows so the empty state reserves the exact same footprint a populated chart
// would take — never real numbers, just enough rows to show the frame at true size.
const EMPTY_PLACEHOLDER_ROWS: MagnitudeDatum[] = [{ label: "", value: 0 }, { label: "", value: 0 }, { label: "", value: 0 }];

/** A single hue for magnitude-by-category — these bars compare size within one measure (case
 * counts, donation totals), not distinct identities that need their own hues (dataviz skill:
 * sequential/magnitude gets one hue, not a categorical palette). */
function MagnitudeBarChart({
  data,
  valueFormatter,
  emptyLabel,
}: {
  data: MagnitudeDatum[];
  valueFormatter?: (value: number) => string;
  emptyLabel: string;
}) {
  const isEmpty = data.length === 0;
  const rows = isEmpty ? EMPTY_PLACEHOLDER_ROWS : data;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={Math.max(140, rows.length * 34)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap={12}>
          <CartesianGrid horizontal={false} stroke="var(--surface-border)" />
          <XAxis type="number" hide domain={isEmpty ? [0, 1] : undefined} />
          <YAxis
            type="category"
            dataKey="label"
            width={112}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
          {!isEmpty && (
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} cursor={{ fill: "var(--surface-sunken)" }} />
          )}
          <Bar
            dataKey="value"
            fill={isEmpty ? "var(--surface-sunken)" : "var(--accent)"}
            radius={[0, 4, 4, 0]}
            maxBarSize={16}
            isAnimationActive={!isEmpty}
          />
        </BarChart>
      </ResponsiveContainer>
      {isEmpty && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

interface DonutDatum {
  key: string;
  label: string;
  value: number;
}

/** Composition-of-a-total (this slice vs. the whole) — a genuinely different job from the
 * bar charts on this page, so it earns a different form rather than reusing the bar treatment
 * purely for visual variety. Shared by both donut cards; only the color lookup differs. */
function DonutChart({
  data,
  colorFor,
  valueFormatter,
  emptyLabel,
}: {
  data: DonutDatum[];
  colorFor: (key: string) => string;
  valueFormatter?: (value: number) => string;
  emptyLabel: string;
}) {
  const isEmpty = data.length === 0;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (isEmpty) {
    return (
      <div className="flex h-[168px] items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[14px] border-dashed border-surface-border">
          <p className="px-2 text-center text-xs text-text-muted">{emptyLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={168}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="85%" paddingAngle={3} strokeWidth={0}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={colorFor(entry.key)} />
            ))}
          </Pie>
          <Tooltip content={(props) => <ChartTooltip {...props} valueFormatter={valueFormatter} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorFor(entry.key) }} />
            <span className="truncate text-text-secondary">{entry.label}</span>
            <span className="ml-auto shrink-0 font-semibold text-text-primary">
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const admin = useAppSelector((state) => state.auth.admin);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      reportsApi.overview(),
      enquiriesApi.list(),
      casesApi.slaBreaches(),
      auditApi.list(),
      volunteersApi.list({ status: "ACTIVE" }),
    ])
      .then(([overview, enquiries, breaches, activity, volunteers]) => {
        if (cancelled) return;
        const topVolunteers = [...volunteers].sort((a, b) => b.totalAssignments - a.totalAssignments).slice(0, 5);
        setData({ overview, enquiries, breaches, activity: activity.slice(0, 8), topVolunteers });
      })
      .catch(() => {
        // A rejected fetch here is almost always an expired/invalid session — RequireAdminAuth's
        // own check (and lib/api.ts's refresh-failure handler) already redirects to /login.
        // Swallow it so an unhandled rejection doesn't surface as a scary dev-overlay crash.
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const { overview } = data;
  const activePipeline = STATUS_ORDER.filter((s) => overview.cases.byStatus[s] > 0);
  const pipelineData: DonutDatum[] = activePipeline.map((status) => ({
    key: status,
    label: CASE_STATUS_META[status].label,
    value: overview.cases.byStatus[status],
  }));
  const causeEntries = Object.entries(overview.donations.byCause).filter(([, v]) => v > 0);
  const causeData: DonutDatum[] = causeEntries.map(([cause, amount]) => ({
    key: cause,
    label: CAUSE_LABELS[cause] ?? cause,
    value: amount,
  }));
  const topVolunteerData: MagnitudeDatum[] = data.topVolunteers.map((v) => ({
    label: v.name ?? "—",
    value: v.totalAssignments,
  }));
  const newEnquiries = data.enquiries.filter((e) => e.status === "new").slice(0, 5);
  const firstName = admin?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-1">
      {/* Welcome banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-surface-border bg-surface-card p-3.5">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Welcome back, {firstName}!</h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Here&apos;s what&apos;s happening across cases, requests, volunteers and donations today.
          </p>
        </div>
        <Link
          href="/reports"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
        >
          Full Reports <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI row — each metric family keeps one fixed identity color (reused from the donut
          palettes above) so the row reads as distinct metrics; an active problem (critical
          cases, expenses awaiting approval) always overrides to the reserved danger color. */}
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Open Cases"
          value={overview.cases.open}
          hint={`${overview.cases.total} total`}
          accentColor={KPI_COLORS.cases}
        />
        <StatCard
          icon={Siren}
          label="Critical Cases"
          value={overview.cases.critical}
          tone={overview.cases.critical > 0 ? "danger" : "neutral"}
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Requests"
          value={overview.requests.pending}
          hint={`${overview.requests.total} total`}
          accentColor={KPI_COLORS.requests}
        />
        <StatCard
          icon={HandHeart}
          label="Active Volunteers"
          value={overview.volunteers.active}
          hint={`${overview.volunteers.total} total`}
          accentColor={KPI_COLORS.volunteers}
        />
        <StatCard
          icon={HeartHandshake}
          label="Raised This Month"
          value={formatCurrency(overview.donations.thisMonthRaised)}
          hint={`${overview.donations.thisMonthDonations} donations`}
          accentColor={KPI_COLORS.donations}
        />
        <StatCard
          icon={Flame}
          label="Total Raised"
          value={formatCurrency(overview.donations.totalRaised)}
          hint={`${overview.donations.totalDonations} donations`}
          accentColor={KPI_COLORS.donations}
        />
        <StatCard
          icon={Wallet}
          label="Expenses Pending"
          value={formatCurrency(overview.expenses.pendingAmount)}
          hint={`${overview.expenses.pendingCount} to approve`}
          tone={overview.expenses.pendingCount > 0 ? "danger" : "neutral"}
        />
        <StatCard
          icon={Mail}
          label="New Enquiries"
          value={newEnquiries.length}
          hint={`${data.enquiries.length} total`}
          accentColor={KPI_COLORS.requests}
        />
      </div>

      {/* Row: pipeline / SLA breaches / donations by cause */}
      <div className="grid gap-1 lg:grid-cols-3">
        <Card padding="sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Case Pipeline</h2>
          <DonutChart
            data={pipelineData}
            colorFor={(key) => PIPELINE_COLORS[key as CaseStatus] ?? CAUSE_COLOR_FALLBACK}
            emptyLabel="No active cases right now."
          />
        </Card>

        <Card padding="sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              SLA Breaches
            </h2>
            {data.breaches.length > 0 && <Badge tone="danger">{data.breaches.length}</Badge>}
          </div>
          {data.breaches.length === 0 ? (
            <p className="text-sm text-text-muted">Nothing breaching SLA right now.</p>
          ) : (
            <div className="space-y-1">
              {data.breaches.slice(0, 5).map((b) => (
                <Link
                  key={`${b._id}-${b.breachReason}`}
                  href={`/cases/${b._id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-surface-sunken"
                >
                  <span className="font-medium text-text-primary">{b.caseId}</span>
                  <span className="truncate text-text-muted">{b.breachReason}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card padding="sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Donations by Cause</h2>
          <DonutChart
            data={causeData}
            colorFor={(key) => CAUSE_COLORS[key] ?? CAUSE_COLOR_FALLBACK}
            valueFormatter={formatCurrency}
            emptyLabel="No donations recorded yet."
          />
        </Card>
      </div>

      {/* Row: recent activity / quick actions / top volunteers */}
      <div className="grid gap-1 lg:grid-cols-3">
        <Card padding="sm">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            <History className="h-3.5 w-3.5" />
            Recent Activity
          </h2>
          {data.activity.length === 0 ? (
            <p className="text-sm text-text-muted">No activity logged yet.</p>
          ) : (
            <div className="max-h-44 space-y-2 overflow-y-auto">
              {data.activity.map((entry) => (
                <div key={entry._id} className="text-xs">
                  <p className="text-text-primary">
                    <span className="font-semibold">{entry.actorName}</span>{" "}
                    <span className="text-text-secondary">{entry.action.replace(/\./g, " ").replace(/_/g, " ")}</span>
                  </p>
                  <p className="text-[10px] text-text-muted">{formatDateTime(entry.at)}</p>
                </div>
              ))}
            </div>
          )}
          <Link href="/audit-log" className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline">
            View Full Log <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>

        <Card padding="sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-1.5 border border-surface-border p-2.5 text-center hover:border-accent hover:bg-accent-soft"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  <span className="text-[11px] font-medium text-text-secondary">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card padding="sm">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            Top Volunteers
          </h2>
          <MagnitudeBarChart
            data={topVolunteerData}
            valueFormatter={(v) => `${v} assignment${v === 1 ? "" : "s"}`}
            emptyLabel="No active volunteers yet."
          />
        </Card>
      </div>

      {/* Row: new enquiries needing follow-up */}
      {newEnquiries.length > 0 && (
        <Card padding="sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">New Enquiries Needing Follow-up</h2>
            <Link href="/enquiries" className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {newEnquiries.map((e) => (
              <div key={e._id} className="border border-surface-border p-2.5 text-xs">
                <p className="font-semibold text-text-primary">{e.name}</p>
                <p className="text-text-muted">{e.phone}</p>
                <p className="mt-1 line-clamp-2 text-text-secondary">{e.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
