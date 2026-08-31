"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { ArogyaPayment, ArogyaPaymentGateway, ArogyaPaymentStatus, arogyaPaymentApi } from "@/lib/arogyaPaymentApi";
import { useAppSelector } from "@/store/hooks";

export default function ArogyaPaymentsPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<ArogyaPayment[]>([]);
  const [status, setStatus] = useState<ArogyaPaymentStatus | "">("");
  const [gateway, setGateway] = useState<ArogyaPaymentGateway | "">("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ArogyaPayment | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (organisationCode !== "AROGYA") { setLoading(false); return; }
    setLoading(true);
    arogyaPaymentApi
      .list({ status: status || undefined, gateway: gateway || undefined })
      .then(setRows)
      .catch(() => setError("Could not load payments."))
      .finally(() => setLoading(false));
  }, [organisationCode, status, gateway]);

  useEffect(load, [load]);

  const columns: Column<ArogyaPayment>[] = [
    { key: "gateway", header: "Gateway", render: (p) => <Badge tone="neutral">{p.gateway === "RAZORPAY" ? "Razorpay" : "Offline"}</Badge> },
    { key: "order", header: "Order / Payment ID", render: (p) => <div><p className="font-mono text-xs">{p.gatewayOrderId}</p>{p.gatewayPaymentId && <p className="font-mono text-xs text-text-muted">{p.gatewayPaymentId}</p>}</div> },
    { key: "amount", header: "Amount", render: (p) => `₹${(p.amountPaise / 100).toLocaleString("en-IN")}` },
    { key: "status", header: "Status", render: (p) => <Badge tone={p.status === "PAID" ? "success" : p.status === "FAILED" ? "danger" : "pending"}>{p.status}</Badge> },
    { key: "delegate", header: "Delegate", render: (p) => p.delegateRegistrationId ? <div><p>{p.delegateRegistrationId.fullName}</p><p className="text-xs text-text-muted">{p.delegateRegistrationId.delegateCode}</p></div> : <span className="text-text-muted">—</span> },
    { key: "recordedBy", header: "Recorded By", render: (p) => p.recordedBy?.name ?? (p.gateway === "RAZORPAY" ? "—" : "Unknown") },
    { key: "date", header: "Date", render: (p) => new Date(p.createdAt).toLocaleString("en-IN") },
  ];

  if (organisationCode !== "AROGYA") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <Wallet className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Payments</h1>
        <p className="mt-1 text-sm text-text-muted">Select Arogya to view payment records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Payments</h1>
        <p className="text-xs text-text-muted">Every payment order behind a delegate registration — including ones that never completed, so you can investigate a &quot;paid but no confirmation&quot; report.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ArogyaPaymentStatus | "")}>
          <option value="">All statuses</option>
          <option value="CREATED">Created</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </Select>
        <Select label="Gateway" value={gateway} onChange={(e) => setGateway(e.target.value as ArogyaPaymentGateway | "")}>
          <option value="">All gateways</option>
          <option value="RAZORPAY">Razorpay</option>
          <option value="OFFLINE">Offline</option>
        </Select>
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(p) => p._id} loading={loading} emptyMessage="No payments found." onRowClick={setSelected} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.gatewayOrderId ?? "Payment"} size="lg" footer={null}>
        {selected && (
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-text-muted">Gateway:</span> {selected.gateway}</p>
            <p><span className="text-text-muted">Status:</span> {selected.status}</p>
            <p><span className="text-text-muted">Order ID:</span> <span className="font-mono text-xs">{selected.gatewayOrderId}</span></p>
            <p><span className="text-text-muted">Payment ID:</span> <span className="font-mono text-xs">{selected.gatewayPaymentId || "—"}</span></p>
            <p className="sm:col-span-2"><span className="text-text-muted">Signature:</span> <span className="font-mono text-xs break-all">{selected.gatewaySignature || "—"}</span></p>
            <p><span className="text-text-muted">Amount:</span> ₹{(selected.amountPaise / 100).toLocaleString("en-IN")} {selected.currency}</p>
            <p><span className="text-text-muted">Pass:</span> {selected.passId?.name ?? "—"}</p>
            <p><span className="text-text-muted">Days:</span> {selected.selectedDays.join(", ") || "—"}</p>
            <p><span className="text-text-muted">Type:</span> {selected.registrationType} {selected.registrationType === "group" ? `(size ${selected.groupSize})` : ""}</p>
            <p><span className="text-text-muted">Coupon:</span> {selected.couponCode || "—"}</p>
            <p><span className="text-text-muted">Payment Mode:</span> {selected.paymentMode || "—"}</p>
            <p><span className="text-text-muted">Recorded By:</span> {selected.recordedBy?.name ?? "—"}</p>
            <p><span className="text-text-muted">Delegate:</span> {selected.delegateRegistrationId ? `${selected.delegateRegistrationId.fullName} (${selected.delegateRegistrationId.delegateCode})` : "Not linked yet"}</p>
            {selected.note && <p className="sm:col-span-2"><span className="text-text-muted">Note:</span> {selected.note}</p>}
            <p><span className="text-text-muted">Date:</span> {new Date(selected.createdAt).toLocaleString("en-IN")}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
