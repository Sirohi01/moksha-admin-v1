"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { requestsApi } from "@/lib/requestsApi";
import { AssistanceRequest, CasePriority } from "@/lib/types";
import { REQUEST_STATUS_META, formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const TABS: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "CONVERTED", label: "Converted" },
  { key: "REJECTED", label: "Rejected" },
];

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  const [selected, setSelected] = useState<AssistanceRequest | null>(null);
  const [priority, setPriority] = useState<CasePriority>("NORMAL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (status?: string) => {
    setLoading(true);
    try {
      const data = await requestsApi.list(status || undefined);
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleConvert = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const kase = await requestsApi.convertToCase(selected._id, priority);
      setSelected(null);
      router.push(`/cases/${kase._id}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not convert this request.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await requestsApi.reject(selected._id);
      setSelected(null);
      load(tab);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not reject this request.");
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<AssistanceRequest>[] = [
    { key: "requestNo", header: "Request No", render: (r) => <span className="font-medium">{r.requestNo}</span> },
    {
      key: "type",
      header: "Type",
      render: (r) =>
        r.type === "EMERGENCY" ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
            <AlertTriangle className="h-3 w-3" />
            Emergency
          </span>
        ) : (
          <span className="text-xs text-text-muted">Normal</span>
        ),
    },
    {
      key: "requester",
      header: "Requester",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          {r.requester.name} · {r.requester.phone}
          {r.duplicateOfRequestId && (
            <span title={r.duplicateNote}>
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            </span>
          )}
        </span>
      ),
    },
    { key: "city", header: "City", render: (r) => r.location.city },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge tone={REQUEST_STATUS_META[r.status].tone}>{REQUEST_STATUS_META[r.status].label}</Badge>,
    },
    { key: "createdAt", header: "Received", render: (r) => formatDateTime(r.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Assistance Requests</h1>
        <p className="text-xs text-text-muted">Public intake queue — verify and convert into a Case.</p>
      </div>

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

      <Table
        columns={columns}
        rows={requests}
        rowKey={(r) => r._id}
        loading={loading}
        emptyMessage="No requests here."
        onRowClick={(r) => {
          setSelected(r);
          setPriority("NORMAL");
          setError("");
        }}
      />

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.requestNo ?? ""}
        footer={
          selected?.status === "SUBMITTED" ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleReject} loading={busy}>
                Reject
              </Button>
              <Button size="sm" onClick={handleConvert} loading={busy}>
                Convert to Case
              </Button>
            </>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            {selected.duplicateOfRequestId && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{selected.duplicateNote ?? "Possible duplicate of a recent request."}</span>
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Requester</p>
              <p className="text-text-primary">
                {selected.requester.name} ({selected.requester.relation}) · {selected.requester.phone}
              </p>
              {selected.requester.email && <p className="text-text-secondary">{selected.requester.email}</p>}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Deceased</p>
              <p className="text-text-primary">
                {selected.deceased.name}
                {selected.deceased.age ? `, ${selected.deceased.age} yrs` : ""}
                {selected.deceased.gender ? `, ${selected.deceased.gender}` : ""}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Location</p>
              <p className="text-text-primary">
                {selected.location.address}, {selected.location.city}, {selected.location.state} -{" "}
                {selected.location.pincode}
              </p>
            </div>
            {selected.notes && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Notes</p>
                <p className="text-text-secondary">{selected.notes}</p>
              </div>
            )}

            {selected.status === "SUBMITTED" && (
              <div>
                <Select
                  label="Case Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as CasePriority)}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </Select>
              </div>
            )}

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
