"use client";

import { useState, useEffect, useRef, useMemo, type ReactNode, type ChangeEvent } from "react";
import {
  Plus, Pencil, Trash2, ExternalLink, BellRing, BellOff, Upload, FileText, X,
  Globe, Server, CreditCard, Mail, MessageSquare, Cloud, ShieldCheck, Sparkles,
  BarChart3, Database, Network, KeyRound, Share2, Plug, Package, Check,
  AlertTriangle, Search, type LucideIcon,
} from "lucide-react";
import { externalServiceApi } from "@/lib/externalServiceApi";
import { settingsApi } from "@/lib/settingsApi";
import { uploadApi } from "@/lib/uploadApi";
import {
  ExternalService,
  ExternalServiceCategory,
  ExternalServiceBillingCycle,
  ExternalServiceReceipt,
  Settings,
} from "@/lib/types";
import { ApiRequestError } from "@/lib/api";
import { daysRemaining, serviceStatus, useCountdown, formatCountdown } from "@/lib/systemServiceUtils";
type UIStatus = "OK" | "SOON" | "EXPIRED" | "MUTED";
type GroupKey = "EXPIRED" | "SOON" | "LATER" | "MUTED";
type Toast = { id: string; text: string; type: "ok" | "err" };

type FormState = {
  category: ExternalServiceCategory; name: string; provider: string; accountIdentifier: string;
  loginUrl: string; secretLabel: string; secretValue: string; startDate: string; expiryDate: string;
  autoRenews: boolean; notes: string; popupReminderDays: string; emailReminderDays: string;
  notifyEmails: string; remindersEnabled: boolean; pricingType: "FREE" | "PAID"; costAmount: string;
  currency: string; billingCycle: ExternalServiceBillingCycle | ""; receipts: ExternalServiceReceipt[];
};
const CATEGORIES: { value: ExternalServiceCategory; label: string }[] = [
  { value: "DOMAIN", label: "Domain" },
  { value: "HOSTING", label: "Hosting / server" },
  { value: "SSL_CERTIFICATE", label: "SSL certificate" },
  { value: "PAYMENT_GATEWAY", label: "Payment gateway" },
  { value: "EMAIL_SMTP", label: "Email / SMTP" },
  { value: "SMS_WHATSAPP", label: "SMS / WhatsApp" },
  { value: "MEDIA_STORAGE", label: "Media storage" },
  { value: "AI_API", label: "AI / LLM API" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "DATABASE", label: "Database" },
  { value: "CDN", label: "CDN" },
  { value: "SOFTWARE_LICENSE", label: "Software licence" },
  { value: "SOCIAL_MEDIA", label: "Social media / ads" },
  { value: "API_SERVICE", label: "Other API service" },
  { value: "OTHER", label: "Other" },
];

const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label])) as Record<ExternalServiceCategory, string>;

const CAT_ICON: Record<ExternalServiceCategory, LucideIcon> = {
  DOMAIN: Globe, HOSTING: Server, SSL_CERTIFICATE: ShieldCheck, PAYMENT_GATEWAY: CreditCard,
  EMAIL_SMTP: Mail, SMS_WHATSAPP: MessageSquare, MEDIA_STORAGE: Cloud, AI_API: Sparkles,
  ANALYTICS: BarChart3, DATABASE: Database, CDN: Network, SOFTWARE_LICENSE: KeyRound,
  SOCIAL_MEDIA: Share2, API_SERVICE: Plug, OTHER: Package,
};

const CYCLE: Record<ExternalServiceBillingCycle, string> = {
  ONE_TIME: "one-time", MONTHLY: "monthly", YEARLY: "yearly",
};

const GROUP_META: Record<GroupKey, { label: string; note: string }> = {
  EXPIRED: { label: "Past due", note: "the site may already be affected" },
  SOON: { label: "Renew soon", note: "inside the reminder window" },
  LATER: { label: "Steady", note: "nothing to do yet" },
  MUTED: { label: "Reminders off", note: "tracked for reference only" },
};

const GROUP_ORDER: GroupKey[] = ["EXPIRED", "SOON", "LATER", "MUTED"];

const EMPTY: FormState = {
  category: "OTHER", name: "", provider: "", accountIdentifier: "", loginUrl: "",
  secretLabel: "", secretValue: "", startDate: "", expiryDate: "", autoRenews: false,
  notes: "", popupReminderDays: "", emailReminderDays: "", notifyEmails: "",
  remindersEnabled: true, pricingType: "PAID", costAmount: "", currency: "INR",
  billingCycle: "", receipts: [],
};

const uiStatus = (s: ExternalService, settings: Settings | null): UIStatus => {
  if (s.remindersEnabled === false) return "MUTED";
  const st = serviceStatus(s, settings);
  return st === "EXPIRED" ? "EXPIRED" : st === "EXPIRING_SOON" ? "SOON" : "OK";
};

