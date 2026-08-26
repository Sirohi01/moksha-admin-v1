"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Users2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { ApiRequestError } from "@/lib/api";
import {
  ArogyaDelegateFormFields,
  ArogyaDelegateRegistration,
  ArogyaPaymentMode,
  arogyaDelegateApi,
} from "@/lib/arogyaDelegateApi";
import { ArogyaPass, arogyaPassApi } from "@/lib/arogyaPassApi";
import { useAppSelector } from "@/store/hooks";

const EMPTY_DELEGATE: ArogyaDelegateFormFields = {
  title: "", fullName: "", email: "", mobile: "", whatsappNumber: "", designation: "",
  organization: "", country: "", state: "", city: "", industryType: "", areasOfInterest: "",
  source: "", isSpeaker: false, dietary: "", assistance: "",
};

const PAYMENT_MODES: ArogyaPaymentMode[] = ["CASH", "CHEQUE", "PAYTM", "NEFT_RTGS", "OTHER"];

export default function ArogyaDelegatesPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);
  const [rows, setRows] = useState<ArogyaDelegateRegistration[]>([]);
  const [registrationType, setRegistrationType] = useState<"single" | "group" | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ArogyaDelegateRegistration | null>(null);
  const [error, setError] = useState("");

  const [passes, setPasses] = useState<ArogyaPass[]>([]);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [offlineType, setOfflineType] = useState<"single" | "group">("single");
  const [passId, setPassId] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [groupSize, setGroupSize] = useState(2);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMode, setPaymentMode] = useState<ArogyaPaymentMode>("CASH");
  const [note, setNote] = useState("");
  const [primaryForm, setPrimaryForm] = useState<ArogyaDelegateFormFields>(EMPTY_DELEGATE);
  const [members, setMembers] = useState<ArogyaDelegateFormFields[]>([{ ...EMPTY_DELEGATE }]);
  const [offlineSaving, setOfflineSaving] = useState(false);
  const [offlineError, setOfflineError] = useState("");

  const load = useCallback(() => {
    if (organisationCode !== "AROGYA") { setLoading(false); return; }
    setLoading(true);
    arogyaDelegateApi
      .list({ registrationType: registrationType || undefined, search: search || undefined })
      .then(setRows)
      .catch(() => setError("Could not load registrations."))
      .finally(() => setLoading(false));
  }, [organisationCode, registrationType, search]);

  useEffect(load, [load]);
  useEffect(() => {
    if (organisationCode === "AROGYA") arogyaPassApi.list().then(setPasses).catch(() => undefined);
  }, [organisationCode]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const openOfflineModal = () => {
    setOfflineType("single");
    setPassId(passes[0]?._id ?? "");
    setSelectedDays([1]);
    setGroupSize(2);
    setCouponCode("");
    setPaymentMode("CASH");
    setNote("");
    setPrimaryForm(EMPTY_DELEGATE);
    setMembers([{ ...EMPTY_DELEGATE }]);
    setOfflineError("");
    setOfflineModalOpen(true);
  };

  const updateMember = (index: number, patch: Partial<ArogyaDelegateFormFields>) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };
  const addMember = () => setMembers((prev) => [...prev, { ...EMPTY_DELEGATE }]);
  const removeMember = (index: number) => setMembers((prev) => prev.filter((_, i) => i !== index));

  const submitOffline = async () => {
    setOfflineSaving(true);
    setOfflineError("");
    try {
      if (offlineType === "single") {
        await arogyaDelegateApi.createOfflineSingle({
          passId, selectedDays, couponCode: couponCode || undefined, paymentMode, note: note || undefined,
          form: primaryForm,
        });
      } else {
        await arogyaDelegateApi.createOfflineGroup({
          passId, selectedDays, couponCode: couponCode || undefined, paymentMode, note: note || undefined,
          groupSize, primary: primaryForm, members,
        });
      }
      setOfflineModalOpen(false);
      load();
    } catch (err) {
      setOfflineError(err instanceof ApiRequestError ? err.message : "Could not record this registration.");
    } finally {
      setOfflineSaving(false);
    }
  };

  const columns: Column<ArogyaDelegateRegistration>[] = [
    { key: "code", header: "Delegate Code", render: (d) => <span className="font-mono text-xs">{d.delegateCode}</span> },
    { key: "name", header: "Name", render: (d) => <div><p className="font-medium">{[d.title, d.fullName].filter(Boolean).join(" ")}</p><p className="text-xs text-text-muted">{d.email}</p></div> },
    { key: "org", header: "Organization", render: (d) => d.organization || "—" },
    { key: "pass", header: "Pass", render: (d) => d.passName },
    { key: "type", header: "Type", render: (d) => <Badge tone={d.registrationType === "group" ? "pending" : "neutral"}>{d.registrationType}{!d.isGroupPrimary ? " (member)" : ""}</Badge> },
    { key: "amount", header: "Amount Paid", render: (d) => `₹${(d.amountPaise / 100).toLocaleString("en-IN")}` },
    { key: "date", header: "Registered", render: (d) => new Date(d.createdAt).toLocaleDateString("en-IN") },
  ];

  if (organisationCode !== "AROGYA") {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-card p-8 text-center">
        <Users2 className="mx-auto h-8 w-8 text-text-muted" />
        <h1 className="mt-3 font-semibold">Delegate Registrations</h1>
        <p className="mt-1 text-sm text-text-muted">Select Arogya to view delegate registrations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Delegate Registrations</h1>
          <p className="text-xs text-text-muted">Every row here has a verified payment behind it — either Razorpay, or an offline payment recorded by an admin below.</p>
        </div>
        <Button size="sm" onClick={openOfflineModal} disabled={passes.length === 0}>
          <Plus className="h-3.5 w-3.5" /> Record Offline Registration
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Type" value={registrationType} onChange={(e) => setRegistrationType(e.target.value as "single" | "group" | "")}>
          <option value="">All types</option>
          <option value="single">Single</option>
          <option value="group">Group</option>
        </Select>
        <div className="sm:col-span-2">
          <Input label="Search" placeholder="Name, delegate code, organization" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <Table columns={columns} rows={rows} rowKey={(d) => d._id} loading={loading} emptyMessage="No registrations found." onRowClick={setSelected} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.delegateCode ?? "Registration"} size="lg" footer={null}>
        {selected && (
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-text-muted">Name:</span> {[selected.title, selected.fullName].filter(Boolean).join(" ")}</p>
            <p><span className="text-text-muted">Email:</span> {selected.email}</p>
            <p><span className="text-text-muted">Mobile:</span> {selected.mobile}</p>
            <p><span className="text-text-muted">WhatsApp:</span> {selected.whatsappNumber || "—"}</p>
            <p><span className="text-text-muted">Designation:</span> {selected.designation || "—"}</p>
            <p><span className="text-text-muted">Organization:</span> {selected.organization || "—"}</p>
            <p><span className="text-text-muted">Location:</span> {[selected.city, selected.state, selected.country].filter(Boolean).join(", ") || "—"}</p>
            <p><span className="text-text-muted">Pass:</span> {selected.passName}</p>
            <p><span className="text-text-muted">Days:</span> {selected.selectedDays.join(", ") || "—"}</p>
            <p><span className="text-text-muted">Amount Paid:</span> ₹{(selected.amountPaise / 100).toLocaleString("en-IN")}</p>
            <p><span className="text-text-muted">Coupon:</span> {selected.couponCode || "—"}</p>
            <p><span className="text-text-muted">Speaker:</span> {selected.isSpeaker ? "Yes" : "No"}</p>
            {selected.dietary && <p><span className="text-text-muted">Dietary:</span> {selected.dietary}</p>}
            {selected.assistance && <p><span className="text-text-muted">Assistance:</span> {selected.assistance}</p>}
            {selected.documentUrl && <p className="sm:col-span-2"><a className="text-brand-600 hover:underline" href={selected.documentUrl} target="_blank" rel="noreferrer">View uploaded document</a></p>}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={offlineModalOpen} onClose={() => setOfflineModalOpen(false)} title="Record Offline Registration" size="lg"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => setOfflineModalOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={submitOffline} loading={offlineSaving} disabled={!passId || selectedDays.length === 0}>Save Registration</Button>
        </>}
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">Amount is always computed from the selected pass/days/coupon — the same pricing rule Razorpay checkout uses. This just records how the payment was actually received.</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select label="Registration Type" value={offlineType} onChange={(e) => setOfflineType(e.target.value as "single" | "group")}>
              <option value="single">Single</option>
              <option value="group">Group</option>
            </Select>
            <Select label="Pass" value={passId} onChange={(e) => setPassId(e.target.value)}>
              <option value="">Select a pass</option>
              {passes.map((p) => <option key={p._id} value={p._id}>{p.name} — ₹{p.price.toLocaleString("en-IN")} ({p.daysText})</option>)}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Days</label>
            <div className="flex gap-3">
              {[1, 2, 3].map((day) => (
                <label key={day} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={selectedDays.includes(day)} onChange={() => toggleDay(day)} /> Day {day}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {offlineType === "group" && (
              <Input label="Group Size" type="number" min={2} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} />
            )}
            <Input label="Coupon Code (optional)" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
            <Select label="Payment Mode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as ArogyaPaymentMode)}>
              {PAYMENT_MODES.map((mode) => <option key={mode} value={mode}>{mode.replace("_", "/")}</option>)}
            </Select>
          </div>
          <Input label="Note (optional)" placeholder="e.g. cash collected at venue reception" value={note} onChange={(e) => setNote(e.target.value)} />

          <div className="rounded-lg border border-surface-border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{offlineType === "group" ? "Primary Delegate" : "Delegate Details"}</p>
            <DelegateFieldsForm value={primaryForm} onChange={(patch) => setPrimaryForm((prev) => ({ ...prev, ...patch }))} />
          </div>

          {offlineType === "group" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Group Members</p>
                <Button variant="secondary" size="sm" onClick={addMember}><Plus className="h-3.5 w-3.5" /> Add Member</Button>
              </div>
              {members.map((member, index) => (
                <div key={index} className="rounded-lg border border-surface-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-text-muted">Member {index + 1}</p>
                    {members.length > 1 && (
                      <button type="button" onClick={() => removeMember(index)} className="text-red-600" aria-label="Remove member">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <DelegateFieldsForm value={member} onChange={(patch) => updateMember(index, patch)} compact />
                </div>
              ))}
            </div>
          )}

          {offlineError && <p className="text-xs font-medium text-red-600">{offlineError}</p>}
        </div>
      </Modal>
    </div>
  );
}

function DelegateFieldsForm({
  value, onChange, compact,
}: {
  value: ArogyaDelegateFormFields;
  onChange: (patch: Partial<ArogyaDelegateFormFields>) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input label="Full Name" required value={value.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
        <Input label="Email" type="email" required value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
        <Input label="Mobile" required value={value.mobile} onChange={(e) => onChange({ mobile: e.target.value })} />
      </div>
      {!compact && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="WhatsApp Number" value={value.whatsappNumber} onChange={(e) => onChange({ whatsappNumber: e.target.value })} />
            <Input label="Designation" value={value.designation} onChange={(e) => onChange({ designation: e.target.value })} />
            <Input label="Organization" value={value.organization} onChange={(e) => onChange({ organization: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Country" value={value.country} onChange={(e) => onChange({ country: e.target.value })} />
            <Input label="State" value={value.state} onChange={(e) => onChange({ state: e.target.value })} />
            <Input label="City" value={value.city} onChange={(e) => onChange({ city: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Dietary Preference" value={value.dietary} onChange={(e) => onChange({ dietary: e.target.value })} />
            <Input label="Assistance Needed" value={value.assistance} onChange={(e) => onChange({ assistance: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.isSpeaker ?? false} onChange={(e) => onChange({ isSpeaker: e.target.checked })} />
            Is a speaker
          </label>
        </>
      )}
    </div>
  );
}
