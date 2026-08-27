"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import { NamoEnquiry, namoEnquiryApi } from "@/lib/namoEnquiryApi";
import { useAppSelector } from "@/store/hooks";

export default function NamoEnquiriesPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<NamoEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (organisationCode !== "NAMOGANGE") { setLoading(false); return; }
    setLoading(true);
    namoEnquiryApi.list().then(setRows).catch(() => setError("Could not load enquiries.")).finally(() => setLoading(false));
  }, [organisationCode]);

  const columns: Column<NamoEnquiry>[] = [
    { key: "name", header: "Name", render: (e) => <div><p className="font-medium">{e.name}</p><p className="text-xs text-text-muted">{e.email}</p></div> },
    { key: "mobile", header: "Mobile", render: (e) => e.mobile },
    { key: "message", header: "Message", render: (e) => <span className="line-clamp-2 max-w-md text-xs text-text-muted">{e.message}</span> },
    { key: "date", header: "Received", render: (e) => new Date(e.createdAt).toLocaleDateString("en-IN") },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Contact Enquiries</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to view contact-form submissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-lg font-semibold text-text-primary">Contact Enquiries</h1><p className="text-xs text-text-muted">Submissions from the public "Contact Us" form.</p></div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(e) => e._id} loading={loading} emptyMessage="No enquiries found." />
    </div>
  );
}
