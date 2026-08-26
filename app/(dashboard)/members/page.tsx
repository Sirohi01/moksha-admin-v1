"use client";

import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { ApiRequestError } from "@/lib/api";
import { Member, MemberStatus, memberApi } from "@/lib/memberApi";
import { useAppSelector } from "@/store/hooks";

const tone = (status: MemberStatus) => status === "ACTIVE" ? "success" : status === "PENDING" ? "pending" : status === "REJECTED" ? "danger" : "neutral";

export default function MembersPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<Member[]>([]);
  const [filter, setFilter] = useState<MemberStatus | "">("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (organisationCode !== "NAMOGANGE") { setLoading(false); return; }
    setLoading(true);
    memberApi.list(filter || undefined).then(setRows).catch((e) => setError(e instanceof ApiRequestError ? e.message : "Could not load members." )).finally(() => setLoading(false));
  }, [filter, organisationCode]);

  const openMember = async (member: Member) => {
    setError("");
    try { setSelected(await memberApi.get(member._id)); }
    catch (e) { setError(e instanceof ApiRequestError ? e.message : "Could not load member details."); }
  };

  const updateStatus = async (status: MemberStatus) => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const updated = await memberApi.update(selected._id, { status });
      setSelected(updated); setRows((current) => current.map((row) => row._id === updated._id ? updated : row));
    } catch (e) { setError(e instanceof ApiRequestError ? e.message : "Could not update member."); }
    finally { setSaving(false); }
  };

  const columns: Column<Member>[] = [
    { key: "name", header: "Member", render: (member) => <div><p className="font-medium">{member.applicantName} {member.surname}</p><p className="text-xs text-text-muted">{member.occupation || member.designation || "—"}</p></div> },
    { key: "location", header: "Location", render: (member) => [member.city, member.state].filter(Boolean).join(", ") || "—" },
    { key: "joined", header: "Applied", render: (member) => new Date(member.createdAt).toLocaleDateString("en-IN") },
    { key: "status", header: "Status", render: (member) => <Badge tone={tone(member.status)}>{member.status}</Badge> },
  ];

  if (organisationCode !== "NAMOGANGE") return <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center"><UsersRound className="mx-auto h-8 w-8 text-text-muted" /><h1 className="mt-3 font-semibold">Namo Gange Members</h1><p className="mt-1 text-sm text-text-muted">Select Namo Gange to review membership applications.</p></div>;

  return <div className="space-y-4">
    <div><h1 className="text-lg font-semibold">Members</h1><p className="text-xs text-text-muted">Review and manage Namo Gange membership applications.</p></div>
    <div className="max-w-xs"><Select label="Status" value={filter} onChange={(e) => setFilter(e.target.value as MemberStatus | "")}><option value="">All statuses</option><option value="PENDING">Pending</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="REJECTED">Rejected</option></Select></div>
    {error && !selected && <p className="text-xs font-medium text-red-600">{error}</p>}
    <Table columns={columns} rows={rows} rowKey={(member) => member._id} loading={loading} emptyMessage="No members found." onRowClick={openMember} />
    <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.applicantName} ${selected.surname ?? ""}` : "Member"} size="lg" footer={<><Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button><Button size="sm" loading={saving} onClick={() => updateStatus("ACTIVE")}>Approve</Button><Button variant="danger" size="sm" loading={saving} onClick={() => updateStatus("REJECTED")}>Reject</Button></>}>
      {selected && <div className="space-y-4 text-sm">
        <div className="grid gap-3 rounded-lg bg-surface-sunken p-4 sm:grid-cols-2"><p><span className="text-text-muted">Status:</span> {selected.status}</p><p><span className="text-text-muted">Aadhaar:</span> {selected.aadharMasked || "Not provided"}</p><p><span className="text-text-muted">Mobile:</span> {selected.mobile}</p><p><span className="text-text-muted">Email:</span> {selected.email}</p><p><span className="text-text-muted">Location:</span> {[selected.city, selected.state].filter(Boolean).join(", ") || "—"}</p><p><span className="text-text-muted">Occupation:</span> {selected.occupation || "—"}</p></div>
        <div><h3 className="mb-1 font-semibold">Initiatives</h3><p className="text-text-secondary">{selected.initiatives?.join(", ") || "—"}</p></div>
        <div><h3 className="mb-1 font-semibold">Volunteering interests</h3><p className="text-text-secondary">{selected.volunteeringFor?.join(", ") || "—"}</p></div>
        <div><h3 className="mb-1 font-semibold">Areas of interest</h3><p className="text-text-secondary">{selected.areaOfInterest?.join(", ") || "—"}</p></div>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>}
    </Modal>
  </div>;
}
