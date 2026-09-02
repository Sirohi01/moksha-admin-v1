"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  BellRing,
  BellOff,
  Upload,
  FileText,
  X,
  Globe,
  Server,
  CreditCard,
  Mail,
  MessageSquare,
  Cloud,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Database,
  Network,
  KeyRound,
  Share2,
  Plug,
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatCard from "@/components/ui/StatCard";
import Table, { Column } from "@/components/ui/Table";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { externalServiceApi } from "@/lib/externalServiceApi";
import { settingsApi } from "@/lib/settingsApi";
import { uploadApi } from "@/lib/uploadApi";
import { ExternalService, ExternalServiceCategory, ExternalServiceBillingCycle, ExternalServiceReceipt, Settings } from "@/lib/types";
import { ApiRequestError } from "@/lib/api";
import { daysRemaining, serviceStatus, ServiceStatus, useCountdown, formatCountdown } from "@/lib/systemServiceUtils";

const BILLING_CYCLE_LABEL: Record<ExternalServiceBillingCycle, string> = {
  ONE_TIME: "One-time",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const CATEGORIES: { value: ExternalServiceCategory; label: string }[] = [
  { value: "DOMAIN", label: "Domain" },
  { value: "HOSTING", label: "Hosting / Server" },
  { value: "SSL_CERTIFICATE", label: "SSL Certificate" },
  { value: "PAYMENT_GATEWAY", label: "Payment Gateway" },
  { value: "EMAIL_SMTP", label: "Email / SMTP" },
  { value: "SMS_WHATSAPP", label: "SMS / WhatsApp" },
  { value: "MEDIA_STORAGE", label: "Media Storage" },
  { value: "AI_API", label: "AI / LLM API (Gemini, OpenAI, etc.)" },
  { value: "ANALYTICS", label: "Analytics / Search Console" },
  { value: "DATABASE", label: "Database" },
  { value: "CDN", label: "CDN" },
  { value: "SOFTWARE_LICENSE", label: "Software License / Subscription" },
  { value: "SOCIAL_MEDIA", label: "Social Media / Ads" },
  { value: "API_SERVICE", label: "Other API Service" },
  { value: "OTHER", label: "Other" },
];

const CATEGORY_LABEL: Record<ExternalServiceCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
) as Record<ExternalServiceCategory, string>;

const CATEGORY_ICON: Record<ExternalServiceCategory, LucideIcon> = {
  DOMAIN: Globe,
  HOSTING: Server,
  SSL_CERTIFICATE: ShieldCheck,
  PAYMENT_GATEWAY: CreditCard,
  EMAIL_SMTP: Mail,
  SMS_WHATSAPP: MessageSquare,
  MEDIA_STORAGE: Cloud,
  AI_API: Sparkles,
  ANALYTICS: BarChart3,
  DATABASE: Database,
  CDN: Network,
  SOFTWARE_LICENSE: KeyRound,
  SOCIAL_MEDIA: Share2,
  API_SERVICE: Plug,
  OTHER: Package,
};

const STATUS_BADGE: Record<ServiceStatus, { tone: "success" | "pending" | "danger"; label: string }> = {
  ACTIVE: { tone: "success", label: "Active" },
  EXPIRING_SOON: { tone: "pending", label: "Expiring Soon" },
  EXPIRED: { tone: "danger", label: "Expired" },
};

type FormState = {
  category: ExternalServiceCategory;
  name: string;
  provider: string;
  accountIdentifier: string;
  loginUrl: string;
  secretLabel: string;
  secretValue: string;
  startDate: string;
  expiryDate: string;
  autoRenews: boolean;
  notes: string;
  popupReminderDays: string;
  emailReminderDays: string;
  notifyEmails: string;
  remindersEnabled: boolean;
  pricingType: "FREE" | "PAID";
  costAmount: string;
  currency: string;
  billingCycle: ExternalServiceBillingCycle | "";
  receipts: ExternalServiceReceipt[];
};

const EMPTY_FORM: FormState = {
  category: "OTHER",
  name: "",
  provider: "",
  accountIdentifier: "",
  loginUrl: "",
  secretLabel: "",
  secretValue: "",
  startDate: "",
  expiryDate: "",
  autoRenews: false,
  notes: "",
  popupReminderDays: "",
  emailReminderDays: "",
  notifyEmails: "",
  remindersEnabled: true,
  pricingType: "PAID",
  costAmount: "",
  currency: "INR",
  billingCycle: "",
  receipts: [],
};

