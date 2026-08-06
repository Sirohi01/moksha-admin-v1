"use client";

import { useEffect, useState } from "react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { volunteersApi } from "@/lib/volunteersApi";
import { VolunteerSummary, VolunteerStatus } from "@/lib/types";
import { VOLUNTEER_STATUS_META, formatDate, formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const TABS: { key: VolunteerStatus | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "INACTIVE", label: "Inactive" },
  { key: "BLACKLISTED", label: "Blacklisted" },
];

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<VolunteerStatus | "">("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<VolunteerSummary | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await volunteersApi.list(tab ? { status: tab } : undefined);
      setVolunteers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleStatusChange = async (id: string, status: VolunteerStatus) => {
    setBusyId(id);
    setError("");
    try {
      await volunteersApi.updateStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update volunteer status.");
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<VolunteerSummary>[] = [
    { key: "name", header: "Volunteer", render: (v) => `${v.name ?? "—"} · ${v.phone ?? "—"}` },
    { key: "city", header: "City", render: (v) => v.city },
    { key: "skills", header: "Skills", render: (v) => (v.skills.length ? v.skills.join(", ") : "—") },
    {
      key: "availability",
      header: "Availability",
      render: (v) => <span className="text-xs text-text-secondary">{v.availability.replace(/_/g, " ")}</span>,
    },
    { key: "totalAssignments", header: "Assignments", align: "center", render: (v) => v.totalAssignments },
    {
      key: "status",
      header: "Status",
      render: (v) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Badge tone={VOLUNTEER_STATUS_META[v.status].tone}>{VOLUNTEER_STATUS_META[v.status].label}</Badge>
          <Select
            value={v.status}
            disabled={busyId === v._id}
            onChange={(e) => handleStatusChange(v._id, e.target.value as VolunteerStatus)}
            className="w-32 !py-1 text-[11px]"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLACKLISTED">Blacklisted</option>
          </Select>
        </div>
      ),
    },
    { key: "createdAt", header: "Joined", render: (v) => formatDateTime(v.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Volunteers</h1>
        <p className="text-xs text-text-muted">Volunteer directory — availability and case history.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</div>
      )}

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
        rows={volunteers}
        rowKey={(v) => v._id}
        loading={loading}
        emptyMessage="No volunteers yet."
        onRowClick={setSelected}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? "Volunteer"} size="lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <Field label="Phone" value={selected.phone} />
              <Field label="Email" value={selected.email} />
              <Field label="City" value={selected.city} />
              <Field label="Date of Birth" value={selected.dateOfBirth ? formatDate(selected.dateOfBirth) : undefined} />
              <Field label="Gender" value={selected.gender} />
              <Field label="Blood Group" value={selected.bloodGroup} />
              <Field label="State" value={selected.state} />
              <Field label="Pincode" value={selected.pincode} />
              <Field label="Schedule Preference" value={selected.schedulePreference} />
              <Field label="Preferred Role" value={selected.preferredRole} />
              <Field label="Total Assignments" value={String(selected.totalAssignments)} />
              <Field label="Joined" value={formatDateTime(selected.createdAt)} />
            </div>
            {selected.address && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Address</p>
                <p className="text-text-primary">{selected.address}</p>
              </div>
            )}
            {selected.skills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Skills</p>
                <p className="text-text-primary">{selected.skills.join(", ")}</p>
              </div>
            )}
            {selected.motivation && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Why they want to volunteer</p>
                <p className="text-text-secondary">{selected.motivation}</p>
              </div>
            )}
            {selected.experience && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Skills / Experience</p>
                <p className="text-text-secondary">{selected.experience}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-text-primary">{value}</p>
    </div>
  );
}
