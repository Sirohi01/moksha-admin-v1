"use client";

import { useState, useEffect } from "react";
import Table, { Column } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { blogsApi, BlogPost } from "@/lib/blogsApi";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    isPublished: false,
    tags: "",
  });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const data = await blogsApi.getAll();
      setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const submitData = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
    };
    try {
      if (editingId) {
        await blogsApi.update(editingId, submitData);
      } else {
        await blogsApi.create(submitData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        await blogsApi.delete(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete.");
      }
    }
  };

  const columns: Column<BlogPost>[] = [
    { 
      key: "title", 
      header: "Title",
      render: (row: BlogPost) => row.title 
    },
    { 
      key: "author", 
      header: "Author",
      render: (row: BlogPost) => row.author 
    },
    {
      key: "isPublished",
      header: "Status",
      render: (row: BlogPost) => (
        <span 
          className={`px-2 py-1 rounded text-xs font-semibold ${row.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
        >
          {row.isPublished ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row: BlogPost) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setFormData({
                title: row.title,
                slug: row.slug,
                excerpt: row.excerpt || "",
                content: row.content,
                author: row.author,
                isPublished: row.isPublished,
                tags: row.tags?.join(", ") || "",
              });
              setEditingId(row._id);
              setIsModalOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Blog Manager</h1>
          <p className="text-xs text-text-muted">Manage blog posts displayed on the website.</p>
        </div>
        <Button size="sm" onClick={() => {
          setFormData({ title: "", slug: "", excerpt: "", content: "", author: "", isPublished: false, tags: "" });
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Post
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <Table<BlogPost> columns={columns} rows={blogs} rowKey={(r) => r._id} loading={loading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Blog Post" : "Add Blog Post"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({ ...formData, title: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
            }}
            required
          />
          <Input
            label="URL Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
          <Input
            label="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
          />
          <Textarea
            label="Excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={2}
          />
          <Textarea
            label="Content (Markdown/HTML)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={8}
          />
          <Input
            label="Tags (Comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          <label className="flex items-center gap-2 mt-5">
            <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} />
            Published
          </label>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border sticky bottom-0 bg-surface">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Post</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