function toFormState(item: ExternalService): FormState {
  return {
    category: item.category,
    name: item.name,
    provider: item.provider ?? "",
    accountIdentifier: item.accountIdentifier ?? "",
    loginUrl: item.loginUrl ?? "",
    secretLabel: item.secretLabel ?? "",
    secretValue: item.secretValue ?? "",
    startDate: item.startDate ? item.startDate.slice(0, 10) : "",
    expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
    autoRenews: item.autoRenews ?? false,
    notes: item.notes ?? "",
    popupReminderDays: item.popupReminderDays != null ? String(item.popupReminderDays) : "",
    emailReminderDays: item.emailReminderDays != null ? String(item.emailReminderDays) : "",
    notifyEmails: item.notifyEmails?.join(", ") ?? "",
    remindersEnabled: item.remindersEnabled ?? true,
    pricingType: item.pricingType ?? "PAID",
    costAmount: item.costAmount != null ? String(item.costAmount) : "",
    currency: item.currency ?? "INR",
    billingCycle: item.billingCycle ?? "",
    receipts: item.receipts ?? [],
  };
}

function toPayload(form: FormState): Partial<ExternalService> {
  return {
    category: form.category,
    name: form.name.trim(),
    provider: form.provider.trim() || undefined,
    accountIdentifier: form.accountIdentifier.trim() || undefined,
    loginUrl: form.loginUrl.trim() || undefined,
    secretLabel: form.secretLabel.trim() || undefined,
    secretValue: form.secretValue || undefined,
    startDate: form.startDate || undefined,
    expiryDate: form.expiryDate,
    autoRenews: form.autoRenews,
    notes: form.notes.trim() || undefined,
    popupReminderDays: form.popupReminderDays ? Number(form.popupReminderDays) : undefined,
    emailReminderDays: form.emailReminderDays ? Number(form.emailReminderDays) : undefined,
    notifyEmails: form.notifyEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
    remindersEnabled: form.remindersEnabled,
    pricingType: form.pricingType,
    costAmount: form.pricingType === "PAID" && form.costAmount ? Number(form.costAmount) : undefined,
    currency: form.pricingType === "PAID" ? form.currency.trim() || "INR" : undefined,
    billingCycle: form.pricingType === "PAID" && form.billingCycle ? form.billingCycle : undefined,
    receipts: form.receipts,
  };
}

function PricingTag({ item }: { item: ExternalService }) {
  if (item.pricingType === "FREE") return <Badge tone="success">Free</Badge>;
  if (item.costAmount != null) {
    const cycle = item.billingCycle && item.billingCycle !== "ONE_TIME" ? ` / ${BILLING_CYCLE_LABEL[item.billingCycle].toLowerCase()}` : "";
    return (
      <span className="text-xs font-semibold text-text-primary">
        {item.currency ?? "INR"} {item.costAmount}
        {cycle}
      </span>
    );
  }
  return <span className="text-xs text-text-muted">Paid — amount not set</span>;
}

function CountdownCell({ expiryDate }: { expiryDate: string }) {
  const countdown = useCountdown(expiryDate);
  return (
    <span className={`whitespace-nowrap text-xs font-semibold tabular-nums ${countdown.isExpired ? "text-red-600" : "text-text-primary"}`}>
      {formatCountdown(countdown)}
    </span>
  );
}