const railClass = (st: UIStatus): string =>
  st === "EXPIRED" ? "bg-[#A8202B]" : st === "SOON" ? "bg-[#9C5A08]" : st === "MUTED" ? "bg-[#D8D0C7]" : "bg-[#8B6A3E]";

const inr = (n: number): string => "₹" + Number(n || 0).toLocaleString("en-IN");

const errText = (err: unknown, fallback: string): string =>
  err instanceof ApiRequestError ? err.message : fallback;

/* --------------------------------------------------------------- primitives */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[5px] block text-xs font-medium text-[#665B53]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-[#81766E]">{hint}</span>}
    </label>
  );
}

function Modal({
  open, onClose, title, width = 560, children, footer,
}: {
  open: boolean; onClose: () => void; title: string; width?: 420 | 440 | 560 | 620;
  children: ReactNode; footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  if (!open) return null;
  const widthClass = width === 420 ? "max-w-[420px]" : width === 440 ? "max-w-[440px]" : width === 620 ? "max-w-[620px]" : "max-w-[560px]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e1c17]/45 p-5 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`flex max-h-[88vh] w-full flex-col rounded-[18px] border border-white/70 bg-white shadow-[0_24px_60px_rgba(10,25,20,.28)] ${widthClass}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between gap-3 border-b border-[#EAE5DE] px-[18px] py-4 [&_h3]:m-0 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:tracking-[-.01em]">
          <h3>{title}</h3>
          <button className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto px-[18px] py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#EAE5DE] px-[18px] py-[13px]">{footer}</div>}
      </div>
    </div>
  );
}

function Countdown({ expiryDate, status }: { expiryDate: string; status: UIStatus }) {
  const c = useCountdown(expiryDate);
  return (
    <span className={`whitespace-nowrap text-xs tracking-[-.01em] tabular-nums ${status === "EXPIRED" ? "text-[#A8202B]" : status === "SOON" ? "text-[#9C5A08]" : "text-[#261B15]"}`}>
      {formatCountdown(c)}
    </span>
  );
}

/* ------------------------------------------------------------------- runway */

