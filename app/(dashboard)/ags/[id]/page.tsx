"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { ApiRequestError } from "@/lib/api";
import { AgsClientStatus, AgsDelegate, agsDelegateApi } from "@/lib/agsDelegateApi";
import { AgsPayment, AgsPaymentInput, AgsPaymentMode, agsPaymentApi } from "@/lib/agsPaymentApi";

const CLIENT_STATUS_LABEL: Record<AgsClientStatus, string> = {
  NEW: "New",
  WARM: "Warm",
  HOT: "Hot",
  REGISTERED: "Registered",
  PAYMENT_REFUNDED: "Payment Refunded",
  NOT_INTERESTED: "Not Interested",
};

const PAYMENT_MODE_LABEL: Record<AgsPaymentMode, string> = {
  CASH: "Cash",
  CHEQUE: "Cheque",
  PAYTM: "Paytm",
  NEFT_RTGS: "NEFT / RTGS",
  PAYMENT_GATEWAY: "Payment Gateway",
};

const EMPTY_PAYMENT: Omit<AgsPaymentInput, "agsDelegateId"> = {
  paymentFor: "",
  seminarDay: "",
  amount: 0,
  paymentMode: "CASH",
};

export default function AgsDelegateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [delegate, setDelegate] = useState<AgsDelegate | null>(null);
  const [payments, setPayments] = useState<AgsPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [paymentAadhar, setPaymentAadhar] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([agsDelegateApi.getById(params.id), agsPaymentApi.list(params.id)])
      .then(([d, p]) => { setDelegate(d); setPayments(p); })
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : "Could not load delegate."))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(load, [load]);

  const changeClientStatus = async (clientStatus: AgsClientStatus) => {
    if (!delegate) return;
    setStatusSaving(true);
    setError("");
    try {
      const updated = await agsDelegateApi.update(delegate._id, { clientStatus });
      setDelegate(updated);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Could not update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const openPaymentModal = () => {
    setPaymentForm(EMPTY_PAYMENT);
    setPaymentAadhar("");
    setPaymentError("");
    setPaymentModalOpen(true);
  };

  const savePayment = async () => {
    if (!delegate) return;
    setPaymentSaving(true);
    setPaymentError("");
    try {
      await agsPaymentApi.create({
        ...paymentForm,
        agsDelegateId: delegate._id,
        aadharOrPanNo: paymentAadhar || undefined,
      });
      setPaymentModalOpen(false);
      load();
    } catch (e) {
      setPaymentError(e instanceof ApiRequestError ? e.message : "Could not record payment.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const cancelPayment = async (id: string) => {
    setError("");
    try {
      await agsPaymentApi.cancel(id);
      load();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Could not cancel payment.");
    }
  };

  const paymentColumns: Column<AgsPayment>[] = [
    { key: "registrationNo", header: "Registration No.", render: (p) => <span className="font-mono text-xs">{p.registrationNo}</span> },
    { key: "amount", header: "Amount", render: (p) => `₹${p.amount.toLocaleString("en-IN")}` },
    { key: "mode", header: "Mode", render: (p) => PAYMENT_MODE_LABEL[p.paymentMode] },
    { key: "for", header: "For", render: (p) => [p.paymentFor, p.seminarDay].filter(Boolean).join(" · ") || "—" },
    { key: "status", header: "Status", render: (p) => <Badge tone={p.status === "ACTIVE" ? "success" : "danger"}>{p.status}</Badge> },
    {
      key: "actions",
      header: "",
      render: (p) =>
        p.status === "ACTIVE" ? (
          <button className="text-xs font-medium text-red-600 hover:underline" onClick={() => cancelPayment(p._id)}>
            Cancel
          </button>
        ) : (
          "—"
        ),
    },
  ];

  if (loading) return <p className="text-sm text-text-muted">Loading…</p>;
  if (!delegate) return <p className="text-sm text-red-600">{error || "Delegate not found."}</p>;

  return (
    <div className="space-y-4">
      <button className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text-primary" onClick={() => router.push("/ags")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to delegates
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            {[delegate.title, delegate.firstName, delegate.lastName].filter(Boolean).join(" ")}
          </h1>
          <p className="text-xs text-text-muted">{delegate.mobile} · {delegate.email || "no email"}</p>
        </div>
        <Button size="sm" onClick={openPaymentModal}>
          <Plus className="h-3.5 w-3.5" /> Record Payment
        </Button>
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Overview</h2>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <p><span className="text-text-muted">Profession:</span> {delegate.profession || "—"}</p>
          <p><span className="text-text-muted">Event:</span> {delegate.event || "—"}</p>
          <p><span className="text-text-muted">Category:</span> {delegate.category || "—"}</p>
          <p><span className="text-text-muted">Coordinator:</span> {delegate.coordinator || "—"}</p>
          <p><span className="text-text-muted">Location:</span> {[delegate.city, delegate.state].filter(Boolean).join(", ") || "—"}</p>
          <p><span className="text-text-muted">Company:</span> {delegate.companyName || "—"}</p>
        </div>
        {delegate.remark && <p className="mt-3 text-sm"><span className="text-text-muted">Remark:</span> {delegate.remark}</p>}

        <div className="mt-4 max-w-xs">
          <Select
            label="Client Status"
            value={delegate.clientStatus}
            onChange={(e) => changeClientStatus(e.target.value as AgsClientStatus)}
            disabled={statusSaving}
          >
            {Object.entries(CLIENT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Payments</h2>
        <Table columns={paymentColumns} rows={payments} rowKey={(p) => p._id} loading={false} emptyMessage="No payments recorded yet." />
      </Card>

      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment"
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={savePayment} loading={paymentSaving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Payment For" value={paymentForm.paymentFor ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, paymentFor: e.target.value })} />
            <Input label="Seminar Day" value={paymentForm.seminarDay ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, seminarDay: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Amount (₹)"
              type="number"
              required
              value={paymentForm.amount || ""}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
            />
            <Select
              label="Payment Mode"
              value={paymentForm.paymentMode}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value as AgsPaymentMode })}
            >
              {Object.entries(PAYMENT_MODE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>
          <Input label="Aadhaar / PAN (optional)" value={paymentAadhar} onChange={(e) => setPaymentAadhar(e.target.value)} />

          {paymentForm.paymentMode === "CHEQUE" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Bank Name" value={paymentForm.bankName ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })} />
              <Input label="Cheque No." value={paymentForm.chequeNo ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, chequeNo: e.target.value })} />
              <Input label="Branch" value={paymentForm.branch ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, branch: e.target.value })} />
            </div>
          )}
          {paymentForm.paymentMode === "PAYTM" && (
            <Input label="Paytm No." value={paymentForm.paytmNo ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, paytmNo: e.target.value })} />
          )}
          {(paymentForm.paymentMode === "NEFT_RTGS" || paymentForm.paymentMode === "PAYMENT_GATEWAY") && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="UPI ID" value={paymentForm.upiId ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })} />
              <Input label="Transaction ID" value={paymentForm.transactionId ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })} />
            </div>
          )}
          <Input label="Bank Reference No." value={paymentForm.bankReferenceNo ?? ""} onChange={(e) => setPaymentForm({ ...paymentForm, bankReferenceNo: e.target.value })} />

          {paymentError && <p className="text-xs font-medium text-red-600">{paymentError}</p>}
        </div>
      </Modal>
    </div>
  );
}
