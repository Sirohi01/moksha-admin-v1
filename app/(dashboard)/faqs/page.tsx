"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { faqsApi } from "@/lib/resources";
import { Faq } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";

type FaqForm = Pick<Faq, "question" | "answer" | "order" | "isActive"> & Partial<Pick<Faq, "category">>;
const EMPTY_FORM: FaqForm = { question: "", answer: "", category: "", order: 0, isActive: true };

export default function FaqsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(EMPTY_FORM);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource<Faq, Partial<Faq>>(
    faqsApi,
    { save: "Could not save FAQ.", remove: "Could not delete FAQ." },
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditingId(faq._id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category ?? "", order: faq.order, isActive: faq.isActive });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (await save(editingId, { ...form, category: form.category || undefined })) setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm("Delete this FAQ?")) return;
    if (await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<Faq>[] = [
    { key: "order", header: "Order", render: (faq) => faq.order },
    { key: "question", header: "Question", render: (faq) => <span className="font-medium">{faq.question}</span> },
    { key: "category", header: "Category", render: (faq) => faq.category ?? "—" },
    { key: "status", header: "Status", render: (faq) => <Badge tone={faq.isActive ? "success" : "neutral"}>{faq.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "createdAt", header: "Created", render: (faq) => formatDate(faq.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-text-primary">FAQs</h1><p className="text-xs text-text-muted">Manage frequently asked questions published on the website.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New FAQ</Button>
      </div>
      <Table columns={columns} rows={rows} rowKey={(faq) => faq._id} loading={loading} emptyMessage="No FAQs yet." onRowClick={openEdit} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit FAQ" : "New FAQ"} footer={<>{editingId && <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete</Button>}<div className="flex-1" /><Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button><Button size="sm" onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-3">
          <Input label="Question" required value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} />
          <Textarea label="Answer" required rows={5} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Category" value={form.category ?? ""} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            <Input label="Display Order" type="number" value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} />
          </div>
          <Select label="Status" value={form.isActive ? "active" : "inactive"} onChange={(event) => setForm({ ...form, isActive: event.target.value === "active" })}><option value="active">Active</option><option value="inactive">Inactive</option></Select>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
