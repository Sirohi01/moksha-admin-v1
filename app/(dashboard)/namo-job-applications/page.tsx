"use client";

import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { NamoJobApplication, NamoJobApplicationStatus, namoJobApplicationApi } from "@/lib/namoJobApplicationApi";
import { useAppSelector } from "@/store/hooks";

const STATUS_TONE: Record<NamoJobApplicationStatus, "pending" | "success" | "danger"> = {
  Pending: "pending", Reviewed: "success", Rejected: "danger",
};

export default function NamoJobApplicationsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<NamoJobApplication[]>([]);
  const [status, setStatus] = useState<NamoJobApplicationStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NamoJobApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (organisationCode !== "NAMOGANGE") { setLoading(false); return; }
    setLoading(true);
    namoJobApplicationApi.list(status || undefined).then(setRows).catch(() => setError("Could not load applications.")).finally(() => setLoading(false));
  }, [organisationCode, status]);

  useEffect(load, [load]);

  const handleStatusChange = async (newStatus: NamoJobApplicationStatus) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await namoJobApplicationApi.updateStatus(selected._id, newStatus);
      setSelected(updated);
      load();
    } catch {
      setError("Could not update status.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<NamoJobApplication>[] = [
    { key: "name", header: "Name", render: (a) => <div><p className="font-medium">{a.name}</p><p className="text-xs text-text-muted">{a.email || "—"}</p></div> },
    { key: "role", header: "Role Applied", render: (a) => a.role || "—" },
    { key: "phone", header: "Phone", render: (a) => a.phone || "—" },
    { key: "location", header: "Location", render: (a) => [a.city, a.state].filter(Boolean).join(", ") || a.currentLocation || "—" },
    { key: "status", header: "Status", render: (a) => <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge> },
    { key: "date", header: "Applied", render: (a) => new Date(a.createdAt).toLocaleDateString("en-IN") },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <BriefcaseBusiness className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Career Applications</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to view career-page applications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-lg font-semibold text-text-primary">Career Applications</h1><p className="text-xs text-text-muted">Submissions from the public career page.</p></div>
      <div className="max-w-xs">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as NamoJobApplicationStatus | "")}>
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(a) => a._id} loading={loading} emptyMessage="No applications found." onRowClick={setSelected} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? "Application"} size="md" footer={null}>
        {selected && (
          <div className="space-y-3 text-sm">
            <p><span className="text-text-muted">Email:</span> {selected.email || "—"}</p>
            <p><span className="text-text-muted">Phone:</span> {selected.phone || "—"}</p>
            <p><span className="text-text-muted">Role Applied:</span> {selected.role || "—"}</p>
            <p><span className="text-text-muted">Current Location:</span> {selected.currentLocation || "—"}</p>
            <p><span className="text-text-muted">City/State:</span> {[selected.city, selected.state].filter(Boolean).join(", ") || "—"}</p>
            {selected.message && <p><span className="text-text-muted">Message:</span> {selected.message}</p>}
            <div className="pt-2">
              <Select label="Status" value={selected.status} disabled={saving} onChange={(e) => handleStatusChange(e.target.value as NamoJobApplicationStatus)}>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
