"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, ChevronDown, KeyRound, Bell, AlertTriangle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { casesApi, SlaBreach } from "@/lib/casesApi";
import { ApiRequestError } from "@/lib/api";
import { NAV_SECTIONS } from "./navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!admin || admin.userType !== "INTERNAL") return;
    casesApi.slaBreaches().then(setBreaches).catch(() => setBreaches([]));
  }, [admin]);

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
      // Changing password revokes every session for this account, including the current one —
      // the server-side fix for "a changed password should immediately end any stale session."
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar-bg px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-text hover:bg-sidebar-bg-active lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <h1 className="text-base font-bold text-white">{currentPageTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-text hover:bg-sidebar-bg-active"
            aria-label="SLA breach notifications"
          >
            <Bell className="h-4 w-4" />
            {breaches.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger-text px-1 text-[9px] font-bold text-white">
                {breaches.length > 9 ? "9+" : breaches.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-lg border border-surface-border bg-surface-card py-1.5 shadow-lg">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">SLA Breaches</p>
                {breaches.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-text-muted">Nothing breaching SLA right now.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {breaches.map((b) => (
                      <button
                        key={`${b._id}-${b.breachReason}`}
                        onClick={() => {
                          setNotifOpen(false);
                          router.push(`/cases/${b._id}`);
                        }}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-surface-sunken"
                      >
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        <span>
                          <span className="font-semibold text-text-primary">{b.caseId}</span>
                          <span className="block text-[11px] text-text-muted">{b.breachReason}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-sidebar-bg-active"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent text-[11px] font-semibold text-sidebar-bg">
              {admin?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-supplied Cloudinary URL, not a local/static asset
                <img src={admin.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-bold leading-tight text-white">Hello, {firstName}!</span>
              <span className="block text-[10px] font-medium capitalize leading-tight text-sidebar-accent">
                {admin?.roleSlug?.replace(/_/g, " ")}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-sidebar-text" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-surface-border bg-surface-card py-1 shadow-lg">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setPasswordError("");
                    setPasswordModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                >
                  <LogOut className="h-3.5 w-3.5" />
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
