"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { ArogyaCategory, ArogyaCategoryInput, ArogyaCategoryType, arogyaCategoryApi } from "@/lib/arogyaCategoryApi";
import { useAppSelector } from "@/store/hooks";

const EMPTY: ArogyaCategoryInput = { name: "", type: "both" };

export default function ArogyaCategoriesPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource(arogyaCategoryApi, {
    save: "Could not save category.", remove: "Could not delete category.",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArogyaCategoryInput>(EMPTY);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setError(""); setModalOpen(true); };
  const openEdit = (category: ArogyaCategory) => {
    setEditingId(category._id);
    setForm({ name: category.name, type: category.type });
    setError("");
    setModalOpen(true);
  };
  const handleSave = async () => { if (await save(editingId, form, form)) setModalOpen(false); };
  const handleDelete = async () => {
    if (editingId && window.confirm("Delete this category?") && await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<ArogyaCategory>[] = [
    { key: "name", header: "Name", render: (c) => c.name },
    { key: "type", header: "Registration Type", render: (c) => <Badge tone="neutral">{c.type}</Badge> },
  ];

  if (organisationCode !== "AROGYA") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <Tags className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Delegate Category</h1>
        <p className="mt-1 text-sm text-text-muted">Select Arogya to manage delegate categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Delegate Category</h1>
          <p className="text-xs text-text-muted">Industry/interest category options offered on the delegate registration form.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Category</Button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(c) => c._id} loading={loading} emptyMessage="No categories found." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "New Category"} size="sm"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          {editingId && <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>}
          <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
        </>}
      >
        <div className="space-y-3">
          <Select label="Registration Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ArogyaCategoryType })}>
            <option value="both">Both</option>
            <option value="single">Single</option>
            <option value="group">Group</option>
          </Select>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
