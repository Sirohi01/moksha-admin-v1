"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { useCrudResource } from "@/components/crud/useCrudResource";
import { blogApi } from "@/lib/resources";
import { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";

type BlogForm = Pick<BlogPost, "title" | "slug" | "content" | "author" | "tags" | "isPublished"> &
  Partial<Pick<BlogPost, "excerpt" | "coverImage">>;

const EMPTY_FORM: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "",
  tags: [],
  isPublished: false,
};

export default function BlogPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [tagsText, setTagsText] = useState("");
  const { rows: posts, loading, saving, error, setError, save, remove } = useCrudResource<BlogPost, Partial<BlogPost>>(
    blogApi,
    { save: "Could not save blog post.", remove: "Could not delete blog post." },
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTagsText("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post._id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      coverImage: post.coverImage ?? "",
      author: post.author,
      tags: post.tags,
      isPublished: post.isPublished,
    });
    setTagsText(post.tags.join(", "));
    setError("");
    setModalOpen(true);
  };

  const formPayload = (): Partial<BlogPost> => ({
    ...form,
    excerpt: form.excerpt || undefined,
    coverImage: form.coverImage || undefined,
    tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
  });

  const handleSave = async () => {
    if (await save(editingId, formPayload())) setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm("Delete this blog post?")) return;
    if (await remove(editingId)) setModalOpen(false);
  };

  const columns: Column<BlogPost>[] = [
    { key: "title", header: "Title", render: (post) => <span className="font-medium">{post.title}</span> },
    { key: "author", header: "Author", render: (post) => post.author },
    { key: "slug", header: "Slug", render: (post) => post.slug },
    { key: "status", header: "Status", render: (post) => <Badge tone={post.isPublished ? "success" : "neutral"}>{post.isPublished ? "Published" : "Draft"}</Badge> },
    { key: "createdAt", header: "Created", render: (post) => formatDate(post.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-text-primary">Blog</h1><p className="text-xs text-text-muted">Manage awareness articles and updates.</p></div>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" /> New Post</Button>
      </div>
      <Table columns={columns} rows={posts} rowKey={(post) => post._id} loading={loading} emptyMessage="No blog posts yet." onRowClick={openEdit} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Blog Post" : "New Blog Post"} size="lg" footer={<>{editingId && <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete</Button>}<div className="flex-1" /><Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button><Button size="sm" onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-3">
          <Input label="Title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <Input label="Slug" required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} hint="Lowercase letters, numbers and hyphens only." />
          <Textarea label="Excerpt" rows={2} value={form.excerpt ?? ""} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} />
          <Textarea label="Content" required rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Author" required value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} />
            <Select label="Status" value={form.isPublished ? "published" : "draft"} onChange={(event) => setForm({ ...form, isPublished: event.target.value === "published" })}><option value="draft">Draft</option><option value="published">Published</option></Select>
          </div>
          <Input label="Cover Image URL" value={form.coverImage ?? ""} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} />
          <Input label="Tags" value={tagsText} onChange={(event) => setTagsText(event.target.value)} hint="Comma-separated tags." />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
