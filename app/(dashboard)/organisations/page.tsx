"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { getFieldError } from "@/lib/formErrors";
import {
  Organisation,
  OrganisationInput,
  OrganisationUpdateInput,
  OrganisationStatus,
  organisationApi,
} from "@/lib/organisationApi";

const EMPTY_FORM: OrganisationInput = {
  code: "",
  name: "",
  slug: "",
  status: "ACTIVE",
  legalDetails: {},
  contactDetails: {},
};

export default function OrganisationsPage() {
  const [status, setStatus] = useState<OrganisationStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OrganisationInput>(EMPTY_FORM);
  const filteredApi = useMemo(() => ({
    ...organisationApi,
    list: () => organisationApi.list(status || undefined),
  }), [status]);
  const { rows: organisations, loading, saving, error, setError, fieldErrors, save } = useCrudResource(
    filteredApi,
    { save: "Could not save organisation." },
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (organisation: Organisation) => {
    setEditingId(organisation._id);
    setForm({
      code: organisation.code,
      name: organisation.name,
      slug: organisation.slug,
      status: organisation.status,
      legalDetails: { ...organisation.legalDetails },
      contactDetails: { ...organisation.contactDetails },
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const update: OrganisationUpdateInput = {
      name: form.name,
      slug: form.slug,
      status: form.status,
      legalDetails: form.legalDetails,
      contactDetails: form.contactDetails,
    };
    if (await save(editingId, form, update)) {
      setModalOpen(false);
    }
  };

  const columns: Column<Organisation>[] = [
    { key: "code", header: "Code", render: (organisation) => <span className="font-medium">{organisation.code}</span> },
    { key: "name", header: "Organisation", render: (organisation) => organisation.name },
    { key: "slug", header: "Slug", render: (organisation) => organisation.slug },
    { key: "email", header: "Email", render: (organisation) => organisation.contactDetails?.email || "—" },
    {
      key: "status",
      header: "Status",
      render: (organisation) => (
        <Badge tone={organisation.status === "ACTIVE" ? "success" : "neutral"}>{organisation.status}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Organisations</h1>
          <p className="text-xs text-text-muted">Manage organisations and their legal and contact details.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Organisation</Button>
      </div>

      <div className="max-w-48">
        <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as OrganisationStatus | "")}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      <Table columns={columns} rows={organisations} rowKey={(organisation) => organisation._id} loading={loading} emptyMessage="No organisations found." onRowClick={openEdit} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Organisation" : "New Organisation"} size="lg" footer={<><Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button><Button size="sm" onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Code" required error={getFieldError(fieldErrors, "code")} disabled={Boolean(editingId)} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            <Input label="Name" required error={getFieldError(fieldErrors, "name")} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input label="Slug" required error={getFieldError(fieldErrors, "slug")} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
            <Select label="Status" error={getFieldError(fieldErrors, "status")} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as OrganisationStatus })}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></Select>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Legal details</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Registered Name" error={getFieldError(fieldErrors, "legalDetails.registeredName")} value={form.legalDetails.registeredName ?? ""} onChange={(event) => setForm({ ...form, legalDetails: { ...form.legalDetails, registeredName: event.target.value } })} />
              <Input label="PAN Number" error={getFieldError(fieldErrors, "legalDetails.panNumber")} value={form.legalDetails.panNumber ?? ""} onChange={(event) => setForm({ ...form, legalDetails: { ...form.legalDetails, panNumber: event.target.value } })} />
              <Input label="Registration Number" error={getFieldError(fieldErrors, "legalDetails.registrationNumber")} value={form.legalDetails.registrationNumber ?? ""} onChange={(event) => setForm({ ...form, legalDetails: { ...form.legalDetails, registrationNumber: event.target.value } })} />
              <Input label="Registered Address" error={getFieldError(fieldErrors, "legalDetails.registeredAddress")} value={form.legalDetails.registeredAddress ?? ""} onChange={(event) => setForm({ ...form, legalDetails: { ...form.legalDetails, registeredAddress: event.target.value } })} />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Contact details</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Email" type="email" error={getFieldError(fieldErrors, "contactDetails.email")} value={form.contactDetails.email ?? ""} onChange={(event) => setForm({ ...form, contactDetails: { ...form.contactDetails, email: event.target.value } })} />
              <Input label="Phone" error={getFieldError(fieldErrors, "contactDetails.phone")} value={form.contactDetails.phone ?? ""} onChange={(event) => setForm({ ...form, contactDetails: { ...form.contactDetails, phone: event.target.value } })} />
              <div className="sm:col-span-2"><Input label="Address" error={getFieldError(fieldErrors, "contactDetails.address")} value={form.contactDetails.address ?? ""} onChange={(event) => setForm({ ...form, contactDetails: { ...form.contactDetails, address: event.target.value } })} /></div>
            </div>
          </div>
          {error && fieldErrors.length === 0 && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
