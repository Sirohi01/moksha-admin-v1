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

/* -------------------------------------------------------------------- types */

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

/* ------------------------------------------------------------------- styles */

const CSS = `
.ms {
  --paper:#F7F5F1; --card:#FFFFFF; --sunken:#FAF8F5;
  --ink:#261B15; --ink2:#665B53; --ink3:#81766E;
  --line:#EAE5DE; --line-strong:#D8D0C7;
  --teal:#8B6A3E; --teal-ink:#684A29; --teal-soft:#F5ECDD;
  --amber:#9C5A08; --amber-soft:#FAEEDA;
  --red:#A8202B; --red-soft:#FAE7E7;
  color:var(--ink); background:var(--paper);
  min-height:100vh; padding:32px 24px 96px;
  font-size:13px; line-height:1.45;
  -webkit-font-smoothing:antialiased;
}
.ms *{box-sizing:border-box;}
.ms :focus-visible{outline:2px solid var(--teal); outline-offset:2px; border-radius:4px;}
.ms button{font:inherit; color:inherit; cursor:pointer;}
.ms-wrap{max-width:1240px; margin:0 auto;}

.ms-head{display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:20px;
  padding:4px 2px 2px;}
.ms-eyebrow{display:flex;align-items:center;gap:7px;margin:0 0 8px;color:var(--teal);font-size:11px;
  font-weight:700;letter-spacing:.12em;text-transform:uppercase;}
.ms-eyebrow:before{content:"";width:20px;height:1px;background:currentColor;}
.ms-title{font-family:Georgia,serif;font-size:30px; line-height:1.12; font-weight:700; letter-spacing:-.035em; margin:0;}
.ms-sub{margin:7px 0 0; color:var(--ink2); max-width:62ch;font-size:13px;}
.ms-headbtns{display:flex; gap:8px;}

.ms-figs{display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); margin-top:14px;
  background:var(--card); border:1px solid var(--line); border-radius:0; overflow:hidden;
  box-shadow:0 10px 30px rgba(53,35,24,.045);}
.ms-fig{position:relative;padding:11px 16px 12px; border-left:1px solid var(--line);min-width:0;}
.ms-fig:after{content:"";position:absolute;left:18px;bottom:0;width:32px;height:2px;border-radius:2px;background:var(--teal);opacity:.5;}
.ms-fig:first-child{border-left:0;}
.ms-fig-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;}
.ms-fig-icon{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:var(--teal-soft);color:var(--teal);}
.ms-fig-kicker{color:var(--ink3);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
.ms-fig-v{font-size:21px;line-height:1.1;font-weight:700; letter-spacing:-.035em; font-variant-numeric:tabular-nums;}
.ms-fig-l{color:var(--ink2); font-size:11px; margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ms-fig-detail{color:var(--ink3);font-size:10px;margin-top:6px;padding-top:6px;border-top:1px solid var(--line);line-height:1.25;}
.ms-fig.alarm .ms-fig-v{color:var(--red);}
.ms-fig.alarm .ms-fig-icon{background:var(--red-soft);color:var(--red);}
.ms-fig.warn .ms-fig-v{color:var(--amber);}
.ms-fig.warn .ms-fig-icon{background:var(--amber-soft);color:var(--amber);}

.ms-panel{background:var(--card); border:1px solid var(--line); border-radius:0; margin-top:8px;
  overflow:hidden;box-shadow:0 8px 28px rgba(53,35,24,.035);}
.ms-panel-head{display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 18px 14px;}
.ms-panel-title{font-size:14px; font-weight:700;letter-spacing:-.01em;}
.ms-panel-note{color:var(--ink3); font-size:12px;}

.ms-runway-scroll{overflow-x:auto; padding:0 16px 16px;}
.ms-runway{min-width:660px; display:grid; grid-template-columns:96px 1fr 84px;}
.ms-gutter{border-right:1px dashed var(--line-strong); padding-right:12px;}
.ms-gutter.right{border-right:0; border-left:1px dashed var(--line-strong); padding-right:0; padding-left:12px;}
.ms-gutter-n{font-size:19px; font-weight:600; font-variant-numeric:tabular-nums; letter-spacing:-.02em;}
.ms-gutter-l{font-size:11.5px; color:var(--ink3); line-height:1.3; margin-top:2px;}
.ms-gutter.overdue .ms-gutter-n{color:var(--red);}
.ms-rail{position:relative; height:126px; margin:0 14px;}
.ms-tick{position:absolute; top:0; bottom:20px; width:1px; background:var(--line);}
.ms-tick span{position:absolute; bottom:-18px; transform:translateX(-50%); font-size:11.5px; color:var(--ink3); white-space:nowrap;}
.ms-base{position:absolute; left:0; right:0; bottom:20px; height:1px; background:var(--line-strong);}
.ms-mark{position:absolute; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center;}
.ms-stem{width:1px; background:var(--line-strong); flex:1;}
.ms-dot{width:11px; height:11px; border-radius:50%; border:2.5px solid var(--card); cursor:pointer;
  box-shadow:0 0 0 1.5px currentColor; background:currentColor; padding:0;}
.ms-mark-lab{font-size:11px; color:var(--ink2); white-space:nowrap; margin-bottom:5px; max-width:120px;
  overflow:hidden; text-overflow:ellipsis;}
.ms-mark.hot .ms-mark-lab{color:var(--ink); font-weight:600;}
.ms-runway-empty{padding:26px 0 34px; color:var(--ink3); text-align:center;}

.ms-row{display:grid; grid-template-columns:4px 1.6fr .9fr .8fr .9fr 84px; align-items:center;
  gap:14px; padding:0 18px 0 0; border-top:1px solid var(--line); min-height:64px;transition:background .15s ease;}
.ms-row:not(.ms-row-head):hover{background:#FCFBF9;}
.ms-row-head{min-height:34px; color:var(--ink3); font-size:11.5px;}
.ms-rail-cell{align-self:stretch;}
.ms-group{display:flex; align-items:center; gap:8px; padding:9px 16px 7px; background:var(--sunken);
  border-top:1px solid var(--line); font-size:12px; color:var(--ink2);}
.ms-group b{font-weight:600; color:var(--ink);}
.ms-group .pill{margin-left:auto; font-variant-numeric:tabular-nums; color:var(--ink3);}
.ms-name{display:flex; align-items:center; gap:10px; min-width:0;}
.ms-ico{width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  flex:none; background:var(--teal-soft); color:var(--teal-ink);}
.ms-name p{margin:0; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.ms-name small{color:var(--ink3); font-size:11.5px;}
.ms-cat{color:var(--ink2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.ms-mono{font-variant-numeric:tabular-nums; font-size:12px; white-space:nowrap; letter-spacing:-.01em;}
.ms-actions{display:flex; justify-content:flex-end; gap:2px; opacity:0; transition:opacity .12s;}
.ms-row:hover .ms-actions, .ms-row:focus-within .ms-actions{opacity:1;}
.ms-iconbtn{width:28px; height:28px; border:0; background:transparent; border-radius:7px; color:var(--ink3);
  display:flex; align-items:center; justify-content:center;}
.ms-iconbtn:hover{background:var(--sunken); color:var(--ink);}
.ms-iconbtn.danger:hover{background:var(--red-soft); color:var(--red);}
.ms-flash{animation:msflash 1.1s ease-out;}
@keyframes msflash{0%{background:var(--teal-soft);}100%{background:transparent;}}
.ms-empty{padding:44px 16px; text-align:center; color:var(--ink2); border-top:1px solid var(--line);}
.ms-skel{height:12px; border-radius:6px; background:linear-gradient(90deg,var(--sunken),#EDF1EF,var(--sunken));
  background-size:200% 100%; animation:msskel 1.2s linear infinite;}
@keyframes msskel{from{background-position:200% 0}to{background-position:-200% 0}}

.ms-chip{display:inline-flex; align-items:center; gap:5px; padding:2px 8px; border-radius:999px;
  font-size:11.5px; font-weight:500; white-space:nowrap;}
.ms-chip.ok{background:var(--teal-soft); color:var(--teal-ink);}

.ms .ms-btn{min-height:38px;display:inline-flex; align-items:center; justify-content:center; gap:7px;
  border-radius:10px; padding:8px 15px; font-size:12.5px; line-height:1; font-weight:700;
  border:1px solid var(--teal); background:var(--teal); color:#fff;
  box-shadow:0 4px 12px rgba(104,74,41,.16); transition:background .15s,border-color .15s,box-shadow .15s,transform .15s;}
.ms .ms-btn svg{flex:none;stroke-width:2.2;}
.ms .ms-btn:hover{background:var(--teal-ink);border-color:var(--teal-ink);color:#fff;
  box-shadow:0 6px 16px rgba(104,74,41,.22);transform:translateY(-1px);}
.ms .ms-btn:active{transform:translateY(0);box-shadow:0 2px 7px rgba(104,74,41,.16);}
.ms .ms-btn.ghost{background:var(--card); border-color:var(--line-strong); color:var(--ink);box-shadow:none;}
.ms .ms-btn.ghost:hover{background:var(--sunken);border-color:#C3B8AC;color:var(--ink);box-shadow:none;}
.ms .ms-btn.danger{background:var(--red);border-color:var(--red);color:#fff;}
.ms .ms-btn.danger:hover{background:#8A1A23;border-color:#8A1A23;color:#fff;}
.ms .ms-btn:disabled{opacity:.5; cursor:not-allowed;transform:none;box-shadow:none;}

.ms-field{display:block;}
.ms-label{display:block; font-size:12px; font-weight:500; color:var(--ink2); margin-bottom:5px;}
.ms-input{width:100%; border:1px solid var(--line-strong); background:var(--card); border-radius:8px;
  padding:8px 10px; font:inherit; font-size:13px; color:var(--ink);}
.ms-input::placeholder{color:var(--ink3);}
.ms-input:focus{outline:none; border-color:var(--teal); box-shadow:0 0 0 3px var(--teal-soft);}
.ms-hint{display:block; font-size:11.5px; color:var(--ink3); margin-top:4px;}
.ms-grid2{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.ms-grid3{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.ms-box{border:1px solid var(--line); border-radius:10px; padding:13px;}
.ms-box-t{font-size:12px; font-weight:600; margin:0 0 10px;}
.ms-check{display:flex; align-items:flex-start; gap:9px; font-size:13px; font-weight:500;}
.ms-check input{margin-top:2px; accent-color:var(--teal); width:15px; height:15px;}
.ms-seg{display:inline-flex; background:var(--sunken); border:1px solid var(--line); border-radius:8px; padding:2px;}
.ms-seg button{border:0; background:transparent; border-radius:6px; padding:5px 14px; font-size:12.5px; font-weight:600; color:var(--ink2);}
.ms-seg button[aria-pressed="true"]{background:var(--card); color:var(--ink); box-shadow:0 1px 2px rgba(20,40,32,.12);}
.ms-file{display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--sunken);
  border-radius:7px; padding:6px 8px 6px 10px; margin-top:6px;}
.ms-file a{display:flex; align-items:center; gap:7px; color:var(--teal-ink); font-weight:500; font-size:12.5px;
  text-decoration:none; min-width:0;}
.ms-file a:hover{text-decoration:underline;}

.ms-overlay{position:fixed; inset:0; background:rgba(14,28,23,.45); backdrop-filter:blur(2px);
  display:flex; align-items:center; justify-content:center; padding:20px; z-index:50; animation:msfade .12s ease-out;}
.ms-modal{background:var(--card); border:1px solid rgba(255,255,255,.7); border-radius:18px; width:100%; max-height:88vh; display:flex;
  flex-direction:column; box-shadow:0 24px 60px rgba(10,25,20,.28); animation:msrise .14s ease-out;}
.ms-modal-h{display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid var(--line);}
.ms-modal-h h3{margin:0; font-size:15px; font-weight:600; letter-spacing:-.01em;}
.ms-modal-b{padding:16px 18px; overflow-y:auto;}
.ms-modal-f{display:flex; justify-content:flex-end; gap:8px; padding:13px 18px; border-top:1px solid var(--line);}
@keyframes msfade{from{opacity:0}to{opacity:1}}
@keyframes msrise{from{opacity:0; transform:translateY(8px) scale(.99)}to{opacity:1; transform:none}}

.ms-toasts{position:fixed; right:20px; bottom:20px; display:flex; flex-direction:column; gap:8px; z-index:60;}
.ms-toast{display:flex; align-items:flex-start; gap:9px; background:#15211D; color:#EAF2EE;
  border-radius:10px; padding:11px 13px; font-size:12.5px; font-weight:500; max-width:330px;
  box-shadow:0 12px 30px rgba(10,25,20,.3); animation:mstoast .16s ease-out;}
.ms-toast .ic{flex:none; margin-top:1px;}
.ms-toast.err{background:#A8202B;}
@keyframes mstoast{from{opacity:0; transform:translateY(10px)}to{opacity:1; transform:none}}

@media (max-width:820px){
  .ms{padding:18px 14px 80px;}
  .ms-figs{grid-template-columns:1fr 1fr;}
  .ms-fig:nth-child(3){border-left:0;}
  .ms-fig:nth-child(n+3){border-top:1px solid var(--line);}
  .ms-fig:last-child{grid-column:1 / -1;border-left:0;}
  .ms-row{grid-template-columns:4px 1fr auto 76px; padding-right:10px;}
  .ms-hide-sm{display:none;}
  .ms-actions{opacity:1;}
  .ms-grid2,.ms-grid3{grid-template-columns:1fr;}
}
@media (max-width:560px){
  .ms-head{align-items:stretch}.ms-headbtns{width:100%}.ms-headbtns .ms-btn{flex:1}
  .ms-title{font-size:26px}.ms-panel-head{align-items:stretch;flex-direction:column}
  .ms-panel-head .ms-input{width:100%!important}.ms-row{grid-template-columns:4px 1fr auto;padding-right:12px}
  .ms-actions{grid-column:2 / -1;justify-content:flex-start;padding-bottom:8px}.ms-row-head span:last-child{display:none}
}
@media (prefers-reduced-motion:reduce){ .ms *{animation:none !important; transition:none !important;} }
`;

