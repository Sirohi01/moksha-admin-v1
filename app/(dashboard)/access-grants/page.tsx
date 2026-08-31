"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, ShieldX } from "lucide-react";
import { accessGrantApi, AccessGrant, CreateAccessGrantInput } from "@/lib/accessGrantApi";
import { ApiRequestError } from "@/lib/api";
import { authApi } from "@/lib/authApi";
import { organisationApi, Organisation } from "@/lib/organisationApi";
import { rolesApi } from "@/lib/rolesApi";
import { staffApi } from "@/lib/staffApi";
import { Role, StaffMember } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";

const EMPTY_FORM: CreateAccessGrantInput = {
  userId: "",
  organisationId: "",
  programCode: "",
  roleId: "",
  expiresAt: "",
};

const dateInputValue = (value?: string) => value ? value.slice(0, 10) : "";

export default function AccessGrantsPage() {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [form, setForm] = useState<CreateAccessGrantInput>(EMPTY_FORM);
  const [userSearch, setUserSearch] = useState("");
  const [editingGrant, setEditingGrant] = useState<AccessGrant | null>(null);
  const [expiry, setExpiry] = useState("");
  const [revokeGrant, setRevokeGrant] = useState<AccessGrant | null>(null);

  const loadGrants = () => {
    setLoading(true);
    accessGrantApi.list().then(setGrants).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGrants();
    Promise.all([staffApi.list(), organisationApi.list(), rolesApi.list()])
      .then(([staffRows, organisationRows, roleRows]) => {
        setStaff(staffRows);
        setOrganisations(organisationRows);
        setRoles(roleRows);
      })
      .catch(() => {});
    authApi.getMe().then((me) => setIsSuperAdmin(me.isSuperAdmin ?? false)).catch(() => setIsSuperAdmin(false));
  }, []);

  const filteredStaff = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter((member) =>
      [member.name, member.email, member.phone].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [staff, userSearch]);

  const openGrantModal = () => {
    setForm({
      ...EMPTY_FORM,
      userId: staff[0]?._id ?? "",
      organisationId: organisations[0]?._id ?? "",
      roleId: roles[0]?._id ?? "",
    });
    setUserSearch("");
    setError("");
    setGrantModalOpen(true);
  };

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      await accessGrantApi.create({
        userId: form.userId,
        organisationId: form.organisationId || null,
        programCode: form.organisationId ? form.programCode?.trim() || null : null,
        roleId: form.roleId,
        expiresAt: form.expiresAt || undefined,
      });
      setGrantModalOpen(false);
      loadGrants();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not grant access.");
    } finally {
      setSaving(false);
    }
  };

  const openExpiryModal = (grant: AccessGrant) => {
    setEditingGrant(grant);
    setExpiry(dateInputValue(grant.expiresAt));
    setError("");
  };

  const handleExpirySave = async () => {
    if (!editingGrant) return;
    setSaving(true);
    setError("");
    try {
      await accessGrantApi.updateExpiry(editingGrant._id, expiry);
      setEditingGrant(null);
      loadGrants();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update the expiry date.");
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeGrant) return;
    setSaving(true);
    setError("");
    try {
      await accessGrantApi.revoke(revokeGrant._id);
      setRevokeGrant(null);
      loadGrants();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not revoke this access grant.");
      setRevokeGrant(null);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<AccessGrant>[] = [
    {
      key: "user",
      header: "User",
      render: (grant) => (
        <span>
          <span className="block font-medium">{grant.userId.name}</span>
          <span className="block text-xs text-text-muted">{grant.userId.email ?? "—"}</span>
        </span>
      ),
    },
    { key: "organisation", header: "Organisation", render: (grant) => grant.organisationId?.name ?? "All organisations" },
    { key: "project", header: "Project / Program", render: (grant) => grant.programCode ?? "All projects" },
    { key: "role", header: "Role", render: (grant) => grant.roleId.name },
    {
      key: "status",
      header: "Status",
      render: (grant) => <Badge tone={grant.status === "ACTIVE" ? "success" : "neutral"}>{grant.status}</Badge>,
    },
    { key: "expires", header: "Expires", render: (grant) => grant.expiresAt ? formatDate(grant.expiresAt) : "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (grant) => grant.status === "ACTIVE" ? (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openExpiryModal(grant)}>
            <Pencil className="h-3 w-3" /> Edit expiry
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setError(""); setRevokeGrant(grant); }}>
            <ShieldX className="h-3 w-3" /> Revoke
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Access Grants</h1>
          <p className="text-xs text-text-muted">Manage staff access to organisations, projects, and roles.</p>
        </div>
        <Button size="sm" onClick={openGrantModal}>
          <Plus className="h-3.5 w-3.5" /> Grant Access
        </Button>
      </div>

      {error && !grantModalOpen && !editingGrant && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={grants} rowKey={(grant) => grant._id} loading={loading} emptyMessage="No access grants found." />

      <Modal
        isOpen={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        title="Grant Access"
        footer={<><Button variant="secondary" size="sm" onClick={() => setGrantModalOpen(false)}>Cancel</Button><Button size="sm" onClick={handleCreate} loading={saving}>Grant Access</Button></>}
      >
        <div className="space-y-3">
          <Input label="Find User" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search by name, email, or phone" />
          <Select label="User" required value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })}>
            <option value="" disabled>Select a staff member</option>
            {filteredStaff.map((member) => <option key={member._id} value={member._id}>{member.name} — {member.email ?? member.phone}</option>)}
          </Select>
          <Select
            label="Organisation"
            required
            value={form.organisationId ?? ""}
            onChange={(event) => setForm({ ...form, organisationId: event.target.value, programCode: event.target.value ? form.programCode : "" })}
          >
            {isSuperAdmin && <option value="">All organisations</option>}
            {!isSuperAdmin && <option value="" disabled>Select an organisation</option>}
            {organisations.map((organisation) => <option key={organisation._id} value={organisation._id}>{organisation.name} ({organisation.code})</option>)}
          </Select>
          <Input
            label="Program Code"
            value={form.programCode ?? ""}
            disabled={!form.organisationId}
            onChange={(event) => setForm({ ...form, programCode: event.target.value })}
            hint="Leave blank for all projects in this organisation."
          />
          <Select label="Role" required value={form.roleId} onChange={(event) => setForm({ ...form, roleId: event.target.value })}>
            <option value="" disabled>Select a role</option>
            {roles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
          </Select>
          <Input label="Expiry Date (optional)" type="date" value={form.expiresAt ?? ""} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(editingGrant)}
        onClose={() => setEditingGrant(null)}
        title="Edit Access Expiry"
        size="sm"
        footer={<><Button variant="secondary" size="sm" onClick={() => setEditingGrant(null)}>Cancel</Button><Button size="sm" onClick={handleExpirySave} loading={saving}>Save</Button></>}
      >
        <div className="space-y-3">
          <Input label="Expiry Date" type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} hint="Leave blank to remove the expiry date." />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(revokeGrant)}
        title="Revoke Access"
        description={`Revoke ${revokeGrant?.userId.name ?? "this user's"} access? The revoked grant will remain in the audit history.`}
        confirmLabel="Revoke"
        loading={saving}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeGrant(null)}
      />
    </div>
  );
}
