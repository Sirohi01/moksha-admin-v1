"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Columns3,
  ExternalLink,
  Play,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  seoAuditApi,
  type SeoPageFilters,
  type SeoPageRow,
  type SeoSeverity,
} from "@/lib/seoAuditApi";
import {
  HttpStatusBadge,
  IssueCountCell,
  ScorePill,
  StatusChip,
  formatDateTime,
  formatMs,
  formatNumber,
} from "./SeoBadges";

interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible: boolean;
  sortKey?: string;
  align?: "left" | "right";
  render: (page: SeoPageRow) => React.ReactNode;
}

const COLUMNS: ColumnDefinition[] = [
  {
    key: "score",
    label: "SEO",
    defaultVisible: true,
    sortKey: "score",
    render: (page) => <ScorePill score={page.score} />,
  },
  {
    key: "status",
    label: "Status",
    defaultVisible: true,
    sortKey: "status",
    render: (page) => <HttpStatusBadge status={page.httpStatus} />,
  },
  {
    key: "indexable",
    label: "Indexable",
    defaultVisible: true,
    render: (page) => (
      <StatusChip
        value={page.indexable ? "ok" : "missing"}
        title={page.indexabilityReason ?? (page.indexable ? "Indexable" : "Not indexable")}
      />
    ),
  },
  {
    key: "issues",
    label: "Issues",
    defaultVisible: true,
    sortKey: "critical",
    render: (page) => <IssueCountCell counts={page.issueCounts} />,
  },
  {
    key: "title",
    label: "Title",
    defaultVisible: true,
    render: (page) => <StatusChip value={page.titleStatus} title={`${page.titleLength} chars`} />,
  },
  {
    key: "description",
    label: "Meta desc",
    defaultVisible: true,
    render: (page) => (
      <StatusChip value={page.descriptionStatus} title={`${page.metaDescriptionLength} chars`} />
    ),
  },
  {
    key: "h1",
    label: "H1",
    defaultVisible: true,
    render: (page) => <StatusChip value={page.h1Status} title={page.h1[0] ?? "No H1"} />,
  },
  {
    key: "canonical",
    label: "Canonical",
    defaultVisible: true,
    render: (page) => <StatusChip value={page.canonicalStatus} title={page.canonical ?? "None"} />,
  },
  {
    key: "schema",
    label: "Schema",
    defaultVisible: false,
    render: (page) => <StatusChip value={page.schemaStatus} title={page.schemaTypes.join(", ") || "None"} />,
  },
  {
    key: "words",
    label: "Words",
    defaultVisible: true,
    sortKey: "wordCount",
    align: "right",
    render: (page) => <span className="tabular-nums">{formatNumber(page.wordCount)}</span>,
  },
  {
    key: "inLinks",
    label: "In",
    defaultVisible: true,
    sortKey: "inLinks",
    align: "right",
    render: (page) => (
      <span className={`tabular-nums ${page.isOrphan ? "text-status-danger-text font-semibold" : ""}`}>
        {page.inLinks}
      </span>
    ),
  },
  {
    key: "outLinks",
    label: "Out",
    defaultVisible: false,
    align: "right",
    render: (page) => <span className="tabular-nums">{page.outLinks}</span>,
  },
  {
    key: "brokenLinks",
    label: "Broken",
    defaultVisible: false,
    align: "right",
    render: (page) => (
      <span className={`tabular-nums ${page.brokenLinks > 0 ? "text-status-danger-text font-semibold" : ""}`}>
        {page.brokenLinks}
      </span>
    ),
  },
  {
    key: "depth",
    label: "Depth",
    defaultVisible: false,
    sortKey: "depth",
    align: "right",
    render: (page) => <span className="tabular-nums">{page.depth ?? "—"}</span>,
  },
  {
    key: "performance",
    label: "Perf",
    defaultVisible: false,
    sortKey: "performance",
    render: (page) => <ScorePill score={page.performance.score} />,
  },
  {
    key: "lcp",
    label: "LCP",
    defaultVisible: false,
    align: "right",
    render: (page) => (
      <span className="tabular-nums" title={page.performance.isFieldData ? "Field data (CrUX)" : "Lab data (Lighthouse)"}>
        {formatMs(page.performance.lcpMs)}
      </span>
    ),
  },
  {
    key: "cls",
    label: "CLS",
    defaultVisible: false,
    align: "right",
    render: (page) => (
      <span className="tabular-nums">{page.performance.cls == null ? "—" : page.performance.cls.toFixed(3)}</span>
    ),
  },
  {
    key: "clicks",
    label: "Clicks",
    defaultVisible: true,
    sortKey: "clicks",
    align: "right",
    render: (page) => <span className="tabular-nums">{formatNumber(page.search?.clicks ?? 0)}</span>,
  },
  {
    key: "impressions",
    label: "Impr.",
    defaultVisible: true,
    sortKey: "impressions",
    align: "right",
    render: (page) => <span className="tabular-nums">{formatNumber(page.search?.impressions ?? 0)}</span>,
  },
  {
    key: "ctr",
    label: "CTR",
    defaultVisible: false,
    sortKey: "ctr",
    align: "right",
    render: (page) => <span className="tabular-nums">{page.search ? `${page.search.ctr.toFixed(1)}%` : "—"}</span>,
  },
  {
    key: "position",
    label: "Avg pos",
    defaultVisible: true,
    sortKey: "position",
    align: "right",
    render: (page) => (
      <span className="tabular-nums" title="Google Search Console average position — not a live rank">
        {page.search?.position ? page.search.position.toFixed(1) : "—"}
      </span>
    ),
  },
  {
    key: "crawledAt",
    label: "Crawled",
    defaultVisible: false,
    sortKey: "crawledAt",
    render: (page) => <span className="whitespace-nowrap text-text-secondary">{formatDateTime(page.lastCrawledAt)}</span>,
  },
];

