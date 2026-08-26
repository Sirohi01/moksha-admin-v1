"use client";

import { useMemo, useState } from "react";
import { FileJson2, Plus, Trash2, Upload } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { ApiRequestError } from "@/lib/api";
import { AROGYA_CONTENT_KINDS, ArogyaContent, ArogyaContentInput, ArogyaContentKind, ArogyaContentStatus, arogyaContentApi } from "@/lib/arogyaContentApi";
import { useAppSelector } from "@/store/hooks";

const EMPTY: ArogyaContentInput = { kind: "HERO", slug: "", title: "", payload: {}, status: "ACTIVE", order: 0 };
const label = (kind: string) => kind.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

export default function ArogyaCmsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [kind, setKind] = useState<ArogyaContentKind | "">("");
  const [status, setStatus] = useState<ArogyaContentStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArogyaContentInput>(EMPTY);
  const [payloadText, setPayloadText] = useState("{}");
  const [jsonError, setJsonError] = useState("");
  const [uploading, setUploading] = useState(false);
  const filteredApi = useMemo(() => ({ ...arogyaContentApi, list: () => arogyaContentApi.list(kind || undefined, status || undefined) }), [kind, status]);
  const { rows, loading, saving, error, setError, save, remove } = useCrudResource(filteredApi, { save: "Could not save content.", remove: "Could not delete content." });

  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY, kind: kind || "HERO" }); setPayloadText("{}"); setJsonError(""); setError(""); setModalOpen(true); };
  const openEdit = (entry: ArogyaContent) => { setEditingId(entry._id); setForm({ kind: entry.kind, slug: entry.slug ?? "", title: entry.title ?? "", payload: entry.payload, status: entry.status, order: entry.order }); setPayloadText(JSON.stringify(entry.payload, null, 2)); setJsonError(""); setError(""); setModalOpen(true); };
  const handleSave = async () => {
    let payload: Record<string, unknown>;
    try { payload = JSON.parse(payloadText) as Record<string, unknown>; if (!payload || Array.isArray(payload) || typeof payload !== "object") throw new Error(); }
    catch { setJsonError("Payload must be a valid JSON object."); return; }
    setJsonError("");
    if (await save(editingId, { ...form, payload }, { ...form, payload })) setModalOpen(false);
  };
  const handleDelete = async () => { if (editingId && window.confirm("Delete this content entry permanently?") && await remove(editingId)) setModalOpen(false); };
  const handleUpload = async (file?: File) => {
    if (!file) return; setUploading(true); setJsonError("");
    try {
      const uploaded = await arogyaContentApi.upload(file);
      const current = JSON.parse(payloadText) as Record<string, unknown>;
      setPayloadText(JSON.stringify({ ...current, image: uploaded.url, imagePublicId: uploaded.publicId }, null, 2));
    } catch (e) { setJsonError(e instanceof ApiRequestError ? e.message : "Could not upload file."); }
    finally { setUploading(false); }
  };

  const columns: Column<ArogyaContent>[] = [
    { key: "kind", header: "Type", render: (entry) => <span className="font-medium">{label(entry.kind)}</span> },
    { key: "title", header: "Title", render: (entry) => entry.title || entry.slug || "Untitled" },
    { key: "slug", header: "Slug / path", render: (entry) => entry.slug || "—" },
    { key: "order", header: "Order", render: (entry) => entry.order },
    { key: "status", header: "Status", render: (entry) => <Badge tone={entry.status === "ACTIVE" ? "success" : "neutral"}>{entry.status}</Badge> },
  ];

  if (organisationCode !== "AROGYA") return <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center"><FileJson2 className="mx-auto h-8 w-8 text-text-muted" /><h1 className="mt-3 font-semibold">Arogya CMS</h1><p className="mt-1 text-sm text-text-muted">Select Arogya to manage its website content.</p></div>;
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="text-lg font-semibold">Arogya CMS</h1><p className="text-xs text-text-muted">Manage all legacy Arogya website content types in one scoped workspace.</p></div><Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Content</Button></div>
    <div className="grid max-w-2xl gap-3 sm:grid-cols-2"><Select label="Content type" value={kind} onChange={(e) => setKind(e.target.value as ArogyaContentKind | "")}><option value="">All types</option>{AROGYA_CONTENT_KINDS.map((item) => <option key={item} value={item}>{label(item)}</option>)}</Select><Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ArogyaContentStatus | "")}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></Select></div>
    <Table columns={columns} rows={rows} rowKey={(entry) => entry._id} loading={loading} emptyMessage="No Arogya content found." onRowClick={openEdit} />
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Content" : "New Content"} size="lg" footer={<><Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>{editingId && <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>}<Button size="sm" loading={saving} onClick={handleSave}>Save</Button></>}>
      <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Select label="Content type" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as ArogyaContentKind })}>{AROGYA_CONTENT_KINDS.map((item) => <option key={item} value={item}>{label(item)}</option>)}</Select><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ArogyaContentStatus })}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></Select><Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Input label="Slug or page path" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/^\/+/, "").replace(/\s+/g, "-") })} /><Input label="Display order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
        <div className="flex items-center gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-xs font-medium"><Upload className="h-4 w-4" />{uploading ? "Uploading…" : "Upload media"}<input className="hidden" type="file" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} /></label><span className="text-xs text-text-muted">Adds image and imagePublicId to payload.</span></div>
        <Textarea label="Legacy-compatible payload (JSON)" rows={14} value={payloadText} onChange={(e) => setPayloadText(e.target.value)} error={jsonError} hint="All original legacy fields are retained here without loss." />
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    </Modal>
  </div>;
}
