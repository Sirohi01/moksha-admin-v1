"use client";

import { useEffect, useState } from "react";
import { HeartHandshake } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { NamoDonationLead, namoDonationLeadApi } from "@/lib/namoDonationLeadApi";
import { useAppSelector } from "@/store/hooks";

export default function NamoDonationLeadsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<NamoDonationLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NamoDonationLead | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (organisationCode !== "NAMOGANGE") { setLoading(false); return; }
    setLoading(true);
    namoDonationLeadApi.list().then(setRows).catch(() => setError("Could not load donation pledges.")).finally(() => setLoading(false));
  }, [organisationCode]);

  const columns: Column<NamoDonationLead>[] = [
    { key: "name", header: "Donor", render: (d) => <div><p className="font-medium">{d.anonymous ? "Anonymous" : d.fullName}</p><p className="text-xs text-text-muted">{d.email}</p></div> },
    { key: "sewaType", header: "Sewa Type", render: (d) => d.sewaType },
    { key: "package", header: "Package", render: (d) => d.donationPackage },
    { key: "amount", header: "Amount", render: (d) => `₹${d.amount.toLocaleString("en-IN")}` },
    { key: "location", header: "Location", render: (d) => [d.city, d.state].filter(Boolean).join(", ") },
    { key: "anonymous", header: "Anonymous", render: (d) => (d.anonymous ? <Badge tone="neutral">Yes</Badge> : "—") },
    { key: "date", header: "Received", render: (d) => new Date(d.createdAt).toLocaleDateString("en-IN") },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <HeartHandshake className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Donation Pledges</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to view donation-form submissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Donation Pledges</h1>
        <p className="text-xs text-text-muted">Submissions from the public donation form — these are pledges/leads, not verified payments (Namo Gange's public site has no payment gateway integration).</p>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(d) => d._id} loading={loading} emptyMessage="No donation pledges found." onRowClick={setSelected} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.anonymous ? "Anonymous Pledge" : selected?.fullName ?? "Donation Pledge"} size="md" footer={null}>
        {selected && (
          <div className="space-y-2 text-sm">
            <p><span className="text-text-muted">Email:</span> {selected.email}</p>
            <p><span className="text-text-muted">Phone:</span> {selected.phone}</p>
            {selected.gender && <p><span className="text-text-muted">Gender:</span> {selected.gender}</p>}
            <p><span className="text-text-muted">Location:</span> {[selected.city, selected.state, selected.country].filter(Boolean).join(", ") || "—"}</p>
            <p><span className="text-text-muted">Address:</span> {selected.address || "—"}</p>
            <p><span className="text-text-muted">Sewa Type:</span> {selected.sewaType}</p>
            <p><span className="text-text-muted">Package:</span> {selected.donationPackage}</p>
            <p><span className="text-text-muted">Amount:</span> ₹{selected.amount.toLocaleString("en-IN")}</p>
            {selected.pan && <p><span className="text-text-muted">PAN:</span> {selected.pan}</p>}
            <p><span className="text-text-muted">Anonymous:</span> {selected.anonymous ? "Yes" : "No"}</p>
            {selected.message && <p><span className="text-text-muted">Message:</span> {selected.message}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
