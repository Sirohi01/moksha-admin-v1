"use client";

import { useMemo, useState } from "react";
import { List, Plus, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { NAMO_LOOKUP_TYPES, NamoLookup, NamoLookupType, namoLookupApi } from "@/lib/namoLookupApi";
import { useAppSelector } from "@/store/hooks";

const TYPE_LABELS: Record<NamoLookupType, string> = {
  CATEGORY: "Category", OCCUPATION: "Occupation", DESIGNATION: "Designation", DEPARTMENT: "Department",
  PROFESSION: "Profession", UNIVERSITY: "University", DATA: "Data", OBJ_NAME: "Objective Name",
  ORGANIZATION: "Organization", SOURCE: "Source", CALL_TARGET: "Call Target", COORDINATOR_STATUS: "Coordinator Status",
  BANK: "Bank", STATUS_OPTION: "Status Option", IP: "IP",
};

export default function NamoLookupsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [type, setType] = useState<NamoLookupType>("CATEGORY");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const filteredApi = useMemo(() => ({ ...namoLookupApi, list: () => namoLookupApi.list(type) }), [type]);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource(filteredApi, {
    save: "Could not save entry.", remove: "Could not delete entry.",
  });

  const openCreate = () => { setEditingId(null); setName(""); setStatus("ACTIVE"); setError(""); setModalOpen(true); };
  const openEdit = (row: NamoLookup) => { setEditingId(row._id); setName(row.name); setStatus(row.status); setError(""); setModalOpen(true); };
  const handleSave = async () => {
    if (await save(editingId, { type, name, status }, { name, status })) setModalOpen(false);
  };
  const handleDelete = async () => {
    if (editingId && window.confirm("Delete this entry?") && await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<NamoLookup>[] = [
    { key: "name", header: "Name", render: (r) => r.name },
    { key: "status", header: "Status", render: (r) => <Badge tone={r.status === "ACTIVE" ? "success" : "neutral"}>{r.status}</Badge> },
    { key: "extra", header: "Other Fields", render: (r) => Object.keys(r.payload || {}).length > 0 ? <span className="text-xs text-text-muted">{Object.keys(r.payload).join(", ")}</span> : "—" },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <List className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Lookup / Master Data</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to manage lookup lists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold">Lookup / Master Data</h1><p className="text-xs text-text-muted">Internal dropdown lists used across Namo Gange forms — categories, occupations, designations, and similar reference data.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Entry</Button>
      </div>
      <div className="max-w-xs">
        <Select label="List" value={type} onChange={(e) => setType(e.target.value as NamoLookupType)}>
          {NAMO_LOOKUP_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </Select>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(r) => r._id} loading={loading} emptyMessage="No entries found." onRowClick={openEdit} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Entry" : `New ${TYPE_LABELS[type]}`} size="md"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          {editingId && <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>}
          <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
        </>}
      >
        <div className="space-y-3">
          <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
