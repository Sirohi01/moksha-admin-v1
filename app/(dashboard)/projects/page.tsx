"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { Organisation, organisationApi } from "@/lib/organisationApi";
import { Project, ProjectInput, ProjectStatus, projectApi } from "@/lib/projectApi";
import { getFieldError } from "@/lib/formErrors";

const EMPTY_FORM: ProjectInput = {
  organisationId: "",
  programCode: "",
  code: "",
  name: "",
  editionLabel: "",
  status: "ACTIVE",
  description: "",
  startDate: "",
  endDate: "",
};

const toDateInput = (value?: string) => value ? value.slice(0, 10) : "";
const organisationIdOf = (project: Project) => typeof project.organisationId === "string" ? project.organisationId : project.organisationId._id;

export default function ProjectsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [organisationFilter, setOrganisationFilter] = useState("");
  const [programCodeFilter, setProgramCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM);
  const filteredApi = useMemo(() => ({
    ...projectApi,
    list: () => projectApi.list({ organisationId: organisationFilter || undefined, programCode: programCodeFilter || undefined, status: statusFilter || undefined }),
  }), [organisationFilter, programCodeFilter, statusFilter]);
  const { rows: projects, loading, saving, error, setError, fieldErrors, save } = useCrudResource(
    filteredApi,
    { save: "Could not save project." },
  );
  useEffect(() => { organisationApi.list().then(setOrganisations).catch(() => {}); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, organisationId: organisations[0]?._id ?? "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project._id);
    setForm({
      organisationId: organisationIdOf(project),
      programCode: project.programCode,
      code: project.code,
      name: project.name,
      editionLabel: project.editionLabel ?? "",
      status: project.status,
      description: project.description ?? "",
      startDate: toDateInput(project.startDate),
      endDate: toDateInput(project.endDate),
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const update = {
      organisationId: form.organisationId,
      name: form.name,
      editionLabel: form.editionLabel,
      status: form.status,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
    };
    if (await save(editingId, form, update)) {
      setModalOpen(false);
    }
  };

  const organisationName = (project: Project) => {
    if (typeof project.organisationId !== "string") return project.organisationId.name;
    return organisations.find((organisation) => organisation._id === project.organisationId)?.name ?? "—";
  };

  const columns: Column<Project>[] = [
    { key: "code", header: "Code", render: (project) => <span className="font-medium">{project.code}</span> },
    { key: "name", header: "Project", render: (project) => project.name },
    { key: "organisation", header: "Organisation", render: organisationName },
    { key: "programCode", header: "Program", render: (project) => project.programCode },
    { key: "edition", header: "Edition", render: (project) => project.editionLabel || "—" },
    { key: "status", header: "Status", render: (project) => <Badge tone={project.status === "ACTIVE" ? "success" : project.status === "ARCHIVED" ? "neutral" : "pending"}>{project.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-text-primary">Projects</h1><p className="text-xs text-text-muted">Manage organisation projects and program editions.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Project</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Organisation" value={organisationFilter} onChange={(event) => setOrganisationFilter(event.target.value)}><option value="">All organisations</option>{organisations.map((organisation) => <option key={organisation._id} value={organisation._id}>{organisation.name}</option>)}</Select>
        <Input label="Program Code" value={programCodeFilter} onChange={(event) => setProgramCodeFilter(event.target.value)} placeholder="Filter by program code" />
        <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProjectStatus | "")}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ARCHIVED">Archived</option></Select>
      </div>

      <Table columns={columns} rows={projects} rowKey={(project) => project._id} loading={loading} emptyMessage="No projects found." onRowClick={openEdit} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Project" : "New Project"} size="lg" footer={<><Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button><Button size="sm" onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-3">
          <Select label="Organisation" required error={getFieldError(fieldErrors, "organisationId")} value={form.organisationId} onChange={(event) => setForm({ ...form, organisationId: event.target.value })}><option value="" disabled>Select an organisation</option>{organisations.map((organisation) => <option key={organisation._id} value={organisation._id}>{organisation.name}</option>)}</Select>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Program Code" required error={getFieldError(fieldErrors, "programCode")} disabled={Boolean(editingId)} value={form.programCode} onChange={(event) => setForm({ ...form, programCode: event.target.value })} />
            <Input label="Code" required error={getFieldError(fieldErrors, "code")} disabled={Boolean(editingId)} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            <Input label="Name" required error={getFieldError(fieldErrors, "name")} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input label="Edition Label" error={getFieldError(fieldErrors, "editionLabel")} value={form.editionLabel ?? ""} onChange={(event) => setForm({ ...form, editionLabel: event.target.value })} />
          </div>
          <Select label="Status" error={getFieldError(fieldErrors, "status")} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ARCHIVED">Archived</option></Select>
          <Textarea label="Description" error={getFieldError(fieldErrors, "description")} rows={3} value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Start Date" type="date" error={getFieldError(fieldErrors, "startDate")} value={form.startDate ?? ""} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            <Input label="End Date" type="date" error={getFieldError(fieldErrors, "endDate")} value={form.endDate ?? ""} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </div>
          {error && fieldErrors.length === 0 && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
