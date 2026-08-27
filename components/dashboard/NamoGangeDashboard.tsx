"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, HandHeart, HeartHandshake, Loader2, Mail, UsersRound, Users2 } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import { jobApi } from "@/lib/jobApi";
import { memberApi } from "@/lib/memberApi";
import { agsDelegateApi } from "@/lib/agsDelegateApi";
import { namoJobApplicationApi, NamoJobApplication } from "@/lib/namoJobApplicationApi";
import { namoEnquiryApi } from "@/lib/namoEnquiryApi";
import { namoSupportRequestApi } from "@/lib/namoSupportRequestApi";
import { namoDonationLeadApi } from "@/lib/namoDonationLeadApi";
import { useAppSelector } from "@/store/hooks";

interface Counts {
  jobsPublished: number;
  membersPending: number;
  membersTotal: number;
  agsDelegates: number;
  enquiries: number;
  supportRequests: number;
  donationPledges: number;
  applications: NamoJobApplication[];
}

export default function NamoGangeDashboard() {
  const admin = useAppSelector((state) => state.auth.admin);
  const [data, setData] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      jobApi.list("PUBLISHED"),
      memberApi.list(),
      memberApi.list("PENDING"),
      agsDelegateApi.list(),
      namoJobApplicationApi.list(),
      namoEnquiryApi.list(),
      namoSupportRequestApi.list(),
      namoDonationLeadApi.list(),
    ])
      .then(([jobs, membersAll, membersPending, delegates, applications, enquiries, supportRequests, donations]) => {
        if (cancelled) return;
        setData({
          jobsPublished: jobs.length,
          membersTotal: membersAll.length,
          membersPending: membersPending.length,
          agsDelegates: delegates.length,
          enquiries: enquiries.length,
          supportRequests: supportRequests.length,
          donationPledges: donations.length,
          applications,
        });
      })
      .catch(() => { })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const recentApplications = [...data.applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
  const firstName = admin?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-none border border-white/60 bg-white/40 backdrop-blur-xl py-2 px-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Welcome back, {firstName}!</h1>
          <p className="mt-1 text-[13px] font-medium text-slate-600">Namo Gange members, jobs, AGS and public submissions at a glance.</p>
        </div>
        <Link href="/members" className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm">
          View Members <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={UsersRound} label="Members" value={data.membersTotal} hint={`${data.membersPending} pending`} accentColor="#0ea5e9" />
        <StatCard icon={Users2} label="AGS Delegates" value={data.agsDelegates} accentColor="#f59e0b" />
        <StatCard icon={BriefcaseBusiness} label="Published Jobs" value={data.jobsPublished} accentColor="#16a34a" />
        <StatCard icon={Mail} label="Contact Enquiries" value={data.enquiries} accentColor="#8b5cf6" />
        <StatCard icon={HandHeart} label="Support Requests" value={data.supportRequests} accentColor="#ec4899" />
        <StatCard icon={HeartHandshake} label="Donation Pledges" value={data.donationPledges} accentColor="#0d9488" />
      </div>

      <Card padding="sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Recent Career Applications</h2>
          <Link href="/namo-job-applications" className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentApplications.length === 0 ? (
          <p className="text-sm text-text-muted">No career applications yet.</p>
        ) : (
          <div className="space-y-1">
            {recentApplications.map((a) => (
              <div key={a._id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-surface-sunken">
                <span className="font-medium text-text-primary">{a.name}</span>
                <span className="text-text-muted">{a.role || "—"} · {a.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
