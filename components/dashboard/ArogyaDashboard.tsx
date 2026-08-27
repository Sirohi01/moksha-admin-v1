"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, HeartPulse, IndianRupee, Loader2, Ticket, Users2, BadgePercent, UserRound } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import { arogyaDelegateApi, ArogyaDelegateRegistration } from "@/lib/arogyaDelegateApi";
import { arogyaPassApi } from "@/lib/arogyaPassApi";
import { arogyaCouponApi } from "@/lib/arogyaCouponApi";
import { useAppSelector } from "@/store/hooks";

export default function ArogyaDashboard() {
  const admin = useAppSelector((state) => state.auth.admin);
  const [registrations, setRegistrations] = useState<ArogyaDelegateRegistration[] | null>(null);
  const [passCount, setPassCount] = useState(0);
  const [couponsActive, setCouponsActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([arogyaDelegateApi.list(), arogyaPassApi.list(), arogyaCouponApi.list()])
      .then(([regs, passes, coupons]) => {
        if (cancelled) return;
        setRegistrations(regs);
        setPassCount(passes.length);
        setCouponsActive(coupons.filter((c) => c.status === "available").length);
      })
      .catch(() => { })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  if (loading || !registrations) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const totalRevenuePaise = registrations.reduce((sum, r) => sum + r.amountPaise, 0);
  const singleCount = registrations.filter((r) => r.registrationType === "single").length;
  const groupPrimaryCount = registrations.filter((r) => r.registrationType === "group" && r.isGroupPrimary).length;
  const speakerCount = registrations.filter((r) => r.isSpeaker).length;
  const recent = [...registrations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  const firstName = admin?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-none border border-white/60 bg-white/40 backdrop-blur-xl py-2 px-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Welcome back, {firstName}!</h1>
          <p className="mt-1 text-[13px] font-medium text-slate-600">Arogya Sangosthi delegate registrations at a glance.</p>
        </div>
        <Link href="/arogya-delegates" className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm">
          View Delegates <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users2} label="Total Registrations" value={registrations.length} hint={`${singleCount} single · ${groupPrimaryCount} group`} accentColor="#0ea5e9" />
        <StatCard icon={IndianRupee} label="Total Collected" value={`₹${(totalRevenuePaise / 100).toLocaleString("en-IN")}`} accentColor="#16a34a" />
        <StatCard icon={Ticket} label="Passes Configured" value={passCount} accentColor="#f59e0b" />
        <StatCard icon={BadgePercent} label="Active Coupons" value={couponsActive} accentColor="#8b5cf6" />
        <StatCard icon={UserRound} label="Speakers" value={speakerCount} accentColor="#ec4899" />
        <StatCard icon={HeartPulse} label="Group Registrations" value={groupPrimaryCount} accentColor="#0d9488" />
      </div>

      <Card padding="sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Recent Registrations</h2>
          <Link href="/arogya-delegates" className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-text-muted">No registrations yet.</p>
        ) : (
          <div className="space-y-1">
            {recent.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-surface-sunken">
                <span className="font-medium text-text-primary">{[r.title, r.fullName].filter(Boolean).join(" ")}</span>
                <span className="text-text-muted">{r.passName} · ₹{(r.amountPaise / 100).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
