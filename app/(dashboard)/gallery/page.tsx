"use client";

import { useEffect, useMemo, useState } from "react";
import { Images, Upload, Pencil, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { galleryApi, GalleryInput, GalleryItem, GalleryType } from "@/lib/galleryApi";
import { uploadApi } from "@/lib/uploadApi";
import { ApiRequestError } from "@/lib/api";

type Draft = { file: File };

const EMPTY: GalleryInput = {
  type: "image", url: "", alt: "", caption: "", description: "", category: "", credit: "Moksha Sewa Team",
  sortOrder: 0, isActive: true,
};

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<GalleryType>("image");
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [bulkAlt, setBulkAlt] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<GalleryInput>(EMPTY);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const load = () => {
    setLoading(true);
    galleryApi.list().then(setItems).catch((e) => setError(e instanceof ApiRequestError ? e.message : "Could not load gallery."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const visible = useMemo(() => items.filter((item) => item.type === filter), [items, filter]);
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pagedItems = visible.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [filter, items.length]);

  const chooseFiles = (files: FileList | null) => {
    if (!files) return;
    setDrafts(Array.from(files).map((file) => ({ file })));
    setError("");
  };

  const bulkUpload = async () => {
    if (!drafts.length || bulkAlt.trim().length < 3) {
      setError("Enter one meaningful alt text value for this complete batch.");
      return;
    }
    setUploading(true); setError("");
    const failures: string[] = [];
    for (let index = 0; index < drafts.length; index += 1) {
      const draft = drafts[index];
      setProgress(`Uploading ${index + 1} of ${drafts.length}: ${draft.file.name}`);
      try {
        const uploaded = await uploadApi.file(draft.file, `moksha-sewa/gallery/${filter}s`);
        await galleryApi.create({
          ...EMPTY, type: filter, url: uploaded.url, publicId: uploaded.publicId, alt: bulkAlt.trim(),
          caption: bulkAlt.trim(), category: bulkCategory.trim(), sortOrder: items.length + index,
        });
      } catch { failures.push(draft.file.name); }
    }
    setUploading(false); setProgress(""); setDrafts([]); setBulkAlt(""); setBulkCategory(""); load();
    if (failures.length) setError(`Could not upload: ${failures.join(", ")}`);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({
      type: item.type, url: item.url, thumbnailUrl: item.thumbnailUrl, publicId: item.publicId,
      thumbnailPublicId: item.thumbnailPublicId, alt: item.alt || item.caption || "Moksha Sewa gallery media",
      caption: item.caption, description: item.description, category: item.category, credit: item.credit,
      sortOrder: item.sortOrder ?? 0, isActive: item.isActive
    });
  };
  const saveEdit = async () => {
    if (!editing || form.alt.trim().length < 3) return setError("Alt text is required.");
    setUploading(true); setError("");
    try { await galleryApi.update(editing._id, form); setEditing(null); load(); }
    catch (e) { setError(e instanceof ApiRequestError ? e.message : "Could not update item."); }
    finally { setUploading(false); }
  };
  const remove = async (item: GalleryItem) => {
    if (!window.confirm(`Remove “${item.caption || item.alt}” from the gallery?`)) return;
    await galleryApi.remove(item._id); load();
  };

  return <div className="space-y-4">
    <div><h1 className="text-lg font-semibold text-text-primary">Gallery Media</h1>
      <p className="text-xs text-text-muted">Bulk upload images and videos to Cloudinary. Alt text is required for every item.</p></div>
    <div className="flex gap-2">{(["image", "video"] as GalleryType[]).map((type) =>
      <Button key={type} size="sm" variant={filter === type ? "primary" : "secondary"} onClick={() => { setFilter(type); setDrafts([]); setBulkAlt(""); setBulkCategory(""); }}>
        {type === "image" ? "Photo Gallery" : "Video Gallery"}
      </Button>)}</div>
    {error && <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"><span>{error}</span>{!loading && <Button size="sm" variant="secondary" onClick={load}>Try Again</Button>}</div>}
    <Card><div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-sm font-semibold">Bulk upload {filter}s</h2><p className="text-xs text-text-muted">{filter === "image" ? "JPG, PNG, WebP or GIF" : "MP4 or WebM"}; up to 100MB each.</p></div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white">
        <Upload className="h-4 w-4" /> Select files<input className="hidden" type="file" multiple accept={filter === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm"} onChange={(e) => chooseFiles(e.target.files)} />
      </label></div>
      {drafts.length > 0 && <div className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Common Alt Text" required value={bulkAlt} onChange={(e) => setBulkAlt(e.target.value)} hint={`Applied to all ${drafts.length} selected files.`} />
          <Input label="Common Category" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} hint={`Applied to all ${drafts.length} selected files.`} />
        </div>
        <div className="max-h-44 overflow-y-auto rounded-lg border border-surface-border p-3">
          <p className="mb-2 text-xs font-semibold">Selected files ({drafts.length})</p>
          <div className="space-y-1">{drafts.map((draft, index) => <p key={`${draft.file.name}-${index}`} className="truncate text-xs text-text-muted">{index + 1}. {draft.file.name}</p>)}</div>
        </div>
        <Button onClick={bulkUpload} loading={uploading}><Upload className="h-4 w-4" /> Upload all</Button>{progress && <p className="text-xs text-text-muted">{progress}</p>}
      </div>}
    </Card>
    <Card><h2 className="mb-3 text-sm font-semibold">Published and draft {filter}s ({visible.length})</h2>
      {loading ? <p className="text-xs text-text-muted">Loading...</p> : visible.length === 0 ? <p className="text-xs text-text-muted">No admin-managed items yet. Website fallback remains active.</p> :
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{pagedItems.map((item) => <article key={item._id} className="overflow-hidden rounded-lg border border-surface-border">
          {item.type === "image" ? <img src={item.url} alt={item.alt} loading="lazy" className="aspect-video w-full object-cover" /> : <video src={item.url} poster={item.thumbnailUrl} preload="metadata" className="aspect-video w-full bg-black object-cover" />}
          <div className="space-y-2 p-3"><p className="truncate text-sm font-semibold">{item.caption || item.alt}</p><p className="line-clamp-2 text-xs text-text-muted">Alt: {item.alt}</p>
            <div className="flex items-center justify-between"><span className={`text-xs ${item.isActive ? "text-green-700" : "text-text-muted"}`}>{item.isActive ? "Published" : "Hidden"}{item.type === "image" ? ` · ${item.downloadCount ?? 0} downloads` : ""}</span><div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="rounded p-1.5 hover:bg-surface-sunken" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(item)} className="rounded p-1.5 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div></div></div></article>)}</div>}
      {totalPages > 1 && <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-3 text-xs text-text-muted"><span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, visible.length)} of {visible.length}</span><div className="flex items-center gap-2"><Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {page} of {totalPages}</span><Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>}
    </Card>
    <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit gallery item" footer={<><Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button><Button size="sm" loading={uploading} onClick={saveEdit}>Save</Button></>}>
      <div className="space-y-3"><Input label="Alt Text" required value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} /><Input label="Title / Caption" value={form.caption ?? ""} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <Textarea label="Description" rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /><div className="grid grid-cols-2 gap-3"><Input label="Category" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /><Input label="Sort Order" type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
        {form.type === "video" && <Input label="Thumbnail URL" value={form.thumbnailUrl ?? ""} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />}
        <Select label="Visibility" value={form.isActive ? "active" : "hidden"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}><option value="active">Published</option><option value="hidden">Hidden</option></Select></div>
    </Modal>
  </div>;
}
