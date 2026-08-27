"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { getFieldError } from "@/lib/formErrors";
import { Job, JobInput, JobStatus, jobApi } from "@/lib/jobApi";
import { useAppSelector } from "@/store/hooks";

const EMPTY: JobInput = {
  title: "", slug: "", department: "", location: "", employmentType: "Full time",
  summary: "", description: "", requirements: [], experienceText: "", salaryText: "",
  applicationUrl: "", applicationEmail: "", status: "DRAFT", closesAt: "",
};

export default function JobsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [status, setStatus] = useState<JobStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<JobInput>(EMPTY);
  const [requirementsText, setRequirementsText] = useState("");
  const filteredApi = useMemo(() => ({ ...jobApi, list: () => jobApi.list(status || undefined) }), [status]);
  const { rows, loading, saving, error, setError, fieldErrors, save, remove } = useCrudResource(
    filteredApi,
    { save: "Could not save job.", remove: "Could not delete job." },
  );

  const openCreate = () => {
    setEditingId(null); setForm(EMPTY); setRequirementsText(""); setError(""); setModalOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditingId(job._id);
    setForm({
      title: job.title, slug: job.slug, department: job.department ?? "", location: job.location,
      employmentType: job.employmentType, summary: job.summary, description: job.description,
      requirements: job.requirements, experienceText: job.experienceText ?? "", salaryText: job.salaryText ?? "",
      applicationUrl: job.applicationUrl ?? "",
      applicationEmail: job.applicationEmail ?? "", status: job.status,
      closesAt: job.closesAt?.slice(0, 10) ?? "",
    });
    setRequirementsText(job.requirements.join("\n")); setError(""); setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form, requirements: requirementsText.split("\n").map((item) => item.trim()).filter(Boolean) };
    if (await save(editingId, payload, payload)) setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm("Delete this job permanently?")) return;
    if (await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<Job>[] = [
    { key: "title", header: "Role", render: (job) => <div><p className="font-medium">{job.title}</p><p className="text-xs text-text-muted">{job.department || "General"}</p></div> },
    { key: "location", header: "Location", render: (job) => job.location },
    { key: "type", header: "Type", render: (job) => job.employmentType },
    { key: "closing", header: "Closes", render: (job) => job.closesAt ? new Date(job.closesAt).toLocaleDateString("en-IN") : "Open ended" },
    { key: "status", header: "Status", render: (job) => <Badge tone={job.status === "PUBLISHED" ? "success" : job.status === "DRAFT" ? "pending" : "neutral"}>{job.status}</Badge> },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-text-muted" /><h1 className="mt-3 font-semibold">Namo Gange Jobs</h1><p className="mt-1 text-sm text-text-muted">Select Namo Gange from the organisation switcher to manage jobs.</p></div>;
  }

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="text-lg font-semibold">Jobs</h1><p className="text-xs text-text-muted">Publish and manage Namo Gange career opportunities.</p></div><Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Job</Button></div>
    <div className="max-w-xs"><Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as JobStatus | "")}><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option></Select></div>
    <Table columns={columns} rows={rows} rowKey={(job) => job._id} loading={loading} emptyMessage="No jobs found." onRowClick={openEdit} />
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Job" : "New Job"} size="lg" footer={<><Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>{editingId && <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>}<Button size="sm" loading={saving} onClick={handleSave}>Save</Button></>}>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2"><Input required label="Job title" error={getFieldError(fieldErrors, "title")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Input required label="Slug" error={getFieldError(fieldErrors, "slug")} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} /></div>
        <div className="grid gap-3 sm:grid-cols-3"><Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /><Input required label="Location" error={getFieldError(fieldErrors, "location")} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /><Input required label="Employment type" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} /></div>
        <Textarea required label="Summary" rows={2} error={getFieldError(fieldErrors, "summary")} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <Textarea required label="Description" rows={6} error={getFieldError(fieldErrors, "description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Textarea label="Requirements" hint="One requirement per line" rows={4} value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2"><Input label="Experience" hint="Shown on the public career page, e.g. '2-4 years'" value={form.experienceText} onChange={(e) => setForm({ ...form, experienceText: e.target.value })} /><Input label="Salary" hint="Shown on the public career page, e.g. '₹3-5 LPA'" value={form.salaryText} onChange={(e) => setForm({ ...form, salaryText: e.target.value })} /></div>
        <div className="grid gap-3 sm:grid-cols-2"><Input label="Application email" type="email" error={getFieldError(fieldErrors, "applicationEmail")} value={form.applicationEmail} onChange={(e) => setForm({ ...form, applicationEmail: e.target.value })} /><Input label="Application URL" type="url" error={getFieldError(fieldErrors, "applicationUrl")} value={form.applicationUrl} onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })} /></div>
        <div className="grid gap-3 sm:grid-cols-2"><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option></Select><Input label="Closing date" type="date" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} /></div>
        {error && fieldErrors.length === 0 && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    </Modal>
  </div>;
}