const SEVERITY_OPTIONS: Array<{ value: SeoSeverity | ""; label: string }> = [
  { value: "", label: "Any severity" },
  { value: "critical", label: "Has critical" },
  { value: "warning", label: "Has warnings" },
  { value: "notice", label: "Has notices" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All issue types" },
  { value: "metadata", label: "Metadata" },
  { value: "indexing", label: "Indexing" },
  { value: "canonical", label: "Canonical" },
  { value: "headings", label: "Headings" },
  { value: "links", label: "Links" },
  { value: "images", label: "Images" },
  { value: "content", label: "Content" },
  { value: "structure", label: "Structure" },
  { value: "structured_data", label: "Structured data" },
  { value: "performance", label: "Performance" },
  { value: "security", label: "Security" },
];

const selectClass =
  "h-8 rounded-lg border border-surface-border bg-surface-card px-2 text-[12px] text-text-primary outline-none focus:border-accent";

interface Props {
  onSelectPage: (pageId: string) => void;
  onAuditStarted?: () => void;
  selectedPageId?: string | null;
}

export default function SeoPagesTable({ onSelectPage, onAuditStarted, selectedPageId }: Props) {
  const [rows, setRows] = useState<SeoPageRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditRunning, setAuditRunning] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<SeoPageFilters>({ page: 1, limit: 25, sortBy: "score", sortDir: "asc" });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    COLUMNS.filter((column) => column.defaultVisible).map((column) => column.key),
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await seoAuditApi.pages(filters);
      setRows(response.pages);
      setMessage(response.message);
      if (response.meta) setMeta(response.meta);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load SEO pages");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchInput || undefined, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeColumns = useMemo(
    () => COLUMNS.filter((column) => visibleColumns.includes(column.key)),
    [visibleColumns],
  );

  const updateFilter = (patch: Partial<SeoPageFilters>) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  };

  const toggleSort = (sortKey: string) => {
    setFilters((current) => ({
      ...current,
      sortBy: sortKey,
      sortDir: current.sortBy === sortKey && current.sortDir === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  const startAudit = async () => {
    setAuditRunning(true);
    try {
      await seoAuditApi.startAudit();
      onAuditStarted?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the audit");
    } finally {
      setAuditRunning(false);
    }
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    filters.indexable !== undefined ||
    Boolean(filters.severity) ||
    Boolean(filters.issueCategory) ||
    Boolean(filters.hasBrokenLinks) ||
    Boolean(filters.orphan);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search URL or title"
            className="h-8 w-full rounded-lg border border-surface-border bg-surface-card pl-8 pr-2 text-[12px] text-text-primary outline-none focus:border-accent"
          />
        </div>

        <select
          className={selectClass}
          value={filters.status ?? ""}
          onChange={(event) => updateFilter({ status: (event.target.value || undefined) as SeoPageFilters["status"] })}
        >
          <option value="">Any HTTP status</option>
          <option value="2xx">2xx OK</option>
          <option value="3xx">3xx Redirect</option>
          <option value="4xx">4xx Broken</option>
          <option value="5xx">5xx Server error</option>
          <option value="error">No response</option>
        </select>

        <select
          className={selectClass}
          value={filters.indexable === undefined ? "" : String(filters.indexable)}
          onChange={(event) =>
            updateFilter({ indexable: event.target.value === "" ? undefined : event.target.value === "true" })
          }
        >
          <option value="">Indexable & not</option>
          <option value="true">Indexable only</option>
          <option value="false">Non-indexable only</option>
        </select>

        <select
          className={selectClass}
          value={filters.severity ?? ""}
          onChange={(event) => updateFilter({ severity: (event.target.value || undefined) as SeoSeverity | undefined })}
        >
          {SEVERITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.issueCategory ?? ""}
          onChange={(event) => updateFilter({ issueCategory: event.target.value || undefined })}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => updateFilter({ hasBrokenLinks: filters.hasBrokenLinks ? undefined : true })}
          className={`h-8 rounded-lg border px-2.5 text-[12px] font-medium transition-colors ${
            filters.hasBrokenLinks
              ? "border-status-danger-text bg-status-danger-bg text-status-danger-text"
              : "border-surface-border bg-surface-card text-text-secondary hover:bg-surface-sunken"
          }`}
        >
          Broken links
        </button>

        <button
          type="button"
          onClick={() => updateFilter({ orphan: filters.orphan ? undefined : true })}
          className={`h-8 rounded-lg border px-2.5 text-[12px] font-medium transition-colors ${
            filters.orphan
              ? "border-status-pending-text bg-status-pending-bg text-status-pending-text"
              : "border-surface-border bg-surface-card text-text-secondary hover:bg-surface-sunken"
          }`}
        >
          Orphans
        </button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setFilters({ page: 1, limit: meta.limit, sortBy: "score", sortDir: "asc" });
            }}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => setShowColumnPicker((open) => !open)}>
            <Columns3 className="h-3.5 w-3.5" />
            Columns
          </Button>
          {showColumnPicker && (
            <div className="absolute right-0 z-30 mt-1 max-h-[320px] w-56 overflow-y-auto rounded-lg border border-surface-border bg-surface-card p-2 shadow-lg">
              {COLUMNS.map((column) => (
                <label
                  key={column.key}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[12px] text-text-primary hover:bg-surface-sunken"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.key)}
                    onChange={() =>
                      setVisibleColumns((current) =>
                        current.includes(column.key)
                          ? current.filter((key) => key !== column.key)
                          : [...current, column.key],
                      )
                    }
                  />
                  {column.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button size="sm" onClick={() => void startAudit()} loading={auditRunning}>
          <Play className="h-3.5 w-3.5" />
          Run audit
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-status-danger-text/30 bg-status-danger-bg px-3 py-2 text-[12px] text-status-danger-text">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-surface-border bg-surface-card">
        <table className="w-full min-w-[900px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-surface-border bg-surface-sunken">
              <th className="sticky left-0 z-10 bg-surface-sunken px-3 py-2 text-left font-semibold text-text-secondary">
                <button type="button" onClick={() => toggleSort("url")} className="hover:text-text-primary">
                  Page
                </button>
              </th>
              {activeColumns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-2 py-2 font-semibold text-text-secondary ${
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {column.sortKey ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.sortKey!)}
                      className={`hover:text-text-primary ${filters.sortBy === column.sortKey ? "text-text-primary underline" : ""}`}
                    >
                      {column.label}
                      {filters.sortBy === column.sortKey ? (filters.sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={activeColumns.length + 1} className="px-3 py-10 text-center">
                  <Spinner />
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={activeColumns.length + 1} className="px-3 py-10 text-center text-text-secondary">
                  {message ?? "No pages match these filters."}
                  {message && (
                    <div className="mt-3">
                      <Button size="sm" onClick={() => void startAudit()} loading={auditRunning}>
                        <Play className="h-3.5 w-3.5" />
                        Run the first audit
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onSelectPage(row.id)}
                className={`cursor-pointer border-b border-surface-border/60 transition-colors hover:bg-surface-sunken ${
                  selectedPageId === row.id ? "bg-accent-soft" : ""
                }`}
              >
                <td className="sticky left-0 z-10 max-w-[280px] bg-surface-card px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium text-text-primary" title={row.title ?? row.url}>
                      {row.title ?? row.path}
                    </span>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="shrink-0 text-text-muted hover:text-accent"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <span className="block truncate text-[11px] text-text-muted" title={row.url}>
                    {row.path}
                  </span>
                </td>
                {activeColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`whitespace-nowrap px-2 py-2 ${column.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta.total > 0 && (
        <div className="flex items-center justify-between text-[12px] text-text-secondary">
          <span>
            {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} pages
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => updateFilter({ page: meta.page - 1 })}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="tabular-nums">
              {meta.page} / {meta.totalPages || 1}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updateFilter({ page: meta.page + 1 })}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
