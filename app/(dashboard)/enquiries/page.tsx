"use client";

import { useEffect, useState } from "react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { enquiriesApi } from "@/lib/enquiriesApi";
import { Enquiry, EnquiryStatus } from "@/lib/types";
import { ENQUIRY_STATUS_META, formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const TABS: { key: EnquiryStatus | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "closed", label: "Closed" },
];

const SOURCE_TABS = [
  { key: "", label: "All Sources" },
  { key: "contact", label: "Contact" },
  { key: "csr", label: "CSR" },
  { key: "partnership", label: "Partnership" },
  { key: "unclaimed_body", label: "Unclaimed Body" },
] as const;

const SOURCE_LABELS: Record<Enquiry["category"], string> = {
  contact: "Contact",
  csr: "CSR",
  partnership: "Partnership",
  unclaimed_body: "Unclaimed Body",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<EnquiryStatus | "">("");
  const [source, setSource] = useState<Enquiry["category"] | "">("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    enquiriesApi
      .list()
      .then(setEnquiries)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = enquiries.filter((e) => (!tab || e.status === tab) && (!source || (e.category ?? "contact") === source));

  const handleStatusChange = async (id: string, status: EnquiryStatus) => {
    setBusy(true);
    setError("");
    try {
      const updated = await enquiriesApi.updateStatus(id, status);
      setEnquiries((prev) => prev.map((e) => (e._id === id ? updated : e)));
      setSelected((prev) => (prev && prev._id === id ? updated : prev));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update this enquiry.");
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Enquiry>[] = [
    { key: "category", header: "Source", render: (e) => <Badge tone="neutral">{SOURCE_LABELS[e.category ?? "contact"]}</Badge> },
    { key: "name", header: "Name", render: (e) => <span className="font-medium">{e.name}</span> },
    { key: "phone", header: "Phone", render: (e) => e.phone },
    { key: "email", header: "Email", render: (e) => e.email ?? "—" },
    { key: "message", header: "Message", render: (e) => <span className="line-clamp-1 max-w-xs">{e.message}</span> },
    {
      key: "status",
      header: "Status",
      render: (e) => <Badge tone={ENQUIRY_STATUS_META[e.status].tone}>{ENQUIRY_STATUS_META[e.status].label}</Badge>,
    },
    { key: "createdAt", header: "Received", render: (e) => formatDateTime(e.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Enquiries</h1>
        <p className="text-xs text-text-muted">Contact, CSR, partnership and unclaimed-body requests submitted through the website.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</div>}

      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.key ? "bg-accent text-white" : "bg-surface-card text-text-secondary hover:bg-surface-sunken"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SOURCE_TABS.map((item) => (
          <button key={item.key} onClick={() => setSource(item.key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${source === item.key ? "bg-slate-700 text-white" : "bg-surface-card text-text-secondary hover:bg-surface-sunken"}`}>
            {item.label}
          </button>
        ))}
      </div>

      <Table columns={columns} rows={visible} rowKey={(e) => e._id} loading={loading} emptyMessage="No enquiries yet." onRowClick={setSelected} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? "Enquiry"}>
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold uppercase tracking-wide text-text-muted">Source</p>
                <p className="text-text-primary">{SOURCE_LABELS[selected.category ?? "contact"]}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-text-muted">Phone</p>
                <p className="text-text-primary">{selected.phone}</p>
              </div>
              {selected.email && (
                <div>
                  <p className="font-semibold uppercase tracking-wide text-text-muted">Email</p>
                  <p className="text-text-primary">{selected.email}</p>
                </div>
              )}
            </div>
            {(selected.organization || selected.designation || selected.interest || selected.city || selected.authority || selected.reference) && (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface-sunken p-3 text-xs">
                {selected.organization && <div><p className="font-semibold uppercase tracking-wide text-text-muted">Organisation</p><p>{selected.organization}</p></div>}
                {selected.designation && <div><p className="font-semibold uppercase tracking-wide text-text-muted">Designation</p><p>{selected.designation}</p></div>}
                {selected.interest && <div><p className="font-semibold uppercase tracking-wide text-text-muted">Interest</p><p>{selected.interest}</p></div>}
                {selected.city && <div><p className="font-semibold uppercase tracking-wide text-text-muted">City / Area</p><p>{selected.city}</p></div>}
                {selected.authority && <div><p className="font-semibold uppercase tracking-wide text-text-muted">Hospital / Authority</p><p>{selected.authority}</p></div>}
                {selected.reference && <div><p className="font-semibold uppercase tracking-wide text-text-muted">Case Reference</p><p>{selected.reference}</p></div>}
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Message</p>
              <p className="text-text-primary">{selected.message}</p>
            </div>
            {selected.documentUrl && <a href={selected.documentUrl} target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold text-accent hover:underline">View supporting document</a>}
            <Select
              label="Status"
              value={selected.status}
              disabled={busy}
              onChange={(e) => handleStatusChange(selected._id, e.target.value as EnquiryStatus)}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
}
