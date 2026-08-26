"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { ArogyaCoupon, ArogyaCouponApplicableTo, ArogyaCouponInput, ArogyaCouponStatus, arogyaCouponApi } from "@/lib/arogyaCouponApi";
import { useAppSelector } from "@/store/hooks";

const EMPTY: ArogyaCouponInput = { code: "", discountPercent: 10, applicableTo: "both", usageLimit: 1, status: "available" };

export default function ArogyaCouponsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource(arogyaCouponApi, {
    save: "Could not save coupon.", remove: "Could not delete coupon.",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArogyaCouponInput>(EMPTY);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setError(""); setModalOpen(true); };
  const openEdit = (coupon: ArogyaCoupon) => {
    setEditingId(coupon._id);
    setForm({ code: coupon.code, discountPercent: coupon.discountPercent, applicableTo: coupon.applicableTo, usageLimit: coupon.usageLimit, status: coupon.status });
    setError("");
    setModalOpen(true);
  };
  const handleSave = async () => {
    // The backend ignores `code` on update (updateArogyaCouponSchema omits it — a coupon's code
    // is immutable once created), so it's safe to send the full form either way.
    if (await save(editingId, form, form)) setModalOpen(false);
  };
  const handleDelete = async () => {
    if (editingId && window.confirm("Delete this coupon?") && await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<ArogyaCoupon>[] = [
    { key: "code", header: "Code", render: (c) => <span className="font-mono font-medium">{c.code}</span> },
    { key: "discount", header: "Discount", render: (c) => `${c.discountPercent}%` },
    { key: "applicableTo", header: "Applies To", render: (c) => c.applicableTo },
    { key: "usage", header: "Usage", render: (c) => `${c.usedCount} / ${c.usageLimit}` },
    { key: "status", header: "Status", render: (c) => <Badge tone={c.status === "available" ? "success" : c.status === "used" ? "neutral" : "danger"}>{c.status}</Badge> },
  ];

  if (organisationCode !== "AROGYA") {
    return <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center"><h1 className="font-semibold">Coupons</h1><p className="mt-1 text-sm text-text-muted">Select Arogya to manage coupons.</p></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold">Coupons</h1><p className="text-xs text-text-muted">Discount codes for delegate registration — the discount is always recomputed server-side at checkout, never trusted from the client.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Coupon</Button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(c) => c._id} loading={loading} emptyMessage="No coupons found." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Coupon" : "New Coupon"} size="lg"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          {editingId && <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>}
          <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
        </>}
      >
        <div className="space-y-3">
          <Input label="Code" required disabled={Boolean(editingId)} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Discount %" type="number" min={1} max={100} required value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} />
            <Input label="Usage Limit" type="number" min={1} required value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select label="Applies To" value={form.applicableTo} onChange={(e) => setForm({ ...form, applicableTo: e.target.value as ArogyaCouponApplicableTo })}>
              <option value="both">Both</option><option value="single">Single</option><option value="group">Group</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ArogyaCouponStatus })}>
              <option value="available">Available</option><option value="used">Used</option><option value="inactive">Inactive</option>
            </Select>
          </div>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
