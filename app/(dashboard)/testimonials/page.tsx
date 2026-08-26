"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { testimonialsApi } from "@/lib/resources";
import { Testimonial } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";

type TestimonialForm = Pick<Testimonial, "name" | "message" | "rating" | "isApproved"> & Partial<Pick<Testimonial, "photo">>;
const EMPTY_FORM: TestimonialForm = { name: "", photo: "", message: "", rating: 5, isApproved: false };

export default function TestimonialsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(EMPTY_FORM);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource<Testimonial, Partial<Testimonial>>(
    testimonialsApi,
    { save: "Could not save testimonial.", remove: "Could not delete testimonial." },
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial._id);
    setForm({ name: testimonial.name, photo: testimonial.photo ?? "", message: testimonial.message, rating: testimonial.rating, isApproved: testimonial.isApproved });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (await save(editingId, { ...form, photo: form.photo || undefined })) setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm("Delete this testimonial?")) return;
    if (await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<Testimonial>[] = [
    { key: "name", header: "Name", render: (testimonial) => <span className="font-medium">{testimonial.name}</span> },
    { key: "message", header: "Message", render: (testimonial) => <span className="block max-w-md truncate">{testimonial.message}</span> },
    { key: "rating", header: "Rating", render: (testimonial) => <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{testimonial.rating}</span> },
    { key: "status", header: "Status", render: (testimonial) => <Badge tone={testimonial.isApproved ? "success" : "pending"}>{testimonial.isApproved ? "Approved" : "Pending"}</Badge> },
    { key: "createdAt", header: "Submitted", render: (testimonial) => formatDate(testimonial.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-text-primary">Testimonials</h1><p className="text-xs text-text-muted">Review and manage supporter stories shown on the website.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Testimonial</Button>
      </div>
      <Table columns={columns} rows={rows} rowKey={(testimonial) => testimonial._id} loading={loading} emptyMessage="No testimonials yet." onRowClick={openEdit} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Testimonial" : "New Testimonial"} footer={<>{editingId && <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete</Button>}<div className="flex-1" /><Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button><Button size="sm" onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-3">
          <Input label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input label="Photo URL" value={form.photo ?? ""} onChange={(event) => setForm({ ...form, photo: event.target.value })} />
          <Textarea label="Message" required rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Rating" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}</Select>
            <Select label="Approval" value={form.isApproved ? "approved" : "pending"} onChange={(event) => setForm({ ...form, isApproved: event.target.value === "approved" })}><option value="pending">Pending</option><option value="approved">Approved</option></Select>
          </div>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
