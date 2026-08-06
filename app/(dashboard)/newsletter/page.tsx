"use client";

import { useEffect, useState } from "react";
import Table, { Column } from "@/components/ui/Table";
import { newsletterApi } from "@/lib/newsletterApi";
import { NewsletterSubscriber } from "@/lib/types";
import { formatDateTime } from "@/lib/statusMeta";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsletterApi
      .list()
      .then(setSubscribers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<NewsletterSubscriber>[] = [
    { key: "email", header: "Email", render: (s) => <span className="font-medium">{s.email}</span> },
    { key: "source", header: "Source", render: (s) => s.source ?? "—" },
    { key: "createdAt", header: "Submitted", render: (s) => formatDateTime(s.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Support Requests</h1>
        <p className="text-xs text-text-muted">Emails shared through the &ldquo;Request Support&rdquo; footer form — follow up with these people.</p>
      </div>

      <Table columns={columns} rows={subscribers} rowKey={(s) => s._id} loading={loading} emptyMessage="No submissions yet." />
    </div>
  );
}