/* ------------------------------------------------------------------ statics */

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

const railColor = (st: UIStatus): string =>
  st === "EXPIRED" ? "var(--red)" : st === "SOON" ? "var(--amber)" : st === "MUTED" ? "var(--line-strong)" : "var(--teal)";

const inr = (n: number): string => "₹" + Number(n || 0).toLocaleString("en-IN");

const errText = (err: unknown, fallback: string): string =>
  err instanceof ApiRequestError ? err.message : fallback;

/* --------------------------------------------------------------- primitives */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="ms-field">
      <span className="ms-label">{label}</span>
      {children}
      {hint && <span className="ms-hint">{hint}</span>}
    </label>
  );
}

function Modal({
  open, onClose, title, width = 560, children, footer,
}: {
  open: boolean; onClose: () => void; title: string; width?: number;
  children: ReactNode; footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ms-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ms-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ms-modal-h">
          <h3>{title}</h3>
          <button className="ms-iconbtn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="ms-modal-b">{children}</div>
        {footer && <div className="ms-modal-f">{footer}</div>}
      </div>
    </div>
  );
}

function Countdown({ expiryDate, status }: { expiryDate: string; status: UIStatus }) {
  const c = useCountdown(expiryDate);
  return (
    <span className="ms-mono" style={{ color: status === "EXPIRED" ? "var(--red)" : status === "SOON" ? "var(--amber)" : "var(--ink)" }}>
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
    <section className="ms-panel">
      <div className="ms-panel-head">
        <span className="ms-panel-title">Renewal runway</span>
        <span className="ms-panel-note">Next 90 days. Click a marker to find the service below.</span>
      </div>
      <div className="ms-runway-scroll">
        {services.length === 0 ? (
          <p className="ms-runway-empty">Nothing to plot yet.</p>
        ) : (
          <div className="ms-runway">
            <div className={`ms-gutter${overdue.length ? " overdue" : ""}`}>
              <div className="ms-gutter-n">{overdue.length}</div>
              <div className="ms-gutter-l">already past<br />the expiry date</div>
              <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
                {overdue.map((s) => (
                  <button key={s._id} className="ms-dot" style={{ color: "var(--red)" }}
                    title={`${s.name} — overdue`} onClick={() => onPick(s._id)} aria-label={`${s.name}, overdue`} />
                ))}
              </div>
            </div>

            <div className="ms-rail">
              {[0, 30, 60, 90].map((t) => (
                <div key={t} className="ms-tick" style={{ left: `${(t / 90) * 100}%` }}>
                  <span style={t === 0 ? { transform: "none" } : undefined}>{t === 0 ? "today" : `${t} days`}</span>
                </div>
              ))}
              <div className="ms-base" />
              {within.map((s, i) => {
                const d = daysRemaining(s.expiryDate);
                const st = uiStatus(s, settings);
                return (
                  <div key={s._id} className={`ms-mark${st === "SOON" ? " hot" : ""}`}
                    style={{ left: `${Math.min(99, (d / 90) * 100)}%`, top: 6 + (i % 3) * 22, bottom: 20 }}>
                    <div className="ms-mark-lab">{s.name}</div>
                    <button className="ms-dot" style={{ color: st === "SOON" ? "var(--amber)" : "var(--teal)" }}
                      onClick={() => onPick(s._id)} title={`${s.name} — ${d} days left`}
                      aria-label={`${s.name}, ${d} days left`} />
                    <div className="ms-stem" />
                  </div>
                );
              })}
            </div>

            <div className="ms-gutter right">
              <div className="ms-gutter-n">{later}</div>
              <div className="ms-gutter-l">further out<br />or not expiring</div>
            </div>
          </div>
        )}
      </div>
    </section>
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
    try {
      const [settingsRes, servicesRes] = await Promise.all([settingsApi.get(), externalServiceApi.list()]);
      setSettings(settingsRes);
      setServices(servicesRes);
      setAlertDraft({
        popupReminderDays: String(settingsRes.systemAlerts?.popupReminderDays ?? 15),
        emailReminderDays: String(settingsRes.systemAlerts?.emailReminderDays ?? 15),
        notifyEmails: settingsRes.systemAlerts?.notifyEmails?.join(", ") ?? "",
      });
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
    <div className="ms">
      <style>{CSS}</style>
      <div className="ms-wrap">
        <header className="ms-head">
          <div>
            <p className="ms-eyebrow">Infrastructure control</p>
            <h1 className="ms-title">System &amp; Security</h1>
            <p className="ms-sub">Keep renewals, credentials, invoices and service alerts in one reliable place.</p>
          </div>
          <div className="ms-headbtns">
            <button className="ms-btn ghost" onClick={() => setAlertOpen(true)} disabled={!settings}>
              <BellRing size={14} /> Reminder defaults
            </button>
            <button className="ms-btn" onClick={openAdd}><Plus size={14} /> Add service</button>
          </div>
        </header>

        <div className="ms-figs">
          <div className="ms-fig">
            <div className="ms-fig-top"><span className="ms-fig-kicker">Inventory</span><span className="ms-fig-icon"><Package size={15} /></span></div>
            <div className="ms-fig-v">{loading ? "—" : services.length}</div>
            <div className="ms-fig-l">Services tracked</div>
            <div className="ms-fig-detail">{loading ? "Loading service data" : `${paidServices.length} paid · ${services.length - paidServices.length} free`}</div>
          </div>
          <div className={`ms-fig${overdueCount ? " alarm" : ""}`}>
            <div className="ms-fig-top"><span className="ms-fig-kicker">Attention</span><span className="ms-fig-icon"><AlertTriangle size={15} /></span></div>
            <div className="ms-fig-v">{loading ? "—" : overdueCount}</div>
            <div className="ms-fig-l">Past due</div>
            <div className="ms-fig-detail">{overdueCount ? "Immediate action required" : "No overdue renewals"}</div>
          </div>
          <div className={`ms-fig${soonCount ? " warn" : ""}`}>
            <div className="ms-fig-top"><span className="ms-fig-kicker">Upcoming</span><span className="ms-fig-icon"><BellRing size={15} /></span></div>
            <div className="ms-fig-v">{loading ? "—" : soonCount}</div>
            <div className="ms-fig-l">Renewing soon</div>
            <div className="ms-fig-detail">Inside the reminder window</div>
          </div>
          <div className="ms-fig">
            <div className="ms-fig-top"><span className="ms-fig-kicker">Monthly</span><span className="ms-fig-icon"><CreditCard size={15} /></span></div>
            <div className="ms-fig-v">{loading ? "—" : inr(monthlyTotal)}</div>
            <div className="ms-fig-l">Monthly billing</div>
            <div className="ms-fig-detail">{monthlyServices.length} monthly {monthlyServices.length === 1 ? "subscription" : "subscriptions"}</div>
          </div>
          <div className="ms-fig">
            <div className="ms-fig-top"><span className="ms-fig-kicker">Yearly</span><span className="ms-fig-icon"><BarChart3 size={15} /></span></div>
            <div className="ms-fig-v">{loading ? "—" : inr(yearlyTotal)}</div>
            <div className="ms-fig-l">Annual billing</div>
            <div className="ms-fig-detail">{yearlyServices.length} yearly {yearlyServices.length === 1 ? "subscription" : "subscriptions"}</div>
          </div>
        </div>

        {!loading && <Runway services={services} settings={settings} onPick={pick} />}

        <section className="ms-panel">
          <div className="ms-panel-head">
            <span className="ms-panel-title">Tracked services</span>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 9, top: 9, color: "var(--ink3)" }} />
              <input className="ms-input" style={{ paddingLeft: 28, width: 210 }} placeholder="Search name or provider"
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="ms-row ms-row-head">
            <span />
            <span>Service</span>
            <span className="ms-hide-sm">Category</span>
            <span className="ms-hide-sm">Cost</span>
            <span>Time left</span>
            <span style={{ textAlign: "right" }} className="ms-hide-sm">Actions</span>
          </div>

          {loading && [0, 1, 2, 3].map((i) => (
            <div className="ms-row" key={i}>
              <div className="ms-rail-cell" style={{ background: "var(--line)" }} />
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="ms-skel" style={{ width: 30, height: 30, borderRadius: 8 }} />
                <span className="ms-skel" style={{ width: 150 }} />
              </div>
              <div className="ms-hide-sm"><span className="ms-skel" style={{ width: 80, display: "block" }} /></div>
              <div className="ms-hide-sm"><span className="ms-skel" style={{ width: 60, display: "block" }} /></div>
              <div><span className="ms-skel" style={{ width: 90, display: "block" }} /></div>
              <div />
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="ms-empty">
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
                <div className="ms-group">
                  <b>{GROUP_META[key].label}</b>
                  <span>{GROUP_META[key].note}</span>
                  <span className="pill">{rows.length}</span>
                </div>
                {rows.map((s) => {
                  const st = uiStatus(s, settings);
                  const Icon = CAT_ICON[s.category] ?? Package;
                  return (
                    <div key={s._id} id={`svc-${s._id}`} className={`ms-row${highlight === s._id ? " ms-flash" : ""}`}>
                      <div className="ms-rail-cell" style={{ background: railColor(st) }} />
                      <div className="ms-name">
                        <span
                          className="ms-ico"
                          style={
                            st === "EXPIRED" ? { background: "var(--red-soft)", color: "var(--red)" }
                              : st === "SOON" ? { background: "var(--amber-soft)", color: "var(--amber)" }
                                : undefined
                          }
                        >
                          <Icon size={15} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p>{s.name}</p>
                          <small>
                            {s.provider || CAT_LABEL[s.category]}
                            {s.autoRenews ? " · auto-renews" : ""}
                          </small>
                        </div>
                      </div>

                      <div className="ms-cat ms-hide-sm">{CAT_LABEL[s.category]}</div>

                      <div className="ms-hide-sm">
                        {s.pricingType === "FREE" ? (
                          <span className="ms-chip ok">Free</span>
                        ) : s.costAmount != null ? (
                          <span className="ms-mono">
                            {s.currency && s.currency !== "INR" ? `${s.currency} ${s.costAmount.toLocaleString("en-IN")}` : inr(s.costAmount)}
                            <span style={{ color: "var(--ink3)" }}>
                              {s.billingCycle && s.billingCycle !== "ONE_TIME" ? ` /${CYCLE[s.billingCycle].slice(0, 2)}` : ""}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: "var(--ink3)" }}>amount not set</span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <Countdown expiryDate={s.expiryDate} status={st} />
                        {st === "MUTED" && <BellOff size={13} style={{ color: "var(--ink3)" }} aria-label="Reminders off" />}
                      </div>

                      <div className="ms-actions">
                        {s.loginUrl && (
                          <a className="ms-iconbtn" href={s.loginUrl} target="_blank" rel="noreferrer" title="Open provider dashboard">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button className="ms-iconbtn" onClick={() => openEdit(s)} title="Edit"><Pencil size={14} /></button>
                        <button className="ms-iconbtn danger" onClick={() => setDeleteTarget(s)} title="Delete"><Trash2 size={14} /></button>
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
            <button className="ms-btn ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="ms-btn" onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add service"}
            </button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div className="ms-grid2">
            <Field label="Category">
              <select className="ms-input" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ExternalServiceCategory })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Name">
              <input className="ms-input" value={form.name} placeholder="Domain — mokshasewa.org"
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Provider">
              <input className="ms-input" value={form.provider} placeholder="GoDaddy, Razorpay, Cloudinary"
                onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </Field>
            <Field label="Account" hint="Login email, username or account id">
              <input className="ms-input" value={form.accountIdentifier}
                onChange={(e) => setForm({ ...form, accountIdentifier: e.target.value })} />
            </Field>
            <Field label="Dashboard URL">
              <input className="ms-input" value={form.loginUrl} placeholder="https://dashboard.provider.com"
                onChange={(e) => setForm({ ...form, loginUrl: e.target.value })} />
            </Field>
            <Field label="Credential name">
              <input className="ms-input" value={form.secretLabel} placeholder="API secret, SMTP password"
                onChange={(e) => setForm({ ...form, secretLabel: e.target.value })} />
            </Field>
          </div>

          <Field label="Credential value" hint="Stored encrypted. Anyone with access to this page can read it.">
            <textarea className="ms-input" rows={2} value={form.secretValue}
              onChange={(e) => setForm({ ...form, secretValue: e.target.value })} />
          </Field>

          <div className="ms-grid2">
            <Field label="Started on">
              <input className="ms-input" type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Expires on" hint="Drives the countdown and every reminder">
              <input className="ms-input" type="date" value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </Field>
          </div>

          <div className="ms-box">
            <p className="ms-box-t">Cost</p>
            <div className="ms-seg" role="group" aria-label="Pricing">
              {(["FREE", "PAID"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={form.pricingType === v}
                  onClick={() => setForm({ ...form, pricingType: v })}>
                  {v === "FREE" ? "Free" : "Paid"}
                </button>
              ))}
            </div>
            {form.pricingType === "PAID" && (
              <div className="ms-grid3" style={{ marginTop: 12 }}>
                <Field label="Currency">
                  <input className="ms-input" value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                </Field>
                <Field label="Amount">
                  <input className="ms-input" type="number" min={0} value={form.costAmount} placeholder="999"
                    onChange={(e) => setForm({ ...form, costAmount: e.target.value })} />
                </Field>
                <Field label="Billed">
                  <select className="ms-input" value={form.billingCycle}
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

          <div className="ms-box">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="ms-box-t" style={{ margin: 0 }}>Bills and receipts</p>
              <button type="button" className="ms-btn ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload size={13} /> {uploading ? "Uploading…" : "Attach"}
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={addReceipt} />
            </div>
            {form.receipts.length === 0 ? (
              <p className="ms-hint" style={{ marginTop: 8 }}>
                Nothing attached. Add the last invoice so the next renewal has a reference.
              </p>
            ) : form.receipts.map((r) => (
              <div className="ms-file" key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  <FileText size={13} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label || "Receipt"}</span>
                </a>
                <button type="button" className="ms-iconbtn" aria-label={`Remove ${r.label}`}
                  onClick={() => setForm((p) => ({ ...p, receipts: p.receipts.filter((x) => x.url !== r.url) }))}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="ms-box">
            <label className="ms-check">
              <input type="checkbox" checked={form.remindersEnabled}
                onChange={(e) => setForm({ ...form, remindersEnabled: e.target.checked })} />
              <span>
                Remind us before this expires
                <span className="ms-hint" style={{ fontWeight: 400 }}>
                  Turn it off for something that never really expires. It stays listed here, just without the
                  popup, the topbar alert and the email.
                </span>
              </span>
            </label>
            {form.remindersEnabled && (
              <div className="ms-grid3" style={{ marginTop: 12 }}>
                <Field label="Popup, days before" hint={`Blank = ${settings?.systemAlerts?.popupReminderDays ?? 15}`}>
                  <input className="ms-input" type="number" min={0} value={form.popupReminderDays}
                    onChange={(e) => setForm({ ...form, popupReminderDays: e.target.value })} />
                </Field>
                <Field label="Email, days before" hint={`Blank = ${settings?.systemAlerts?.emailReminderDays ?? 15}`}>
                  <input className="ms-input" type="number" min={0} value={form.emailReminderDays}
                    onChange={(e) => setForm({ ...form, emailReminderDays: e.target.value })} />
                </Field>
                <Field label="Email these people" hint="Blank = default list">
                  <input className="ms-input" value={form.notifyEmails}
                    onChange={(e) => setForm({ ...form, notifyEmails: e.target.value })} />
                </Field>
              </div>
            )}
          </div>

          <Field label="Notes">
            <textarea className="ms-input" rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          <label className="ms-check">
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
            <button className="ms-btn ghost" onClick={() => setAlertOpen(false)}>Cancel</button>
            <button className="ms-btn" onClick={saveAlertDefaults} disabled={savingAlerts}>
              {savingAlerts ? "Saving…" : "Save defaults"}
            </button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <p className="ms-hint" style={{ marginTop: 0 }}>Applied to every service that doesn&apos;t set its own.</p>
          <Field label="Show the popup this many days before expiry">
            <input className="ms-input" type="number" min={0} value={alertDraft.popupReminderDays}
              onChange={(e) => setAlertDraft({ ...alertDraft, popupReminderDays: e.target.value })} />
          </Field>
          <Field label="Send the email this many days before expiry">
            <input className="ms-input" type="number" min={0} value={alertDraft.emailReminderDays}
              onChange={(e) => setAlertDraft({ ...alertDraft, emailReminderDays: e.target.value })} />
          </Field>
          <Field label="Send it to" hint="Separate addresses with a comma">
            <input className="ms-input" placeholder="ops@mokshasewa.org, admin@mokshasewa.org"
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
            <button className="ms-btn ghost" onClick={() => setDeleteTarget(null)}>Keep it</button>
            <button className="ms-btn danger" onClick={confirmDelete} disabled={deleting}>
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", gap: 11 }}>
          <span className="ms-ico" style={{ background: "var(--red-soft)", color: "var(--red)" }}>
            <AlertTriangle size={15} />
          </span>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{deleteTarget?.name}</p>
            <p style={{ margin: "4px 0 0", color: "var(--ink2)" }}>
              Its expiry date, credentials and attached bills go with it. If you only want the reminders to stop,
              edit the service and switch reminders off instead.
            </p>
          </div>
        </div>
      </Modal>

      <div className="ms-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`ms-toast${t.type === "err" ? " err" : ""}`}>
            <span className="ic">{t.type === "err" ? <AlertTriangle size={14} /> : <Check size={14} />}</span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