export default function SystemServicesPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [alertDefaults, setAlertDefaults] = useState({ popupReminderDays: "15", emailReminderDays: "15", notifyEmails: "" });
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalService | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<ExternalService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [settingsRes, servicesRes] = await Promise.all([settingsApi.get(), externalServiceApi.list()]);
      setSettings(settingsRes);
      setServices(servicesRes);
      setAlertDefaults({
        popupReminderDays: String(settingsRes.systemAlerts?.popupReminderDays ?? 15),
        emailReminderDays: String(settingsRes.systemAlerts?.emailReminderDays ?? 15),
        notifyEmails: settingsRes.systemAlerts?.notifyEmails?.join(", ") ?? "",
      });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not load System & Security data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveAlertDefaults = async () => {
    if (!settings) return;
    setSavingAlerts(true);
    setMessage(null);
    try {
      const updated = await settingsApi.update({
        ...settings,
        systemAlerts: {
          popupReminderDays: Number(alertDefaults.popupReminderDays) || 15,
          emailReminderDays: Number(alertDefaults.emailReminderDays) || 15,
          notifyEmails: alertDefaults.notifyEmails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean),
        },
      });
      setSettings(updated);
      setMessage({ type: "success", text: "Alert defaults saved." });
      setAlertModalOpen(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not save alert defaults." });
    } finally {
      setSavingAlerts(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (item: ExternalService) => {
    setEditing(item);
    setForm(toFormState(item));
    setFormOpen(true);
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (receiptInputRef.current) receiptInputRef.current.value = "";
    if (!file) return;

    setUploadingReceipt(true);
    setMessage(null);
    try {
      const result = await uploadApi.file(file, "moksha-sewa/system-services");
      const receipt: ExternalServiceReceipt = { url: result.url, label: file.name, uploadedAt: new Date().toISOString() };
      setForm((prev) => ({ ...prev, receipts: [...prev.receipts, receipt] }));
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not upload receipt." });
    } finally {
      setUploadingReceipt(false);
    }
  };

  const removeReceipt = (url: string) => {
    setForm((prev) => ({ ...prev, receipts: prev.receipts.filter((r) => r.url !== url) }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = toPayload(form);
      if (editing) {
        const updated = await externalServiceApi.update(editing._id, payload);
        setServices((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      } else {
        const created = await externalServiceApi.create(payload);
        setServices((prev) => [...prev, created]);
      }
      setFormOpen(false);
      setMessage({ type: "success", text: `Service ${editing ? "updated" : "added"}.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not save this service." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await externalServiceApi.remove(deleteTarget._id);
      setServices((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not delete this service." });
    } finally {
      setDeleting(false);
    }
  };

  const sorted = [...services].sort((a, b) => daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate));

  const expiringCount = services.filter((s) => serviceStatus(s, settings) === "EXPIRING_SOON").length;
  const expiredCount = services.filter((s) => serviceStatus(s, settings) === "EXPIRED").length;
  const monthlySpend = services
    .filter((s) => s.pricingType === "PAID" && s.billingCycle === "MONTHLY" && s.costAmount != null)
    .reduce((sum, s) => sum + (s.costAmount ?? 0), 0);

  const columns: Column<ExternalService>[] = [
    {
      key: "name",
      header: "Service",
      width: "w-64",
      render: (row) => {
        const Icon = CATEGORY_ICON[row.category];
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-text-primary">{row.name}</p>
              {row.provider && <p className="truncate text-[11px] text-text-muted">{row.provider}</p>}
            </div>
          </div>
        );
      },
    },
    { key: "category", header: "Category", width: "w-36", render: (row) => <Badge tone="neutral">{CATEGORY_LABEL[row.category]}</Badge> },
    { key: "pricing", header: "Pricing", width: "w-32", render: (row) => <PricingTag item={row} /> },
    {
      key: "expiryDate",
      header: "Expiry Date",
      width: "w-28",
      render: (row) => <span className="whitespace-nowrap tabular-nums">{new Date(row.expiryDate).toLocaleDateString()}</span>,
    },
    {
      key: "countdown",
      header: "Live Countdown",
      width: "w-44",
      render: (row) => <CountdownCell expiryDate={row.expiryDate} />,
    },
    {
      key: "status",
      header: "Status",
      width: "w-36",
      render: (row) => {
        const status = STATUS_BADGE[serviceStatus(row, settings)];
        return (
          <div className="flex items-center gap-1.5">
            <Badge tone={status.tone}>{status.label}</Badge>
            {!row.remindersEnabled && (
              <span title="Reminders muted for this service" className="text-text-muted">
                <BellOff className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "w-24",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          {row.loginUrl && (
            <a
              href={row.loginUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-sunken hover:text-text-primary"
              title="Open dashboard"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={() => openEdit(row)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-sunken hover:text-text-primary"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">System & Security</h1>
          <p className="text-xs text-text-muted">
            Every domain, server, payment, storage and email dependency the website relies on — in one place, with expiry
            tracking so renewals never depend on one person remembering.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setAlertModalOpen(true)}>
          <BellRing className="h-3.5 w-3.5" /> Alert Defaults
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-xs font-medium ${
            message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Layers} label="Tracked Services" value={services.length} accentColor="#0d9488" />
        <StatCard icon={AlertTriangle} label="Expiring Soon" value={expiringCount} accentColor="#d97706" />
        <StatCard icon={XCircle} label="Expired" value={expiredCount} tone={expiredCount > 0 ? "danger" : "neutral"} />
        <StatCard icon={Wallet} label="Monthly Spend" value={`₹${monthlySpend.toLocaleString("en-IN")}`} hint="paid + monthly only" accentColor="#4f46e5" />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Tracked Services & Resources</h2>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> Add Service
          </Button>
        </div>
        <Table columns={columns} rows={sorted} rowKey={(row) => row._id} loading={loading} emptyMessage="Nothing tracked yet." />
      </Card>

      <Modal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title="Alert Defaults"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAlertModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveAlertDefaults} loading={savingAlerts}>
              Save Alert Defaults
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[11px] text-text-muted">Used for any service that doesn&apos;t set its own override.</p>
          <Input
            label="Popup Alert — Days Before Expiry"
            type="number"
            min={0}
            value={alertDefaults.popupReminderDays}
            onChange={(e) => setAlertDefaults({ ...alertDefaults, popupReminderDays: e.target.value })}
          />
          <Input
            label="Email Alert — Days Before Expiry"
            type="number"
            min={0}
            value={alertDefaults.emailReminderDays}
            onChange={(e) => setAlertDefaults({ ...alertDefaults, emailReminderDays: e.target.value })}
          />
          <Input
            label="Notify Emails"
            placeholder="ops@mokshasewa.org, admin@mokshasewa.org"
            value={alertDefaults.notifyEmails}
            onChange={(e) => setAlertDefaults({ ...alertDefaults, notifyEmails: e.target.value })}
            hint="Comma-separated"
          />
        </div>
      </Modal>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Service" : "Add Service"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={saving}>
              {editing ? "Save Changes" : "Add Service"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExternalServiceCategory })}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Domain — mokshasewa.org" />
            <Input label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="e.g. Razorpay, Cloudinary, GoDaddy" />
            <Input label="Account Identifier" value={form.accountIdentifier} onChange={(e) => setForm({ ...form, accountIdentifier: e.target.value })} placeholder="Login email / username / account id" />
            <Input label="Login URL" value={form.loginUrl} onChange={(e) => setForm({ ...form, loginUrl: e.target.value })} placeholder="https://dashboard.provider.com" />
            <Input label="Secret Label" value={form.secretLabel} onChange={(e) => setForm({ ...form, secretLabel: e.target.value })} placeholder="e.g. API Secret Key, SMTP Password" />
          </div>
          <Textarea
            label="Secret / Credential Value"
            rows={2}
            value={form.secretValue}
            onChange={(e) => setForm({ ...form, secretValue: e.target.value })}
            hint="Stored encrypted; visible to anyone granted access to this page."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="Expiry Date" type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>

          <div className="rounded-lg border border-surface-border p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Pricing</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Free or Paid"
                value={form.pricingType}
                onChange={(e) => setForm({ ...form, pricingType: e.target.value as "FREE" | "PAID" })}
              >
                <option value="FREE">Free</option>
                <option value="PAID">Paid</option>
              </Select>
              {form.pricingType === "PAID" && (
                <>
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <Input label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                    <Input
                      label="Amount"
                      type="number"
                      min={0}
                      value={form.costAmount}
                      onChange={(e) => setForm({ ...form, costAmount: e.target.value })}
                      placeholder="e.g. 999"
                    />
                  </div>
                  <Select
                    label="Billing Cycle"
                    value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value as ExternalServiceBillingCycle })}
                  >
                    <option value="">Select cycle</option>
                    {Object.entries(BILLING_CYCLE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-surface-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Bills / Receipts</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => receiptInputRef.current?.click()} loading={uploadingReceipt}>
                <Upload className="h-3.5 w-3.5" /> Upload
              </Button>
              <input ref={receiptInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleReceiptFileChange} />
            </div>
            {form.receipts.length === 0 ? (
              <p className="text-[11px] text-text-muted">No bills uploaded yet.</p>
            ) : (
              <div className="space-y-1.5">
                {form.receipts.map((receipt) => (
                  <div key={receipt.url} className="flex items-center justify-between gap-2 rounded-md bg-surface-sunken px-2.5 py-1.5">
                    <a
                      href={receipt.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{receipt.label || "Receipt"}</span>
                    </a>
                    <button type="button" onClick={() => removeReceipt(receipt.url)} className="shrink-0 text-text-muted hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-surface-border p-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <input
                type="checkbox"
                checked={form.remindersEnabled}
                onChange={(e) => setForm({ ...form, remindersEnabled: e.target.checked })}
              />
              Send reminders (popup &amp; email) for this service
            </label>
            <p className="mt-1 text-[11px] text-text-muted">
              Turn this off for something that never actually needs renewing, or whose expiry date is just a
              placeholder — it stays visible here for reference, but stops triggering the popup, Topbar alert, and
              email, instead of you having to delete it or keep pushing the date out.
            </p>

            {form.remindersEnabled && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Input
                  label="Popup Alert Override (days)"
                  type="number"
                  min={0}
                  value={form.popupReminderDays}
                  onChange={(e) => setForm({ ...form, popupReminderDays: e.target.value })}
                  hint="Blank = use default"
                />
                <Input
                  label="Email Alert Override (days)"
                  type="number"
                  min={0}
                  value={form.emailReminderDays}
                  onChange={(e) => setForm({ ...form, emailReminderDays: e.target.value })}
                  hint="Blank = use default"
                />
                <Input
                  label="Notify Emails Override"
                  value={form.notifyEmails}
                  onChange={(e) => setForm({ ...form, notifyEmails: e.target.value })}
                  hint="Blank = use default list"
                />
              </div>
            )}
          </div>
          <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <input type="checkbox" checked={form.autoRenews} onChange={(e) => setForm({ ...form, autoRenews: e.target.checked })} />
            Auto-renews
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Service"
        description={`Remove "${deleteTarget?.name}" from tracked services? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
