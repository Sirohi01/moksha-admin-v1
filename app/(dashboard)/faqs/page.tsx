"use client";

import { useState, useEffect } from "react";
import Table, { Column } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { faqsApi, Faq } from "@/lib/faqsApi";

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "", order: 0, isActive: true });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const data = await faqsApi.getAll();
      setFaqs(data);
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
    try {
      if (editingId) {
        await faqsApi.update(editingId, formData);
      } else {
        await faqsApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await faqsApi.delete(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete.");
      }
    }
  };

  const toggleStatus = async (faq: Faq) => {
    try {
      await faqsApi.update(faq._id, { isActive: !faq.isActive });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<Faq>[] = [
    { 
      key: "order", 
      header: "Order",
      render: (row: Faq) => row.order 
    },
    { 
      key: "question", 
      header: "Question",
      render: (row: Faq) => row.question 
    },
    { 
      key: "category", 
      header: "Category",
      render: (row: Faq) => row.category || "General" 
    },
    {
      key: "isActive",
      header: "Status",
      render: (row: Faq) => (
        <span 
          onClick={(e) => { e.stopPropagation(); toggleStatus(row); }}
          className={`cursor-pointer px-2 py-1 rounded text-xs font-semibold ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row: Faq) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setFormData({ question: row.question, answer: row.answer, category: row.category || "", order: row.order, isActive: row.isActive });
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
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">FAQ Manager</h1>
          <p className="text-xs text-text-muted">Manage Frequently Asked Questions displayed on the website.</p>
        </div>
        <Button size="sm" onClick={() => {
          setFormData({ question: "", answer: "", category: "", order: faqs.length, isActive: true });
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add FAQ
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <Table<Faq> columns={columns} rows={faqs} rowKey={(r) => r._id} loading={loading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit FAQ" : "Add FAQ"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            required
          />
          <Textarea
            label="Answer"
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            required
            rows={4}
          />
          <Input
            label="Category (e.g. Donation, Service, General)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <div className="flex gap-4 items-center">
            <Input
              label="Sort Order"
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
            <label className="flex items-center gap-2 mt-5">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              Active
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save FAQ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
