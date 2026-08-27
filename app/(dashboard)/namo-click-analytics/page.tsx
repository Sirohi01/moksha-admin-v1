"use client";

import { useEffect, useState } from "react";
import { MousePointerClick } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import { NamoClickAnalyticsLog, NamoClickAnalyticsStats, namoClickAnalyticsApi } from "@/lib/namoClickAnalyticsApi";
import { useAppSelector } from "@/store/hooks";

export default function NamoClickAnalyticsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [data, setData] = useState<NamoClickAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (organisationCode !== "NAMOGANGE") { setLoading(false); return; }
    setLoading(true);
    namoClickAnalyticsApi.get().then(setData).catch(() => setError("Could not load click analytics.")).finally(() => setLoading(false));
  }, [organisationCode]);

  const columns: Column<NamoClickAnalyticsLog>[] = [
    { key: "icon", header: "Icon", render: (l) => <span className="capitalize">{l.iconName}</span> },
    { key: "ip", header: "IP Address", render: (l) => l.ipAddress },
    { key: "date", header: "Clicked At", render: (l) => new Date(l.clickedAt).toLocaleString("en-IN") },
  ];

  if (organisationCode !== "NAMOGANGE") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <MousePointerClick className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Social Click Analytics</h1>
        <p className="mt-1 text-sm text-text-muted">Select Namo Gange to view click stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-lg font-semibold text-text-primary">Social Click Analytics</h1><p className="text-xs text-text-muted">Clicks on the public site's social/contact icons.</p></div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(data.stats).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-surface-border bg-surface-card p-3">
              <p className="text-xs capitalize text-text-muted">{key}</p>
              <p className="text-lg font-semibold text-text-primary">{value}</p>
            </div>
          ))}
        </div>
      )}
      <Table columns={columns} rows={data?.logs ?? []} rowKey={(l) => l._id} loading={loading} emptyMessage="No clicks recorded yet." />
    </div>
  );
}
