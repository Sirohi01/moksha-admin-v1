"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Sparkles,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { seoAuditApi, type SeoPageDetail as PageDetail, type SeoRecommendationResponse } from "@/lib/seoAuditApi";
import {
  HttpStatusBadge,
  ScorePill,
  SeverityBadge,
  StatusChip,
  formatDateTime,
  formatMs,
  formatNumber,
} from "./SeoBadges";

const SECTIONS = [
  "Overview",
  "Search",
  "Metadata",
  "Headings",
  "Links",
  "Images",
  "Schema",
  "Performance",
  "Issues",
  "AI fixes",
  "History",
] as const;

type Section = (typeof SECTIONS)[number];

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-surface-border/60 py-1.5 text-[12px] last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className={`break-words text-text-primary ${mono ? "font-mono text-[11px]" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card p-3">
      <h4 className="mb-2 text-[13px] font-semibold text-text-primary">{title}</h4>
      {note && <p className="mb-2 text-[11px] text-text-muted">{note}</p>}
      {children}
    </div>
  );
}

export default function SeoPageDetail({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("Overview");
  const [aiState, setAiState] = useState<SeoRecommendationResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await seoAuditApi.page(pageId);
      setDetail(response);
      setAiState(response.recommendation ? { status: "ok", message: null, recommendation: response.recommendation } : null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this page");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  const generateAi = async (force: boolean) => {
    setAiLoading(true);
    try {
      setAiState(await seoAuditApi.generatePageRecommendation(pageId, force));
    } catch (caught) {
      setAiState({
        status: "error",
        message: caught instanceof Error ? caught.message : "AI request failed",
        recommendation: null,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const page = detail?.page;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-[860px] flex-col bg-surface-page shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-surface-border bg-surface-card px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {page && <ScorePill score={page.score} />}
              <h3 className="truncate text-[15px] font-semibold text-text-primary">
                {page?.title ?? page?.path ?? "Page"}
              </h3>
            </div>
            {page && (
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 truncate text-[11px] text-text-muted hover:text-accent"
              >
                {page.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-surface-border bg-surface-card px-3">
          {SECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={`whitespace-nowrap border-b-2 px-2.5 py-2 text-[12px] font-medium transition-colors ${
                section === item
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-status-danger-text/30 bg-status-danger-bg px-3 py-2 text-[12px] text-status-danger-text">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}

          {detail && page && (
            <div className="flex flex-col gap-3">
              {section === "Overview" && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SectionCard title="Crawl result">
                      <Row label="HTTP status" value={<HttpStatusBadge status={page.httpStatus} />} />
                      <Row
                        label="Indexable"
                        value={
                          page.indexable ? "Yes" : `No — ${page.indexabilityReason ?? "not indexable"}`
                        }
                      />
                      <Row label="Content type" value={page.contentType} />
                      <Row label="Response time" value={formatMs(page.responseTimeMs)} />
                      <Row label="Crawled at" value={formatDateTime(page.lastCrawledAt)} />
                      <Row label="In sitemap" value={page.inSitemap ? "Yes" : "No"} />
                      {page.redirected && <Row label="Final URL" value={page.finalUrl} mono />}
                      {page.fetchError && <Row label="Fetch error" value={page.fetchError} />}
                    </SectionCard>

                    <SectionCard title="Structure">
                      <Row label="Word count" value={formatNumber(page.wordCount)} />
                      <Row label="Crawl depth" value={page.depth ?? "Not reachable from home"} />
                      <Row
                        label="Internal links in"
                        value={page.isOrphan ? `${page.inLinks} — orphan page` : page.inLinks}
                      />
                      <Row label="Internal links out" value={page.outLinks} />
                      <Row label="Broken links" value={page.brokenLinks} />
                      <Row label="Language" value={page.lang} />
                    </SectionCard>
                  </div>

                  <SectionCard
                    title="Score breakdown"
                    note="Each open issue subtracts a fixed penalty by severity. Categories with no data are not scored."
                  >
                    {page.scoreBreakdown.length === 0 ? (
                      <p className="text-[12px] text-text-secondary">No penalties — this page has no open issues.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {page.scoreBreakdown.map((entry) => (
                          <div
                            key={entry.category}
                            className="flex items-center gap-2 rounded-lg border border-surface-border px-2.5 py-1.5"
                          >
                            <span className="text-[11px] capitalize text-text-secondary">{entry.category}</span>
                            <ScorePill score={entry.score} />
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </>
              )}

              {section === "Search" && (
                <SectionCard
                  title="Google Search Console"
                  note={detail.search.metric}
                >
                  {!detail.search.available || !detail.search.totals ? (
                    <p className="text-[12px] text-text-secondary">No Search Console data yet.</p>
                  ) : (
                    <>
                      <div className="mb-3 grid grid-cols-4 gap-2">
                        {[
                          { label: "Clicks", value: formatNumber(detail.search.totals.clicks) },
                          { label: "Impressions", value: formatNumber(detail.search.totals.impressions) },
                          { label: "CTR", value: `${detail.search.totals.ctr.toFixed(1)}%` },
                          { label: "Avg position", value: detail.search.totals.position.toFixed(1) },
                        ].map((item) => (
                          <div key={item.label} className="rounded-lg bg-surface-sunken px-2.5 py-2">
                            <span className="block text-[10px] uppercase tracking-wide text-text-muted">
                              {item.label}
                            </span>
                            <span className="text-[15px] font-semibold tabular-nums text-text-primary">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mb-1.5 text-[11px] text-text-muted">
                        {detail.search.rangeStart} to {detail.search.rangeEnd}
                      </p>
                      {detail.search.topQueries.length === 0 ? (
                        <p className="text-[12px] text-text-secondary">No queries recorded for this URL.</p>
                      ) : (
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="border-b border-surface-border text-text-secondary">
                              <th className="py-1 text-left font-medium">Query</th>
                              <th className="py-1 text-right font-medium">Clicks</th>
                              <th className="py-1 text-right font-medium">Impr.</th>
                              <th className="py-1 text-right font-medium">Avg pos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.search.topQueries.map((query) => (
                              <tr key={query.query} className="border-b border-surface-border/50">
                                <td className="py-1 pr-2 text-text-primary">{query.query}</td>
                                <td className="py-1 text-right tabular-nums">{query.clicks}</td>
                                <td className="py-1 text-right tabular-nums">{query.impressions}</td>
                                <td className="py-1 text-right tabular-nums">{query.position.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}
                </SectionCard>
              )}

              {section === "Metadata" && (
                <>
                  <SectionCard title="Title & description">
                    <Row
                      label="Title"
                      value={
                        <span>
                          {page.title ?? "Missing"}{" "}
                          <StatusChip value={page.titleStatus} title={`${page.titleLength} characters`} />
                        </span>
                      }
                    />
                    <Row
                      label="Description"
                      value={
                        <span>
                          {page.metaDescription ?? "Missing"}{" "}
                          <StatusChip
                            value={page.descriptionStatus}
                            title={`${page.metaDescriptionLength} characters`}
                          />
                        </span>
                      }
                    />
                    <Row label="Meta robots" value={page.metaRobots ?? "Not set (defaults to index,follow)"} />
                    <Row label="Viewport" value={page.viewport} />
                  </SectionCard>

                  <SectionCard title="Canonical">
                    <Row label="Declared" value={page.canonical} mono />
                    <Row label="Resolves to" value={page.canonicalNormalized} mono />
                    <Row label="Status" value={<StatusChip value={page.canonicalStatus} />} />
                    <Row label="Tags found" value={page.canonicalCount} />
                  </SectionCard>

                  <SectionCard title="Social">
                    <Row label="og:title" value={page.ogTitle} />
                    <Row label="og:description" value={page.ogDescription} />
                    <Row label="og:image" value={page.ogImage} mono />
                    <Row label="twitter:card" value={page.twitterCard} />
                  </SectionCard>
                </>
              )}

              {section === "Headings" && (
                <SectionCard
                  title="Heading structure"
                  note="Hierarchy is checked for missing/multiple H1, skipped levels, empty and duplicated headings."
                >
                  <div className="mb-2 flex flex-wrap gap-2">
                    {Object.entries(page.headingCounts).map(([tag, count]) => (
                      <span key={tag} className="rounded bg-surface-sunken px-2 py-0.5 text-[11px] text-text-secondary">
                        {tag.toUpperCase()}: {count}
                      </span>
                    ))}
                    <StatusChip value={page.h1Status} />
                  </div>

                  {page.headingIssues.length > 0 && (
                    <ul className="mb-2 list-inside list-disc text-[12px] text-status-pending-text">
                      {page.headingIssues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  )}

                  <div className="max-h-[320px] overflow-y-auto rounded border border-surface-border">
                    {page.headingSequence.length === 0 ? (
                      <p className="p-2 text-[12px] text-text-secondary">No headings found.</p>
                    ) : (
                      page.headingSequence.map((heading, index) => (
                        <div
                          key={`${index}-${heading.text}`}
                          className="flex gap-2 border-b border-surface-border/50 px-2 py-1 text-[12px] last:border-0"
                          style={{ paddingLeft: `${8 + (heading.level - 1) * 14}px` }}
                        >
                          <span className="shrink-0 font-mono text-[10px] text-text-muted">H{heading.level}</span>
                          <span className={heading.text ? "text-text-primary" : "italic text-status-danger-text"}>
                            {heading.text || "(empty heading)"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>
              )}

              {section === "Links" && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SectionCard title="Summary">
                      <Row label="Internal links" value={page.internalLinkCount} />
                      <Row label="External links" value={page.externalLinkCount} />
                      <Row label="Nofollow" value={page.nofollowLinkCount} />
                      <Row label="Broken outgoing" value={detail.links.brokenOutgoing} />
                      <Row label="Redirecting outgoing" value={detail.links.redirectingOutgoing} />
                      <Row label="Mixed content" value={page.mixedContentLinkCount} />
                    </SectionCard>

                    <SectionCard title={`Incoming internal links (${detail.links.incoming.length})`}>
                      <div className="max-h-[220px] overflow-y-auto">
                        {detail.links.incoming.length === 0 ? (
                          <p className="text-[12px] text-status-danger-text">
                            Orphan page — nothing on the site links here.
                          </p>
                        ) : (
                          detail.links.incoming.map((link, index) => (
                            <div key={`${link.source}-${index}`} className="border-b border-surface-border/50 py-1 text-[11px] last:border-0">
                              <span className="block truncate font-mono text-text-primary">{link.source}</span>
                              {link.anchorText && (
                                <span className="text-text-muted">&ldquo;{link.anchorText}&rdquo;</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </SectionCard>
                  </div>

                  <SectionCard title={`Outgoing links (${detail.links.outgoing.length})`}>
                    <div className="max-h-[320px] overflow-y-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-surface-border text-text-secondary">
                            <th className="py-1 text-left font-medium">Target</th>
                            <th className="py-1 text-left font-medium">Anchor</th>
                            <th className="py-1 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.links.outgoing.map((link, index) => (
                            <tr key={`${link.normalizedTarget}-${index}`} className="border-b border-surface-border/40">
                              <td className="max-w-[320px] truncate py-1 pr-2 font-mono" title={link.target}>
                                {link.target}
                              </td>
                              <td className="max-w-[140px] truncate py-1 pr-2 text-text-muted">{link.anchorText}</td>
                              <td className="py-1">
                                <HttpStatusBadge status={link.httpStatus} />
                                {link.redirectHops > 0 && (
                                  <span className="ml-1 text-text-muted">{link.redirectHops} hop</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>

                  {detail.redirectChain && (
                    <SectionCard title="Redirect chain">
                      <div className="flex flex-col gap-1 text-[11px]">
                        {detail.redirectChain.hops.map((hop, index) => (
                          <div key={`${hop.url}-${index}`} className="flex items-center gap-2">
                            <Link2 className="h-3 w-3 text-text-muted" />
                            <span className="truncate font-mono">{hop.url}</span>
                            <HttpStatusBadge status={hop.status} />
                          </div>
                        ))}
                      </div>
                      {detail.redirectChain.issues.length > 0 && (
                        <p className="mt-2 text-[11px] text-status-pending-text">
                          {detail.redirectChain.issues.join("; ")}
                        </p>
                      )}
                    </SectionCard>
                  )}
                </>
              )}

              {section === "Images" && (
                <SectionCard title={`Images (${page.imageCount})`}>
                  <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded bg-surface-sunken px-2 py-0.5">Total: {page.imageCount}</span>
                    <span
                      className={`rounded px-2 py-0.5 ${page.imagesMissingAlt > 0 ? "bg-status-danger-bg text-status-danger-text" : "bg-surface-sunken"}`}
                    >
                      Missing alt: {page.imagesMissingAlt}
                    </span>
                    <span className="rounded bg-surface-sunken px-2 py-0.5">Decorative: {page.imagesEmptyAlt}</span>
                    <span className="rounded bg-surface-sunken px-2 py-0.5">Lazy: {page.imagesLazyLoaded}</span>
                    <span
                      className={`rounded px-2 py-0.5 ${page.imagesWithoutDimensions > 0 ? "bg-status-pending-bg text-status-pending-text" : "bg-surface-sunken"}`}
                    >
                      No dimensions: {page.imagesWithoutDimensions}
                    </span>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {page.images.map((image, index) => (
                      <div
                        key={`${image.src}-${index}`}
                        className="flex items-start gap-2 border-b border-surface-border/50 py-1.5 text-[11px] last:border-0"
                      >
                        <ImageIcon className="mt-0.5 h-3 w-3 shrink-0 text-text-muted" />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-text-primary" title={image.src}>
                            {image.src}
                          </span>
                          <span className={image.hasAlt ? "text-text-muted" : "text-status-danger-text"}>
                            {image.hasAlt
                              ? `alt: ${image.alt}`
                              : image.isDecorative
                                ? "decorative (empty alt)"
                                : "missing alt"}
                            {image.width && image.height ? ` · ${image.width}×${image.height}` : " · no dimensions"}
                            {image.loading ? ` · ${image.loading}` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {section === "Schema" && (
                <SectionCard title="Structured data">
                  {page.schemas.length === 0 ? (
                    <p className="text-[12px] text-text-secondary">No JSON-LD structured data found on this page.</p>
                  ) : (
                    page.schemas.map((block, index) => (
                      <div key={index} className="mb-2 rounded border border-surface-border p-2 last:mb-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[12px] font-medium text-text-primary">
                            {block.types.join(", ") || "Unknown type"}
                          </span>
                          <StatusChip value={block.valid ? "valid" : "invalid"} />
                        </div>
                        {block.errors.map((issue) => (
                          <p key={issue} className="text-[11px] text-status-danger-text">
                            {issue}
                          </p>
                        ))}
                        {block.warnings.map((issue) => (
                          <p key={issue} className="text-[11px] text-text-muted">
                            {issue}
                          </p>
                        ))}
                      </div>
                    ))
                  )}
                  {page.breadcrumbIssues.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[12px] font-medium text-text-primary">Breadcrumb problems</span>
                      {page.breadcrumbIssues.map((issue) => (
                        <p key={issue} className="text-[11px] text-status-danger-text">
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </SectionCard>
              )}

              {section === "Performance" && (
                <>
                  {detail.performance.audits.length === 0 ? (
                    <SectionCard title="Performance">
                      <p className="text-[12px] text-text-secondary">
                        No PageSpeed Insights audit has been run for this URL. Audits run for a configurable set of
                        important pages, not every URL.
                      </p>
                    </SectionCard>
                  ) : (
                    detail.performance.audits.map((audit) => (
                      <SectionCard key={audit.id} title={`Lighthouse — ${audit.strategy}`}>
                        {audit.status === "error" ? (
                          <p className="text-[12px] text-status-danger-text">{audit.error}</p>
                        ) : (
                          <>
                            <div className="mb-3 grid grid-cols-4 gap-2">
                              {[
                                { label: "Performance", value: audit.lab.performance },
                                { label: "Accessibility", value: audit.lab.accessibility },
                                { label: "Best practices", value: audit.lab.bestPractices },
                                { label: "SEO", value: audit.lab.seo },
                              ].map((item) => (
                                <div key={item.label} className="flex flex-col items-center gap-1 rounded-lg bg-surface-sunken py-2">
                                  <ScorePill score={item.value} />
                                  <span className="text-[10px] text-text-muted">{item.label}</span>
                                </div>
                              ))}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <h5 className="mb-1 text-[12px] font-semibold text-text-primary">Lab data</h5>
                                <p className="mb-1 text-[10px] text-text-muted">{detail.performance.labNote}</p>
                                <Row label="LCP" value={formatMs(audit.lab.lcpMs)} />
                                <Row label="CLS" value={audit.lab.clsScore?.toFixed(3) ?? "—"} />
                                <Row label="TBT" value={formatMs(audit.lab.tbtMs)} />
                                <Row label="FCP" value={formatMs(audit.lab.fcpMs)} />
                                <Row label="Speed Index" value={formatMs(audit.lab.speedIndexMs)} />
                              </div>
                              <div>
                                <h5 className="mb-1 text-[12px] font-semibold text-text-primary">
                                  Field data (real users)
                                </h5>
                                <p className="mb-1 text-[10px] text-text-muted">{detail.performance.fieldNote}</p>
                                {audit.field.available ? (
                                  <>
                                    <Row label="Source" value={audit.field.source === "url" ? "This URL" : "Origin"} />
                                    <Row label="LCP" value={formatMs(audit.field.lcpMs as number | null)} />
                                    <Row
                                      label="CLS"
                                      value={
                                        audit.field.clsScore == null
                                          ? "—"
                                          : (audit.field.clsScore as number).toFixed(3)
                                      }
                                    />
                                    <Row label="INP" value={formatMs(audit.field.inpMs as number | null)} />
                                  </>
                                ) : (
                                  <p className="text-[12px] text-text-secondary">
                                    Not available — Google has no Chrome UX Report sample for this URL.
                                  </p>
                                )}
                              </div>
                            </div>

                            {audit.opportunities.length > 0 && (
                              <div className="mt-3">
                                <h5 className="mb-1 text-[12px] font-semibold text-text-primary">Opportunities</h5>
                                {audit.opportunities.map((opportunity) => (
                                  <div key={opportunity.id} className="flex justify-between border-b border-surface-border/50 py-1 text-[11px] last:border-0">
                                    <span className="text-text-primary">{opportunity.title}</span>
                                    <span className="tabular-nums text-text-muted">{formatMs(opportunity.savingsMs)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="mt-2 text-[10px] text-text-muted">
                              Measured {formatDateTime(audit.fetchedAt)}
                              {audit.lighthouseVersion ? ` · Lighthouse ${audit.lighthouseVersion}` : ""}
                            </p>
                          </>
                        )}
                      </SectionCard>
                    ))
                  )}
                </>
              )}

              {section === "Issues" && (
                <SectionCard title={`Detected issues (${detail.issues.length})`} note="Every issue below was detected by the rules engine from crawled facts.">
                  {detail.issues.length === 0 ? (
                    <p className="text-[12px] text-text-secondary">No open issues on this page.</p>
                  ) : (
                    detail.issues.map((issue) => (
                      <div key={issue.id} className="border-b border-surface-border/60 py-2 last:border-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={issue.severity} />
                          <span className="text-[12px] font-medium text-text-primary">{issue.title}</span>
                          <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                            {issue.ruleId}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary">{issue.detail}</p>
                        <p className="mt-0.5 text-[10px] text-text-muted">
                          First seen {formatDateTime(issue.firstSeenAt)}
                        </p>
                      </div>
                    ))
                  )}
                </SectionCard>
              )}

              {section === "AI fixes" && (
                <SectionCard
                  title="AI recommendations"
                  note="Gemini receives only the measured facts above. It explains and drafts fixes — it never supplies metrics."
                >
                  <div className="mb-3 flex gap-2">
                    <Button size="sm" onClick={() => void generateAi(false)} loading={aiLoading}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate
                    </Button>
                    {aiState?.recommendation && (
                      <Button variant="secondary" size="sm" onClick={() => void generateAi(true)} loading={aiLoading}>
                        Regenerate
                      </Button>
                    )}
                  </div>

                  {aiState?.message && (
                    <p className="mb-2 rounded border border-surface-border bg-surface-sunken px-2.5 py-2 text-[12px] text-text-secondary">
                      {aiState.message}
                    </p>
                  )}

                  {aiState?.recommendation?.summary && (
                    <p className="mb-3 text-[12px] text-text-primary">{aiState.recommendation.summary}</p>
                  )}

                  {aiState?.recommendation?.items.map((item, index) => (
                    <div key={index} className="mb-2 rounded border border-surface-border p-2.5 last:mb-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-semibold text-text-primary">{item.title}</span>
                        <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase text-text-secondary">
                          {item.priority}
                        </span>
                        {item.ruleId && (
                          <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                            {item.ruleId}
                          </span>
                        )}
                      </div>
                      <p className="mb-1 text-[11px] text-text-secondary">{item.whyItMatters}</p>
                      <p className="mb-1 text-[11px] text-text-primary">{item.recommendedFix}</p>
                      {item.implementation && (
                        <pre className="mb-1 overflow-x-auto whitespace-pre-wrap rounded bg-surface-sunken p-2 text-[10px] text-text-secondary">
                          {item.implementation}
                        </pre>
                      )}
                      {item.suggestedTitle && <Row label="Suggested title" value={item.suggestedTitle} />}
                      {item.suggestedDescription && (
                        <Row label="Suggested description" value={item.suggestedDescription} />
                      )}
                      {item.headingSuggestions.length > 0 && (
                        <Row label="Headings" value={item.headingSuggestions.join(" · ")} />
                      )}
                      {item.internalLinkSuggestions.length > 0 && (
                        <Row
                          label="Internal links"
                          value={item.internalLinkSuggestions
                            .map((link) => `${link.anchorText} → ${link.fromOrTo}`)
                            .join(" · ")}
                        />
                      )}
                    </div>
                  ))}

                  {aiState?.recommendation && (
                    <p className="mt-2 text-[10px] text-text-muted">
                      {aiState.recommendation.model} · generated {formatDateTime(aiState.recommendation.generatedAt)}
                    </p>
                  )}
                </SectionCard>
              )}

              {section === "History" && (
                <SectionCard title="Audit history" note="One row per completed audit that included this URL.">
                  {detail.history.length === 0 ? (
                    <p className="text-[12px] text-text-secondary">No historical snapshots yet.</p>
                  ) : (
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-surface-border text-text-secondary">
                          <th className="py-1 text-left font-medium">Date</th>
                          <th className="py-1 text-right font-medium">Score</th>
                          <th className="py-1 text-right font-medium">Issues</th>
                          <th className="py-1 text-right font-medium">Words</th>
                          <th className="py-1 text-right font-medium">Clicks</th>
                          <th className="py-1 text-right font-medium">Avg pos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.history.map((entry) => (
                          <tr key={entry.capturedAt} className="border-b border-surface-border/50">
                            <td className="py-1">{formatDateTime(entry.capturedAt)}</td>
                            <td className="py-1 text-right tabular-nums">{entry.score ?? "—"}</td>
                            <td className="py-1 text-right tabular-nums">{entry.issueCounts.total}</td>
                            <td className="py-1 text-right tabular-nums">{entry.wordCount}</td>
                            <td className="py-1 text-right tabular-nums">{entry.clicks ?? "—"}</td>
                            <td className="py-1 text-right tabular-nums">
                              {entry.position ? entry.position.toFixed(1) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </SectionCard>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
