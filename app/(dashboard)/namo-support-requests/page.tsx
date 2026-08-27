"use client";

import { useEffect, useState } from "react";
import { HandHeart } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { NamoSupportRequest, namoSupportRequestApi } from "@/lib/namoSupportRequestApi";
import { useAppSelector } from "@/store/hooks";

export default function NamoSupportRequestsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<NamoSupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NamoSupportRequest | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (organisationCode !== "NAMOGANGE") { setLoading(false); return; }
    setLoading(true);
    namoSupportRequestApi.list().then(setRows).catch(() => setError("Could not load support requests.")).finally(() => setLoading(false));
  }, [organisationCode]);

  const columns: Column<NamoSupportRequest>[] = [
    { key: "name", header: "Name", render: (s) => <div><p className="font-medium">{s.name}</p><p className="text-xs text-text-muted">{s.email}</p></div> },
    { key: "type", header: "Support Type", render: (s) => s.supportType },
    { key: "location", header: "Location", render: (s) => [s.city, s.state].filter(Boolean).join(", ") },
    { key: "contribution", header: "Preferred Contribution", render: (s) => s.prefferedContribution },
    { key: "date", header: "Received", render: (s) => new Date(s.createdAt).toLocaleDateString("en-IN") },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <HandHeart className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Support Requests</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to view support-form submissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-lg font-semibold text-text-primary">Support Requests</h1><p className="text-xs text-text-muted">Submissions from the public "Support" form.</p></div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(s) => s._id} loading={loading} emptyMessage="No support requests found." onRowClick={setSelected} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? "Support Request"} size="md" footer={null}>
        {selected && (
          <div className="space-y-2 text-sm">
            <p><span className="text-text-muted">Email:</span> {selected.email}</p>
            <p><span className="text-text-muted">Mobile:</span> {selected.mobile}</p>
            <p><span className="text-text-muted">Gender:</span> {selected.gender}</p>
            <p><span className="text-text-muted">DOB:</span> {new Date(selected.dob).toLocaleDateString("en-IN")}</p>
            <p><span className="text-text-muted">Support Type:</span> {selected.supportType}</p>
            <p><span className="text-text-muted">Address:</span> {selected.fullAddress}</p>
            <p><span className="text-text-muted">Preferred Contribution:</span> {selected.prefferedContribution}</p>
            <p><span className="text-text-muted">Message:</span> {selected.message}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
