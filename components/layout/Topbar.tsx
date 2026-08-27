"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, ChevronDown, KeyRound, Bell, AlertTriangle, HeartHandshake, Mail, FolderKanban, HandHeart, CheckCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { casesApi, SlaBreach } from "@/lib/casesApi";
import { adminNotificationsApi, AdminNotificationItem, AdminNotificationType } from "@/lib/adminNotificationsApi";
import { ApiRequestError } from "@/lib/api";
import { NAV_SECTIONS } from "./navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const NOTIFICATION_ICONS: Record<AdminNotificationType, typeof HeartHandshake> = {
  DONATION: HeartHandshake,
  ENQUIRY: Mail,
  CASE: FolderKanban,
  VOLUNTEER: HandHeart,
};

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function currentPageTitle(pathname: string): string {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.label;
      }
    }
  }
  return "Moksha Sewa Admin";
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.admin);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [breaches, setBreaches] = useState<SlaBreach[]>([]);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const isInternal = admin?.userType === "INTERNAL";

  const loadNotifications = useCallback(() => {
    if (!isInternal) return;
    adminNotificationsApi
      .list()
      .then(({ notifications, unreadCount }) => {
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  }, [isInternal]);

  useEffect(() => {
    if (!isInternal) return;

    casesApi.slaBreaches().then(setBreaches).catch(() => setBreaches([]));
    loadNotifications();
  }, [isInternal, loadNotifications]);

  const handleBellClick = () => {
    setNotifOpen((v) => {
      if (!v) loadNotifications();
      return !v;
    });
  };

  const handleNotificationClick = async (n: AdminNotificationItem) => {
    setNotifOpen(false);
    setNotifications((prev) => prev.filter((x) => x._id !== n._id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    adminNotificationsApi.markRead(n._id).catch(() => { });
    if (n.link) router.push(n.link);
  };

  const handleMarkAllRead = async () => {
    setNotifications([]);
    setUnreadCount(0);
    adminNotificationsApi.markAllRead().catch(() => { });
  };

  const bellBadgeCount = breaches.length + unreadCount;

  const handleLogout = async () => {
    if (refreshToken) await authApi.logout(refreshToken);
    dispatch(logout());
    router.push("/login");
  };

  const handleChangePassword = async () => {
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await authApi.changePassword(currentPassword, newPassword);
      dispatch(logout());
      router.push("/login?passwordChanged=1");
    } catch (err) {
      setPasswordError(err instanceof ApiRequestError ? err.message : "Could not change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const firstName = admin?.name?.split(" ")[0];
  const initials = admin?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/80 bg-white/75 backdrop-blur-xl px-4 shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-900/5 lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">{currentPageTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-900/5"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {bellBadgeCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger-text px-1 text-[9px] font-semibold text-white shadow-sm border border-white">
                {bellBadgeCount > 9 ? "9+" : bellBadgeCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-none border border-white/60 bg-white/80 backdrop-blur-xl py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="max-h-[28rem] overflow-y-auto">
                  {breaches.length > 0 && (
                    <div className="border-b border-slate-200/70 pb-1">
                      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">SLA Breaches</p>
                      {breaches.map((b) => (
                        <button
                          key={`${b._id}-${b.breachReason}`}
                          onClick={() => {
                            setNotifOpen(false);
                            router.push(`/cases/${b._id}`);
                          }}
                          className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs hover:bg-slate-900/5 transition-colors"
                        >
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <span>
                            <span className="font-semibold text-slate-900">{b.caseId}</span>
                            <span className="block text-[11px] font-medium text-slate-500 mt-0.5">{b.breachReason}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Activity</p>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline"
                      >
                        <CheckCheck className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-3 pb-3 text-xs font-medium text-slate-600">Nothing new right now.</p>
                  ) : (
                    notifications.map((n) => {
                      const Icon = NOTIFICATION_ICONS[n.type];
                      return (
                        <button
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className="flex w-full items-start gap-2 bg-accent-soft/40 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-900/5"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                            <Icon className="h-3 w-3" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-slate-900">{n.title}</span>
                            <span className="block truncate text-[11px] font-medium text-slate-500">{n.message}</span>
                            <span className="mt-0.5 block text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                          </span>
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-900/5 transition-colors"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[11px] font-semibold text-accent border border-white/60 shadow-sm">
              {admin?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-supplied Cloudinary URL, not a local/static asset
                <img src={admin.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[13px] font-semibold leading-tight text-slate-900 tracking-tight">Hello, {firstName}!</span>
              <span className="block text-[10px] font-semibold capitalize leading-tight text-slate-500 mt-0.5">
                {admin?.roleSlug?.replace(/_/g, " ")}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-none border border-white/60 bg-white/80 backdrop-blur-xl py-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setPasswordError("");
                    setPasswordModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 transition-colors"
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 border-t border-white/40 px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleChangePassword} loading={passwordSaving}>
              Change Password
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="At least 8 characters. You'll be signed out of every session after this."
          />
          {passwordError && <p className="text-xs font-medium text-red-600">{passwordError}</p>}
        </div>
      </Modal>
    </header>
  );
}
