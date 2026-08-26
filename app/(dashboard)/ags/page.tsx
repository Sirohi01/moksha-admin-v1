"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { ApiRequestError } from "@/lib/api";
import {
  AgsClientStatus,
  AgsDelegate,
  AgsDelegateInput,
  AgsDelegateStatus,
  agsDelegateApi,
} from "@/lib/agsDelegateApi";
import { useAppSelector } from "@/store/hooks";

const CLIENT_STATUS_LABEL: Record<AgsClientStatus, string> = {
  NEW: "New",
  WARM: "Warm",
  HOT: "Hot",
  REGISTERED: "Registered",
  PAYMENT_REFUNDED: "Payment Refunded",
  NOT_INTERESTED: "Not Interested",
};

const CLIENT_STATUS_TONE: Record<AgsClientStatus, "neutral" | "progress" | "danger" | "success" | "pending"> = {
  NEW: "neutral",
  WARM: "pending",
  HOT: "progress",
  REGISTERED: "success",
  PAYMENT_REFUNDED: "danger",
  NOT_INTERESTED: "danger",
};

const EMPTY_FORM: AgsDelegateInput = {
  title: "",
  firstName: "",
  lastName: "",
  profession: "",
  event: "",
  mobile: "",
  email: "",
  city: "",
  state: "",
  category: "",
  coordinator: "",
  remark: "",
  status: "ACTIVE",
  clientStatus: "NEW",
};

export default function AgsDelegatesPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<AgsDelegate[]>([]);
  const [clientStatusFilter, setClientStatusFilter] = useState<AgsClientStatus | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgsDelegateInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (organisationCode !== "NAMOGANGE") {
      setLoading(false);
      return;
    }
    setLoading(true);
    agsDelegateApi
      .list({ clientStatus: clientStatusFilter || undefined, search: search || undefined })
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [organisationCode, clientStatusFilter, search]);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (delegate: AgsDelegate) => {
    setEditingId(delegate._id);
    setForm({
      title: delegate.title ?? "",
      firstName: delegate.firstName,
      lastName: delegate.lastName ?? "",
      profession: delegate.profession ?? "",
      event: delegate.event ?? "",
      mobile: delegate.mobile,
      email: delegate.email ?? "",
      city: delegate.city ?? "",
      state: delegate.state ?? "",
      category: delegate.category ?? "",
      coordinator: delegate.coordinator ?? "",
      remark: delegate.remark ?? "",
      status: delegate.status,
      clientStatus: delegate.clientStatus,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) await agsDelegateApi.update(editingId, form);
      else await agsDelegateApi.create(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save delegate.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<AgsDelegate>[] = [
    {
      key: "name",
      header: "Delegate",
      render: (d) => (
        <div>
          <p className="font-medium">{[d.title, d.firstName, d.lastName].filter(Boolean).join(" ")}</p>
          <p className="text-xs text-text-muted">{d.mobile}</p>
        </div>
      ),
    },
    { key: "company", header: "Organisation / Profession", render: (d) => d.companyName || d.profession || "—" },
    { key: "coordinator", header: "Coordinator", render: (d) => d.coordinator || "—" },
    { key: "event", header: "Event", render: (d) => d.event || "—" },
    {
      key: "clientStatus",
      header: "Status",
      render: (d) => <Badge tone={CLIENT_STATUS_TONE[d.clientStatus]}>{CLIENT_STATUS_LABEL[d.clientStatus]}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (d) => (
        <Link href={`/ags/${d._id}`} className="text-xs font-medium text-brand-600 hover:underline" onClick={(e) => e.stopPropagation()}>
          View / Payments
        </Link>
      ),
    },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <Users2 className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">AGS Delegates</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to manage AGS delegates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">AGS Delegates</h1>
          <p className="text-xs text-text-muted">Coordinator-managed lead list for the Arogya/Global health seminar programme.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> New Delegate
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Status" value={clientStatusFilter} onChange={(e) => setClientStatusFilter(e.target.value as AgsClientStatus | "")}>
          <option value="">All statuses</option>
          {Object.entries(CLIENT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Input label="Search" placeholder="Name, company, coordinator, event" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(d) => d._id} loading={loading} emptyMessage="No delegates found." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Delegate" : "New Delegate"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Title" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" value={form.lastName ?? ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Mobile" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <Input label="Email" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Profession" value={form.profession ?? ""} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
            <Input label="Event" value={form.event ?? ""} onChange={(e) => setForm({ ...form, event: e.target.value })} />
            <Input label="Category" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="City" value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="State" value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Coordinator" value={form.coordinator ?? ""} onChange={(e) => setForm({ ...form, coordinator: e.target.value })} />
            <Select label="Client Status" value={form.clientStatus} onChange={(e) => setForm({ ...form, clientStatus: e.target.value as AgsClientStatus })}>
              {Object.entries(CLIENT_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>
          <Select label="Record Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AgsDelegateStatus })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Remark</label>
            <textarea
              className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm"
              rows={3}
              value={form.remark ?? ""}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
            />
          </div>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
