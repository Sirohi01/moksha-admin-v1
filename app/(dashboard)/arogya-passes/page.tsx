"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { ArogyaPass, ArogyaPassApplicableTo, ArogyaPassInput, arogyaPassApi } from "@/lib/arogyaPassApi";
import { useAppSelector } from "@/store/hooks";

const EMPTY: ArogyaPassInput = {
  name: "", price: 0, daysText: "1 Day", applicableTo: "both", includes: [], isMostPopular: false, status: "active", order: 0,
};

export default function ArogyaPassesPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource(arogyaPassApi, {
    save: "Could not save pass.", remove: "Could not delete pass.",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArogyaPassInput>(EMPTY);
  const [includesText, setIncludesText] = useState("");

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setIncludesText(""); setError(""); setModalOpen(true); };
  const openEdit = (pass: ArogyaPass) => {
    setEditingId(pass._id);
    setForm({ ...pass });
    setIncludesText(pass.includes.join("\n"));
    setError("");
    setModalOpen(true);
  };
  const handleSave = async () => {
    const includes = includesText.split("\n").map((line) => line.trim()).filter(Boolean);
    const payload = { ...form, includes };
    if (await save(editingId, payload, payload)) setModalOpen(false);
  };
  const handleDelete = async () => {
    if (editingId && window.confirm("Delete this pass?") && await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<ArogyaPass>[] = [
    { key: "name", header: "Pass", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "price", header: "Price", render: (p) => `₹${p.price.toLocaleString("en-IN")}` },
    { key: "days", header: "Duration", render: (p) => p.daysText },
    { key: "applicableTo", header: "Applies To", render: (p) => p.applicableTo },
    { key: "popular", header: "Popular", render: (p) => (p.isMostPopular ? <Badge tone="success">Most Popular</Badge> : "—") },
    { key: "status", header: "Status", render: (p) => <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status}</Badge> },
  ];

  if (organisationCode !== "AROGYA") {
    return <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center"><h1 className="font-semibold">Delegate Passes</h1><p className="mt-1 text-sm text-text-muted">Select Arogya to manage delegate passes.</p></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold">Delegate Passes</h1><p className="text-xs text-text-muted">Pass types and pricing offered on the registration form.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Pass</Button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(p) => p._id} loading={loading} emptyMessage="No passes found." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Pass" : "New Pass"} size="lg"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          {editingId && <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>}
          <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
        </>}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Price (₹)" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Duration text" value={form.daysText} onChange={(e) => setForm({ ...form, daysText: e.target.value })} />
            <Select label="Applies To" value={form.applicableTo} onChange={(e) => setForm({ ...form, applicableTo: e.target.value as ArogyaPassApplicableTo })}>
              <option value="both">Both</option><option value="single">Single</option><option value="group">Group</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Includes (one per line)</label>
            <textarea className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm" rows={4} value={includesText} onChange={(e) => setIncludesText(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </Select>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={form.isMostPopular} onChange={(e) => setForm({ ...form, isMostPopular: e.target.checked })} />
              Mark as Most Popular
            </label>
          </div>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
