"use client";

import { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { NamoAgsCollege, NamoAgsCollegeInput, namoAgsCollegeApi } from "@/lib/namoAgsCollegeApi";
import { useAppSelector } from "@/store/hooks";

const EMPTY: NamoAgsCollegeInput = {
  collegeName: "", category: "", website: "", address: "", country: "", state: "", city: "",
  pincode: "", affilatedTo: "", status: "Active", contacts: [],
};

export default function NamoAgsCollegesPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource(namoAgsCollegeApi, {
    save: "Could not save college.", remove: "Could not delete college.",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NamoAgsCollegeInput>(EMPTY);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setError(""); setModalOpen(true); };
  const openEdit = (college: NamoAgsCollege) => {
    setEditingId(college._id);
    setForm({ ...college });
    setError("");
    setModalOpen(true);
  };
  const handleSave = async () => { if (await save(editingId, form, form)) setModalOpen(false); };
  const handleDelete = async () => { if (editingId && window.confirm("Delete this college?") && await remove(editingId)) setModalOpen(false); };

  const columns: Column<NamoAgsCollege>[] = [
    { key: "name", header: "College", render: (c) => <div><p className="font-medium">{c.collegeName}</p><p className="text-xs text-text-muted">{c.category || "—"}</p></div> },
    { key: "location", header: "Location", render: (c) => [c.city, c.state].filter(Boolean).join(", ") || "—" },
    { key: "contacts", header: "Contacts", render: (c) => `${c.contacts.length} contact(s)` },
    { key: "status", header: "Status", render: (c) => <Badge tone={c.status === "Active" ? "success" : "neutral"}>{c.status}</Badge> },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <Building2 className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">AGS Institution Directory</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to manage the AGS college/institution directory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold">AGS Institution Directory</h1><p className="text-xs text-text-muted">Colleges/institutions AGS outreach coordinates with.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New College</Button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(c) => c._id} loading={loading} emptyMessage="No colleges found." onRowClick={openEdit} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit College" : "New College"} size="lg"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          {editingId && <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>}
          <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
        </>}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="College Name" required value={form.collegeName} onChange={(e) => setForm({ ...form, collegeName: e.target.value })} />
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <Input label="Affiliated To" value={form.affilatedTo} onChange={(e) => setForm({ ...form, affilatedTo: e.target.value })} />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
          {form.contacts.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Contacts</label>
              <div className="space-y-1 rounded-lg border border-surface-border p-2 text-xs">
                {form.contacts.map((c, i) => (
                  <p key={i}>{c.contactPerson || "—"} · {c.designation || "—"} · {c.email || "—"} · {c.mobile || "—"}</p>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