function Runway({
  services, settings, onPick,
}: { services: ExternalService[]; settings: Settings | null; onPick: (id: string) => void }) {
  const live = services.filter((s) => s.remindersEnabled !== false);
  const overdue = live.filter((s) => daysRemaining(s.expiryDate) < 0);
  const within = live
    .filter((s) => { const d = daysRemaining(s.expiryDate); return d >= 0 && d <= 90; })
    .sort((a, b) => daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate));
  const later = services.length - overdue.length - within.length;

  return (
    <section className="mt-2 overflow-hidden border border-[#EAE5DE] bg-white shadow-[0_8px_28px_rgba(53,35,24,.035)]">
      <div className="flex items-center justify-between gap-3 px-[18px] pb-3.5 pt-[17px] max-[560px]:flex-col max-[560px]:items-stretch">
        <span className="text-sm font-bold tracking-[-.01em]">Renewal runway</span>
        <span className="text-xs text-[#81766E]">Next 90 days. Click a marker to find the service below.</span>
      </div>
      <div className="overflow-x-auto px-4 pb-4">
        {services.length === 0 ? (
          <p className="py-[30px] text-center text-[#81766E]">Nothing to plot yet.</p>
        ) : (
          <div className="grid min-w-[660px] grid-cols-[96px_1fr_84px]">
            <div className={`border-r border-dashed border-[#D8D0C7] pr-3${overdue.length ? " text-[#A8202B]" : ""}`}>
              <div className="text-[19px] font-semibold tracking-[-.02em] tabular-nums">{overdue.length}</div>
              <div className="mt-0.5 text-[11.5px] leading-[1.3] text-[#81766E]">already past<br />the expiry date</div>
              <div className="mt-2.5 flex flex-wrap gap-[5px]">
                {overdue.map((s) => (
                  <button key={s._id} className="size-[11px] cursor-pointer rounded-full border-[2.5px] border-white bg-current p-0 shadow-[0_0_0_1.5px_currentColor]" style={{ color: "#A8202B" }}
                    title={`${s.name} — overdue`} onClick={() => onPick(s._id)} aria-label={`${s.name}, overdue`} />
                ))}
              </div>
            </div>

            <div className="relative mx-3.5 h-[126px]">
              {[0, 30, 60, 90].map((t) => (
                <div key={t} className="absolute inset-y-0 bottom-5 w-px bg-[#EAE5DE] [&_span]:absolute [&_span]:-bottom-[18px] [&_span]:-translate-x-1/2 [&_span]:whitespace-nowrap [&_span]:text-[11.5px] [&_span]:text-[#81766E]" style={{ left: `${(t / 90) * 100}%` }}>
                  <span style={t === 0 ? { transform: "none" } : undefined}>{t === 0 ? "today" : `${t} days`}</span>
                </div>
              ))}
              <div className="absolute inset-x-0 bottom-5 h-px bg-[#D8D0C7]" />
              {within.map((s, i) => {
                const d = daysRemaining(s.expiryDate);
                const st = uiStatus(s, settings);
                return (
                  <div key={s._id} className={`absolute flex -translate-x-1/2 flex-col items-center${st === "SOON" ? " [&>div:first-child]:font-semibold [&>div:first-child]:text-[#261B15]" : ""}`}
                    style={{ left: `${Math.min(99, (d / 90) * 100)}%`, top: 6 + (i % 3) * 22, bottom: 20 }}>
                    <div className="mb-[5px] max-w-[120px] truncate whitespace-nowrap text-[11px] text-[#665B53]">{s.name}</div>
                    <button className="size-[11px] cursor-pointer rounded-full border-[2.5px] border-white bg-current p-0 shadow-[0_0_0_1.5px_currentColor]" style={{ color: st === "SOON" ? "#9C5A08" : "#8B6A3E" }}
                      onClick={() => onPick(s._id)} title={`${s.name} — ${d} days left`}
                      aria-label={`${s.name}, ${d} days left`} />
                    <div className="w-px flex-1 bg-[#D8D0C7]" />
                  </div>
                );
              })}
            </div>

            <div className="border-r border-dashed border-[#D8D0C7] pr-3 right">
              <div className="text-[19px] font-semibold tracking-[-.02em] tabular-nums">{later}</div>
              <div className="mt-0.5 text-[11.5px] leading-[1.3] text-[#81766E]">further out<br />or not expiring</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type SummaryTone = "emerald" | "rose" | "amber" | "blue" | "violet";

const SUMMARY_TONES: Record<SummaryTone, { card: string; icon: string; value: string }> = {
  emerald: { card: "bg-gradient-to-br from-white via-white to-emerald-50", icon: "bg-emerald-50 text-emerald-700 ring-emerald-100", value: "text-emerald-700" },
  rose: { card: "bg-gradient-to-br from-white via-white to-rose-50", icon: "bg-rose-50 text-rose-700 ring-rose-100", value: "text-rose-700" },
  amber: { card: "bg-gradient-to-br from-white via-white to-amber-50", icon: "bg-amber-50 text-amber-700 ring-amber-100", value: "text-amber-700" },
  blue: { card: "bg-gradient-to-br from-white via-white to-blue-50", icon: "bg-blue-50 text-blue-700 ring-blue-100", value: "text-blue-700" },
  violet: { card: "bg-gradient-to-br from-white via-white to-violet-50", icon: "bg-violet-50 text-violet-700 ring-violet-100", value: "text-violet-700" },
};

function SummaryCard({ title, value, label, detail, icon: Icon, tone }: {
  title: string; value: ReactNode; label: string; detail: string; icon: LucideIcon; tone: SummaryTone;
}) {
  const colors = SUMMARY_TONES[tone];
  return (
    <div className={`relative min-h-[104px] min-w-0 overflow-hidden rounded-[10px] border border-black/15 p-2.5 pb-6 shadow-[0_1px_3px_rgba(0,0,0,.02)] transition duration-150 hover:-translate-y-px hover:shadow-[0_5px_15px_rgba(15,23,42,.08)] ${colors.card}`}>
      <div className="flex items-start gap-2">
        <span className={`grid size-[30px] shrink-0 place-items-center rounded-full ring-1 ${colors.icon}`}><Icon size={15} /></span>
        <span className="min-w-0 truncate pt-0.5 text-[9px] font-semibold uppercase tracking-[.01em] text-slate-900">{title}</span>
      </div>
      <div className={`-mt-[15px] ml-[38px] text-[22px] font-semibold leading-none tracking-[-.04em] tabular-nums ${colors.value}`}>{value}</div>
      <div className={`ml-[38px] mt-1 truncate text-[9px] font-bold ${colors.value}`}>{label}</div>
      <div className="absolute inset-x-2 bottom-1 truncate text-center text-[8.5px] font-bold leading-tight text-[#293957]">{detail}</div>
    </div>
  );
}

/* --------------------------------------------------------------------- page */

export default function SystemServicesPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalService | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertDraft, setAlertDraft] = useState({ popupReminderDays: "15", emailReminderDays: "15", notifyEmails: "" });
  const [savingAlerts, setSavingAlerts] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ExternalService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toast = (text: string, type: "ok" | "err" = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };

  const load = async () => {
    setLoading(true);
    settingsApi.get().then((settingsRes) => {
      setSettings(settingsRes);
      setAlertDraft({
        popupReminderDays: String(settingsRes.systemAlerts?.popupReminderDays ?? 15),
        emailReminderDays: String(settingsRes.systemAlerts?.emailReminderDays ?? 15),
        notifyEmails: settingsRes.systemAlerts?.notifyEmails?.join(", ") ?? "",
      });
    }).catch((err) => {
      toast(errText(err, "Could not load reminder settings."), "err");
    });

    try {
      const servicesRes = await externalServiceApi.list();
      setServices(servicesRes);
    } catch (err) {
      toast(errText(err, "Could not load System & Security data."), "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setFormOpen(true); };

  const openEdit = (s: ExternalService) => {
    setEditing(s);
    setForm({
      category: s.category,
      name: s.name,
      provider: s.provider ?? "",
      accountIdentifier: s.accountIdentifier ?? "",
      loginUrl: s.loginUrl ?? "",
      secretLabel: s.secretLabel ?? "",
      secretValue: s.secretValue ?? "",
      startDate: s.startDate ? s.startDate.slice(0, 10) : "",
      expiryDate: s.expiryDate ? s.expiryDate.slice(0, 10) : "",
      autoRenews: s.autoRenews ?? false,
      notes: s.notes ?? "",
      popupReminderDays: s.popupReminderDays != null ? String(s.popupReminderDays) : "",
      emailReminderDays: s.emailReminderDays != null ? String(s.emailReminderDays) : "",
      notifyEmails: s.notifyEmails?.join(", ") ?? "",
      remindersEnabled: s.remindersEnabled ?? true,
      pricingType: s.pricingType ?? "PAID",
      costAmount: s.costAmount != null ? String(s.costAmount) : "",
      currency: s.currency ?? "INR",
      billingCycle: s.billingCycle ?? "",
      receipts: s.receipts ?? [],
    });
    setFormOpen(true);
  };

  const toPayload = (f: FormState): Partial<ExternalService> => ({
    category: f.category,
    name: f.name.trim(),
    provider: f.provider.trim() || undefined,
    accountIdentifier: f.accountIdentifier.trim() || undefined,
    loginUrl: f.loginUrl.trim() || undefined,
    secretLabel: f.secretLabel.trim() || undefined,
    secretValue: f.secretValue || undefined,
    startDate: f.startDate || undefined,
    expiryDate: f.expiryDate,
    autoRenews: f.autoRenews,
    notes: f.notes.trim() || undefined,
    popupReminderDays: f.popupReminderDays ? Number(f.popupReminderDays) : undefined,
    emailReminderDays: f.emailReminderDays ? Number(f.emailReminderDays) : undefined,
    notifyEmails: f.notifyEmails.split(",").map((e) => e.trim()).filter(Boolean),
    remindersEnabled: f.remindersEnabled,
    pricingType: f.pricingType,
    costAmount: f.pricingType === "PAID" && f.costAmount ? Number(f.costAmount) : undefined,
    currency: f.pricingType === "PAID" ? f.currency.trim() || "INR" : undefined,
    billingCycle: f.pricingType === "PAID" && f.billingCycle ? f.billingCycle : undefined,
    receipts: f.receipts,
  });

  const save = async () => {
    if (!form.name.trim()) { toast("Give the service a name first.", "err"); return; }
    if (!form.expiryDate) { toast("An expiry date is required — it drives every reminder.", "err"); return; }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editing) {
        const updated = await externalServiceApi.update(editing._id, payload);
        setServices((p) => p.map((s) => (s._id === updated._id ? updated : s)));
        toast(`Saved ${updated.name}.`);
      } else {
        const created = await externalServiceApi.create(payload);
        setServices((p) => [...p, created]);
        setHighlight(created._id);
        toast(`Added ${created.name}.`);
      }
      setFormOpen(false);
    } catch (err) {
      toast(errText(err, "Could not save this service."), "err");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await externalServiceApi.remove(deleteTarget._id);
      setServices((p) => p.filter((s) => s._id !== deleteTarget._id));
      toast(`Removed ${deleteTarget.name}.`);
      setDeleteTarget(null);
    } catch (err) {
      toast(errText(err, "Could not delete this service."), "err");
    } finally {
      setDeleting(false);
    }
  };

  const addReceipt = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadApi.file(file, "moksha-sewa/system-services");
      const receipt: ExternalServiceReceipt = { url: result.url, label: file.name, uploadedAt: new Date().toISOString() };
      setForm((p) => ({ ...p, receipts: [...p.receipts, receipt] }));
      toast("Bill attached.");
    } catch (err) {
      toast(errText(err, "Could not upload the receipt."), "err");
    } finally {
      setUploading(false);
    }
  };

  const saveAlertDefaults = async () => {
    if (!settings) return;
    setSavingAlerts(true);
    try {
      const updated = await settingsApi.update({
        ...settings,
        systemAlerts: {
          popupReminderDays: Number(alertDraft.popupReminderDays) || 15,
          emailReminderDays: Number(alertDraft.emailReminderDays) || 15,
          notifyEmails: alertDraft.notifyEmails.split(",").map((e) => e.trim()).filter(Boolean),
        },
      });
      setSettings(updated);
      setAlertOpen(false);
      toast("Reminder defaults saved.");
    } catch (err) {
      toast(errText(err, "Could not save the defaults."), "err");
    } finally {
      setSavingAlerts(false);
    }
  };

  const pick = (id: string) => {
    setHighlight(id);
    document.getElementById(`svc-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(() => setHighlight(null), 1400);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services
      .filter((s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.provider ?? "").toLowerCase().includes(q) ||
        (CAT_LABEL[s.category] ?? "").toLowerCase().includes(q))
      .sort((a, b) => daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate));
  }, [services, query]);

  const groups = useMemo(() => {
    const g: Record<GroupKey, ExternalService[]> = { EXPIRED: [], SOON: [], LATER: [], MUTED: [] };
    filtered.forEach((s) => {
      const st = uiStatus(s, settings);
      if (st === "MUTED") g.MUTED.push(s);
      else if (st === "EXPIRED") g.EXPIRED.push(s);
      else if (st === "SOON") g.SOON.push(s);
      else g.LATER.push(s);
    });
    return g;
  }, [filtered, settings]);

  const overdueCount = services.filter((s) => uiStatus(s, settings) === "EXPIRED").length;
  const soonCount = services.filter((s) => uiStatus(s, settings) === "SOON").length;
  const paidServices = services.filter((s) => s.pricingType === "PAID" && !!s.costAmount);
  const monthlyServices = paidServices.filter((s) => s.billingCycle === "MONTHLY");
  const yearlyServices = paidServices.filter((s) => s.billingCycle === "YEARLY");
  const monthlyTotal = monthlyServices.reduce((sum, s) => sum + Number(s.costAmount || 0), 0);
  const yearlyTotal = yearlyServices.reduce((sum, s) => sum + Number(s.costAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F5F1] px-6 pb-24 pt-8 text-[13px] capitalize leading-[1.45] text-[#261B15] antialiased max-[820px]:px-3.5 max-[820px]:pb-20 max-[820px]:pt-[18px]">
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-center justify-between gap-5 px-0.5 pb-0.5 pt-1 max-[560px]:items-stretch">
          <div>
            <h1 className="m-0 font-serif text-[30px] font-medium leading-[1.12] tracking-[-.035em] max-[560px]:text-[26px]">System &amp; Security</h1>
          </div>
          <div className="flex gap-2 max-[560px]:w-full [&_button]:max-[560px]:flex-1">
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-bold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => setAlertOpen(true)} disabled={!settings}>
              <BellRing size={14} /> Reminder Defaults
            </button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#8B6A3E] bg-[#8B6A3E] px-[15px] py-2 text-[12.5px] font-bold leading-none text-white shadow-[0_4px_12px_rgba(104,74,41,.16)] transition hover:-translate-y-px hover:border-[#684A29] hover:bg-[#684A29] hover:shadow-[0_6px_16px_rgba(104,74,41,.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [&_svg]:shrink-0" onClick={openAdd}><Plus size={14} /> Add Service</button>
          </div>
        </header>

        <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard title="Inventory" value={loading ? "—" : services.length} label="Services tracked" detail={loading ? "Loading service data" : `${paidServices.length} paid · ${services.length - paidServices.length} free`} icon={Package} tone="emerald" />
          <SummaryCard title="Attention" value={loading ? "—" : overdueCount} label="Past due" detail={overdueCount ? "Immediate action required" : "No overdue renewals"} icon={AlertTriangle} tone="rose" />
          <SummaryCard title="Upcoming" value={loading ? "—" : soonCount} label="Renewing soon" detail="Inside the reminder window" icon={BellRing} tone="amber" />
          <SummaryCard title="Monthly" value={loading ? "—" : inr(monthlyTotal)} label="Monthly billing" detail={`${monthlyServices.length} monthly ${monthlyServices.length === 1 ? "subscription" : "subscriptions"}`} icon={CreditCard} tone="blue" />
          <SummaryCard title="Yearly" value={loading ? "—" : inr(yearlyTotal)} label="Annual billing" detail={`${yearlyServices.length} yearly ${yearlyServices.length === 1 ? "subscription" : "subscriptions"}`} icon={BarChart3} tone="violet" />
        </div>

        {!loading && <Runway services={services} settings={settings} onPick={pick} />}

        <section className="mt-2 overflow-hidden border border-[#EAE5DE] bg-white shadow-[0_8px_28px_rgba(53,35,24,.035)]">
          <div className="flex items-center justify-between gap-3 px-[18px] pb-3.5 pt-[17px] max-[560px]:flex-col max-[560px]:items-stretch">
            <span className="text-sm font-bold tracking-[-.01em]">Tracked services</span>
            <div className="relative">
              <Search size={14} className="absolute left-[9px] top-[9px] text-[#81766E]" />
              <input className="w-[210px] rounded-lg border border-[#D8D0C7] bg-white py-2 pl-7 pr-2.5 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD] max-[560px]:w-full" placeholder="Search name or provider"
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="grid min-h-16 grid-cols-[4px_1.6fr_.9fr_.8fr_.9fr_84px] items-center gap-3.5 border-t border-[#EAE5DE] pr-[18px] transition-colors hover:bg-[#FCFBF9] max-[820px]:grid-cols-[4px_1fr_auto_76px] max-[820px]:pr-2.5 max-[560px]:grid-cols-[4px_1fr_auto] max-[560px]:pr-3 min-h-[34px] text-[11.5px] text-[#81766E]">
            <span />
            <span>Service</span>
            <span className="max-[820px]:hidden">Category</span>
            <span className="max-[820px]:hidden">Cost</span>
            <span>Time left</span>
            <span className="text-right max-[820px]:hidden">Actions</span>
          </div>

          {loading && [0, 1, 2, 3].map((i) => (
            <div className="grid min-h-16 grid-cols-[4px_1.6fr_.9fr_.8fr_.9fr_84px] items-center gap-3.5 border-t border-[#EAE5DE] pr-[18px] transition-colors hover:bg-[#FCFBF9] max-[820px]:grid-cols-[4px_1fr_auto_76px] max-[820px]:pr-2.5 max-[560px]:grid-cols-[4px_1fr_auto] max-[560px]:pr-3" key={i}>
              <div className="self-stretch bg-[#EAE5DE]" />
              <div className="flex items-center gap-2.5">
                <span className="block size-[30px] animate-pulse rounded-lg bg-[#EDF1EF]" />
                <span className="block h-3 w-[150px] animate-pulse rounded-md bg-[#EDF1EF]" />
              </div>
              <div className="max-[820px]:hidden"><span className="block h-3 w-20 animate-pulse rounded-md bg-[#EDF1EF]" /></div>
              <div className="max-[820px]:hidden"><span className="block h-3 w-[60px] animate-pulse rounded-md bg-[#EDF1EF]" /></div>
              <div><span className="block h-3 w-[90px] animate-pulse rounded-md bg-[#EDF1EF]" /></div>
              <div />
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="border-t border-[#EAE5DE] px-4 py-11 text-center text-[#665B53]">
              {query
                ? <>Nothing matches “{query}”.</>
                : <>Nothing tracked yet. Start with the domain — it&apos;s the one that takes the site down.</>}
            </div>
          )}

          {!loading && GROUP_ORDER.map((key) => {
            const rows = groups[key];
            if (!rows.length) return null;
            return (
              <div key={key}>
                <div className="flex items-center gap-2 border-t border-[#EAE5DE] bg-[#FAF8F5] px-4 pb-[7px] pt-[9px] text-xs text-[#665B53] [&_b]:font-semibold [&_b]:text-[#261B15] [&_.pill]:ml-auto [&_.pill]:text-[#81766E] [&_.pill]:tabular-nums">
                  <b>{GROUP_META[key].label}</b>
                  <span>{GROUP_META[key].note}</span>
                  <span className="pill">{rows.length}</span>
                </div>
                {rows.map((s) => {
                  const st = uiStatus(s, settings);
                  const Icon = CAT_ICON[s.category] ?? Package;
                  return (
                    <div key={s._id} id={`svc-${s._id}`} className={`group grid min-h-16 grid-cols-[4px_1.6fr_.9fr_.8fr_.9fr_84px] items-center gap-3.5 border-t border-[#EAE5DE] pr-[18px] transition-colors hover:bg-[#FCFBF9] max-[820px]:grid-cols-[4px_1fr_auto_76px] max-[820px]:pr-2.5 max-[560px]:grid-cols-[4px_1fr_auto] max-[560px]:pr-3${highlight === s._id ? " animate-pulse bg-[#F5ECDD]" : ""}`}>
                      <div className={`self-stretch ${railClass(st)}`} />
                      <div className="flex min-w-0 items-center gap-2.5 [&_p]:m-0 [&_p]:truncate [&_p]:font-semibold [&_small]:text-[11.5px] [&_small]:text-[#81766E]">
                        <span className={`flex size-[34px] shrink-0 items-center justify-center rounded-[10px] ${st === "EXPIRED" ? "bg-[#FAE7E7] text-[#A8202B]" : st === "SOON" ? "bg-[#FAEEDA] text-[#9C5A08]" : "bg-[#F5ECDD] text-[#684A29]"}`}>
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0">
                          <p>{s.name}</p>
                          <small>
                            {s.provider || CAT_LABEL[s.category]}
                            {s.autoRenews ? " · auto-renews" : ""}
                          </small>
                        </div>
                      </div>

                      <div className="truncate whitespace-nowrap text-[#665B53] max-[820px]:hidden">{CAT_LABEL[s.category]}</div>

                      <div className="max-[820px]:hidden">
                        {s.pricingType === "FREE" ? (
                          <span className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-full bg-[#F5ECDD] px-2 py-0.5 text-[11.5px] font-medium text-[#684A29]">Free</span>
                        ) : s.costAmount != null ? (
                          <span className="whitespace-nowrap text-xs tracking-[-.01em] tabular-nums">
                            {s.currency && s.currency !== "INR" ? `${s.currency} ${s.costAmount.toLocaleString("en-IN")}` : inr(s.costAmount)}
                            <span className="text-[#81766E]">
                              {s.billingCycle && s.billingCycle !== "ONE_TIME" ? ` /${CYCLE[s.billingCycle].slice(0, 2)}` : ""}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[#81766E]">amount not set</span>
                        )}
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        <Countdown expiryDate={s.expiryDate} status={st} />
                        {st === "MUTED" && <BellOff size={13} className="text-[#81766E]" aria-label="Reminders off" />}
                      </div>

                      <div className="flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-[820px]:opacity-100 max-[560px]:col-span-full max-[560px]:justify-start max-[560px]:pb-2">
                        {s.loginUrl && (
                          <a className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" href={s.loginUrl} target="_blank" rel="noreferrer" title="Open provider dashboard">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" onClick={() => openEdit(s)} title="Edit"><Pencil size={14} /></button>
                        <button className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15] hover:!bg-[#FAE7E7] hover:!text-[#A8202B]" onClick={() => setDeleteTarget(s)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>
      </div>

      {/* add / edit */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Add a service"}
        width={620}
        footer={
          <>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-bold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#8B6A3E] bg-[#8B6A3E] px-[15px] py-2 text-[12.5px] font-bold leading-none text-white shadow-[0_4px_12px_rgba(104,74,41,.16)] transition hover:-translate-y-px hover:border-[#684A29] hover:bg-[#684A29] hover:shadow-[0_6px_16px_rgba(104,74,41,.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [&_svg]:shrink-0" onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add service"}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-1">
            <Field label="Category">
              <select className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ExternalServiceCategory })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Name">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.name} placeholder="Domain — mokshasewa.org"
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Provider">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.provider} placeholder="GoDaddy, Razorpay, Cloudinary"
                onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </Field>
            <Field label="Account" hint="Login email, username or account id">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.accountIdentifier}
                onChange={(e) => setForm({ ...form, accountIdentifier: e.target.value })} />
            </Field>
            <Field label="Dashboard URL">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.loginUrl} placeholder="https://dashboard.provider.com"
                onChange={(e) => setForm({ ...form, loginUrl: e.target.value })} />
            </Field>
            <Field label="Credential name">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.secretLabel} placeholder="API secret, SMTP password"
                onChange={(e) => setForm({ ...form, secretLabel: e.target.value })} />
            </Field>
          </div>

          <Field label="Credential value" hint="Stored encrypted. Anyone with access to this page can read it.">
            <textarea className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" rows={2} value={form.secretValue}
              onChange={(e) => setForm({ ...form, secretValue: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-1">
            <Field label="Started on">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Expires on" hint="Drives the countdown and every reminder">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="date" value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </Field>
          </div>

          <div className="rounded-[10px] border border-[#EAE5DE] p-[13px]">
            <p className="mb-2.5 text-xs font-semibold">Cost</p>
            <div className="inline-flex rounded-lg border border-[#EAE5DE] bg-[#FAF8F5] p-0.5 [&_button]:rounded-md [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-3.5 [&_button]:py-[5px] [&_button]:text-[12.5px] [&_button]:font-semibold [&_button]:text-[#665B53] [&_button[aria-pressed=true]]:bg-white [&_button[aria-pressed=true]]:text-[#261B15] [&_button[aria-pressed=true]]:shadow-sm" role="group" aria-label="Pricing">
              {(["FREE", "PAID"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={form.pricingType === v}
                  onClick={() => setForm({ ...form, pricingType: v })}>
                  {v === "FREE" ? "Free" : "Paid"}
                </button>
              ))}
            </div>
            {form.pricingType === "PAID" && (
              <div className="mt-3 grid grid-cols-3 gap-3 max-[820px]:grid-cols-1">
                <Field label="Currency">
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                </Field>
                <Field label="Amount">
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={form.costAmount} placeholder="999"
                    onChange={(e) => setForm({ ...form, costAmount: e.target.value })} />
                </Field>
                <Field label="Billed">
                  <select className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value as ExternalServiceBillingCycle | "" })}>
                    <option value="">Choose</option>
                    {(Object.keys(CYCLE) as ExternalServiceBillingCycle[]).map((v) => (
                      <option key={v} value={v}>{CYCLE[v]}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-[#EAE5DE] p-[13px]">
            <div className="flex items-center justify-between">
              <p className="m-0 text-xs font-semibold">Bills and receipts</p>
              <button type="button" className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-bold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload size={13} /> {uploading ? "Uploading…" : "Attach"}
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={addReceipt} />
            </div>
            {form.receipts.length === 0 ? (
              <p className="mt-2 block text-[11.5px] text-[#81766E]">
                Nothing attached. Add the last invoice so the next renewal has a reference.
              </p>
            ) : form.receipts.map((r) => (
              <div className="mt-1.5 flex items-center justify-between gap-2 rounded-[7px] bg-[#FAF8F5] py-1.5 pl-2.5 pr-2 [&_a]:flex [&_a]:min-w-0 [&_a]:items-center [&_a]:gap-[7px] [&_a]:text-[12.5px] [&_a]:font-medium [&_a]:text-[#684A29] hover:[&_a]:underline" key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  <FileText size={13} />
                  <span className="truncate whitespace-nowrap">{r.label || "Receipt"}</span>
                </a>
                <button type="button" className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" aria-label={`Remove ${r.label}`}
                  onClick={() => setForm((p) => ({ ...p, receipts: p.receipts.filter((x) => x.url !== r.url) }))}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-[10px] border border-[#EAE5DE] p-[13px]">
            <label className="flex items-start gap-[9px] text-[13px] font-medium [&_input]:mt-0.5 [&_input]:size-[15px] [&_input]:accent-[#8B6A3E]">
              <input type="checkbox" checked={form.remindersEnabled}
                onChange={(e) => setForm({ ...form, remindersEnabled: e.target.checked })} />
              <span>
                Remind us before this expires
                <span className="mt-1 block text-[11.5px] font-normal text-[#81766E]">
                  Turn it off for something that never really expires. It stays listed here, just without the
                  popup, the topbar alert and the email.
                </span>
              </span>
            </label>
            {form.remindersEnabled && (
              <div className="mt-3 grid grid-cols-3 gap-3 max-[820px]:grid-cols-1">
                <Field label="Popup, days before" hint={`Blank = ${settings?.systemAlerts?.popupReminderDays ?? 15}`}>
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={form.popupReminderDays}
                    onChange={(e) => setForm({ ...form, popupReminderDays: e.target.value })} />
                </Field>
                <Field label="Email, days before" hint={`Blank = ${settings?.systemAlerts?.emailReminderDays ?? 15}`}>
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={form.emailReminderDays}
                    onChange={(e) => setForm({ ...form, emailReminderDays: e.target.value })} />
                </Field>
                <Field label="Email these people" hint="Blank = default list">
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.notifyEmails}
                    onChange={(e) => setForm({ ...form, notifyEmails: e.target.value })} />
                </Field>
              </div>
            )}
          </div>

          <Field label="Notes">
            <textarea className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          <label className="flex items-start gap-[9px] text-[13px] font-medium [&_input]:mt-0.5 [&_input]:size-[15px] [&_input]:accent-[#8B6A3E]">
            <input type="checkbox" checked={form.autoRenews}
              onChange={(e) => setForm({ ...form, autoRenews: e.target.checked })} />
            <span>Renews automatically on the card on file</span>
          </label>
        </div>
      </Modal>

      {/* reminder defaults */}
      <Modal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Reminder defaults"
        width={440}
        footer={
          <>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-bold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => setAlertOpen(false)}>Cancel</button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#8B6A3E] bg-[#8B6A3E] px-[15px] py-2 text-[12.5px] font-bold leading-none text-white shadow-[0_4px_12px_rgba(104,74,41,.16)] transition hover:-translate-y-px hover:border-[#684A29] hover:bg-[#684A29] hover:shadow-[0_6px_16px_rgba(104,74,41,.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [&_svg]:shrink-0" onClick={saveAlertDefaults} disabled={savingAlerts}>
              {savingAlerts ? "Saving…" : "Save defaults"}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <p className="mt-0 block text-[11.5px] text-[#81766E]">Applied to every service that doesn&apos;t set its own.</p>
          <Field label="Show the popup this many days before expiry">
            <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={alertDraft.popupReminderDays}
              onChange={(e) => setAlertDraft({ ...alertDraft, popupReminderDays: e.target.value })} />
          </Field>
          <Field label="Send the email this many days before expiry">
            <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={alertDraft.emailReminderDays}
              onChange={(e) => setAlertDraft({ ...alertDraft, emailReminderDays: e.target.value })} />
          </Field>
          <Field label="Send it to" hint="Separate addresses with a comma">
            <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" placeholder="ops@mokshasewa.org, admin@mokshasewa.org"
              value={alertDraft.notifyEmails}
              onChange={(e) => setAlertDraft({ ...alertDraft, notifyEmails: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* delete */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this service?"
        width={420}
        footer={
          <>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-bold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => setDeleteTarget(null)}>Keep it</button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#A8202B] bg-[#A8202B] px-[15px] py-2 text-[12.5px] font-bold leading-none text-white transition hover:-translate-y-px hover:bg-[#8A1A23] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={confirmDelete} disabled={deleting}>
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <div className="flex gap-[11px]">
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#FAE7E7] text-[#A8202B]">
            <AlertTriangle size={15} />
          </span>
          <div>
            <p className="m-0 font-semibold">{deleteTarget?.name}</p>
            <p className="mb-0 mt-1 text-[#665B53]">
              Its expiry date, credentials and attached bills go with it. If you only want the reminders to stop,
              edit the service and switch reminders off instead.
            </p>
          </div>
        </div>
      </Modal>

      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex max-w-[330px] items-start gap-[9px] rounded-[10px] px-[13px] py-[11px] text-[12.5px] font-medium text-[#EAF2EE] shadow-[0_12px_30px_rgba(10,25,20,.3)] [&_.ic]:mt-px [&_.ic]:shrink-0 ${t.type === "err" ? "bg-[#A8202B]" : "bg-[#15211D]"}`}>
            <span className="ic">{t.type === "err" ? <AlertTriangle size={14} /> : <Check size={14} />}</span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
