"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, FolderKanban, HeartHandshake, Receipt } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { reportsApi, ReportsOverview, ReportSnapshot } from "@/lib/reportsApi";
import { formatCurrency, CASE_STATUS_META } from "@/lib/statusMeta";
import { CaseStatus } from "@/lib/types";

const ALL_STATUSES: CaseStatus[] = [
  "NEW",
  "UNDER_VERIFICATION",
  "APPROVED",
  "VOLUNTEER_ASSIGNED",
  "TRANSPORT_ARRANGED",
  "CREMATION_IN_PROGRESS",
  "CREMATION_COMPLETED",
  "DOCS_UPLOADED",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
];

const CAUSE_LABELS: Record<string, string> = {
  general: "General",
  cremation: "Cremation",
  ambulance: "Ambulance",
  annadan: "Annadan",
};

function shortDate(dateKey: string): string {
  const [, m, d] = dateKey.split("-");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${MONTHS[Number(m) - 1]}`;
}

function TrendTooltip({
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
  return (
    <div className="border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs shadow-lg">
      <p className="font-semibold text-text-primary">{datum.label}</p>
      <p className="text-text-secondary">{valueFormatter ? valueFormatter(datum.value) : datum.value}</p>
    </div>
  );
}
function TrendChart({ data, valueFormatter }: { data: { label: string; value: number }[]; valueFormatter?: (value: number) => string }) {
  if (data.length < 2) {
    return <p className="flex h-[180px] items-center justify-center text-sm text-text-muted">Not enough history yet — check back tomorrow.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--surface-border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={40} />
        <Tooltip content={<TrendTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: "var(--surface-border)" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--accent)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function ReportsPage() {
  const [overview, setOverview] = useState<ReportsOverview | null>(null);
  const [snapshots, setSnapshots] = useState<ReportSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"cases" | "donations" | null>(null);

  useEffect(() => {
    Promise.all([reportsApi.overview(), reportsApi.snapshots(30)])
      .then(([o, s]) => {
        setOverview(o);
        setSnapshots(s);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (kind: "cases" | "donations") => {
    setExporting(kind);
    try {
      if (kind === "cases") await reportsApi.exportCases();
      else await reportsApi.exportDonations();
    } finally {
      setExporting(null);
    }
  };

  if (loading || !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const maxCause = Math.max(1, ...Object.values(overview.donations.byCause));
  const raisedTrend = snapshots.map((s) => ({ label: shortDate(s.date), value: s.donations.totalRaised }));
  const openCasesTrend = snapshots.map((s) => ({ label: shortDate(s.date), value: s.cases.open }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Reports</h1>
        <p className="text-xs text-text-muted">Full breakdowns and exportable registers.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Total Raised — Last 30 Days</h2>
          <TrendChart data={raisedTrend} valueFormatter={formatCurrency} />
        </Card>
        <Card>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Open Cases — Last 30 Days</h2>
          <TrendChart data={openCasesTrend} valueFormatter={(v) => `${v} case${v === 1 ? "" : "s"}`} />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Total Cases" value={overview.cases.total} hint={`${overview.cases.open} open`} />
        <StatCard icon={HeartHandshake} label="Total Raised" value={formatCurrency(overview.donations.totalRaised)} />
        <StatCard
          icon={Receipt}
          label="Expenses Approved"
          value={formatCurrency(overview.expenses.approvedAmount)}
          hint={`${overview.expenses.approvedCount} entries`}
        />
        <StatCard
          icon={Receipt}
          label="Pending Approval"
          value={formatCurrency(overview.expenses.pendingAmount)}
          hint={`${overview.expenses.pendingCount} entries`}
          tone={overview.expenses.pendingCount > 0 ? "accent" : "neutral"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Cases by Status</h2>
          <div className="space-y-1.5">
            {ALL_STATUSES.map((status) => (
              <div key={status} className="flex items-center justify-between border-b border-surface-border py-1.5 text-xs last:border-0">
                <span className="text-text-secondary">{CASE_STATUS_META[status].label}</span>
                <span className="font-semibold text-text-primary">{overview.cases.byStatus[status]}</span>
              </div>
            ))}
          </div>
          <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => handleExport("cases")} loading={exporting === "cases"}>
            <Download className="h-3.5 w-3.5" /> Export Case Register (CSV)
          </Button>
        </Card>

        <Card>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Donations by Cause</h2>
          <div className="space-y-2">
            {Object.entries(overview.donations.byCause).length === 0 ? (
              <p className="text-sm text-text-muted">No successful donations yet.</p>
            ) : (
              Object.entries(overview.donations.byCause).map(([cause, total]) => (
                <div key={cause} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-text-secondary">{CAUSE_LABELS[cause] ?? cause}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent-soft">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(total / maxCause) * 100}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs font-semibold text-text-primary">{formatCurrency(total)}</span>
                </div>
              ))
            )}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => handleExport("donations")}
            loading={exporting === "donations"}
          >
            <Download className="h-3.5 w-3.5" /> Export Donation Register (CSV)
          </Button>
        </Card>
      </div>
    </div>
  );
}
