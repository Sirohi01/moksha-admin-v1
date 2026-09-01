"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, ChevronDown, KeyRound, Bell, AlertTriangle, HeartHandshake, Mail, FolderKanban, HandHeart, CheckCheck, Globe2, CalendarDays, Check, ArrowUpRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { casesApi, SlaBreach } from "@/lib/casesApi";
import {
  adminNotificationsApi,
  AdminNotificationItem,
  AdminNotificationType,
} from "@/lib/adminNotificationsApi";
import { ApiRequestError } from "@/lib/api";
import { NAV_SECTIONS } from "./navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const NOTIFICATION_ICONS: Record<
  AdminNotificationType,
  typeof HeartHandshake
> = {
  DONATION: HeartHandshake,
  ENQUIRY: Mail,
  CASE: FolderKanban,
  VOLUNTEER: HandHeart,
};

const WEBSITE_OPTIONS = ["mokshasewa.org"];

const DATE_OPTIONS = [
  "31 May 2026",
  "30 May 2026",
  "29 May 2026",
  "28 May 2026",
  "27 May 2026",
];

function timeAgo(iso: string): string {
  const minutes = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 60000
  );

  if (minutes < 1) return "just now";

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

function currentPageTitle(pathname: string): string {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href ||
          pathname.startsWith(`${item.href}/`)
      ) {
        return item.label;
      }
    }
  }

  return "Moksha Sewa Admin";
}

export default function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const admin = useAppSelector((state) => state.auth.admin);
  const refreshToken = useAppSelector(
    (state) => state.auth.refreshToken
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const [selectedWebsite, setSelectedWebsite] =
    useState("mokshasewa.org");

  const [selectedDate, setSelectedDate] =
    useState("31 May 2026");

  const [breaches, setBreaches] = useState<SlaBreach[]>([]);

  const [notifications, setNotifications] = useState<
    AdminNotificationItem[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [passwordModalOpen, setPasswordModalOpen] =
    useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("31 May 2026");

  const isInternal = admin?.userType === "INTERNAL";

  const isDashboard = pathname === "/";

  const firstName =
    admin?.name?.split(" ")[0] || "Admin";

  const initials = admin?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayName = admin?.name || "Admin User";

  const displayRole =
    admin?.roleSlug
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Super Admin";

  const closeHeaderDropdowns = () => {
    setWebsiteOpen(false);
    setDateOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
  };

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

    casesApi
      .slaBreaches()
      .then(setBreaches)
      .catch(() => setBreaches([]));

    loadNotifications();
  }, [isInternal, loadNotifications]);

  const handleWebsiteClick = () => {
    setWebsiteOpen((value) => !value);

    setDateOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
  };

  const handleDateClick = () => {
    setDateOpen((value) => !value);

    setWebsiteOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
  };

  const handleBellClick = () => {
    setWebsiteOpen(false);
    setDateOpen(false);
    setMenuOpen(false);

    setNotifOpen((value) => {
      if (!value) {
        loadNotifications();
      }

      return !value;
    });
  };

  const handleProfileClick = () => {
    setWebsiteOpen(false);
    setDateOpen(false);
    setNotifOpen(false);

    setMenuOpen((value) => !value);
  };

  const handleNotificationClick = async (
    notification: AdminNotificationItem
  ) => {
    setNotifOpen(false);

    setNotifications((previous) =>
      previous.filter(
        (item) => item._id !== notification._id
      )
    );

    setUnreadCount((previous) =>
      Math.max(0, previous - 1)
    );

    adminNotificationsApi
      .markRead(notification._id)
      .catch(() => { });

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications([]);
    setUnreadCount(0);

    adminNotificationsApi
      .markAllRead()
      .catch(() => { });
  };

  const bellBadgeCount =
    breaches.length + unreadCount;

  const handleLogout = async () => {
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }

    dispatch(logout());

    router.push("/login");
  };

  const handleChangePassword = async () => {
    setPasswordSaving(true);
    setPasswordError("");

    try {
      await authApi.changePassword(
        currentPassword,
        newPassword
      );

      dispatch(logout());

      router.push("/login?passwordChanged=1");
    } catch (err) {
      setPasswordError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/80 bg-white/75 backdrop-blur-xl px-4 shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-900/5 lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        {pathname === "/" ? (
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-normal leading-tight tracking-tight text-slate-900">Welcome back, <strong className="font-bold">{firstName || "Admin"}!</strong> <span aria-hidden>👋</span></h1>
            <p className="hidden truncate text-[13px] font-normal leading-tight text-slate-500 sm:block">Here&apos;s an overview of your website <strong className="font-bold text-slate-700">mokshasewa.org</strong></p>
          </div>
        ) : (
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">{currentPageTitle(pathname)}</h1>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative hidden md:block">
          <button type="button" onClick={() => { setWebsiteOpen((v) => !v); setDateOpen(false); }} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-800 hover:bg-slate-50">
            <Globe2 className="h-4 w-4" /> mokshasewa.org <ChevronDown className={`h-3.5 w-3.5 transition ${websiteOpen ? "rotate-180" : ""}`} />
          </button>
          {websiteOpen && <><button className="fixed inset-0 z-10 cursor-default" aria-label="Close website menu" onClick={() => setWebsiteOpen(false)} /><div className="absolute right-0 top-full z-20 mt-2 w-52 border border-slate-200 bg-white p-1.5 shadow-xl">
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"><span className="flex items-center gap-2"><Globe2 className="h-4 w-4" />mokshasewa.org</span><Check className="h-4 w-4 text-teal-700" /></div>
            <a href="https://mokshasewa.org" target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><ArrowUpRight className="h-4 w-4" />Open live website</a>
          </div></>}
        </div>

        <div className="relative hidden md:block">
          <button type="button" onClick={() => { setDateOpen((v) => !v); setWebsiteOpen(false); }} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-800 hover:bg-slate-50">
            <CalendarDays className="h-4 w-4" /> {selectedDate} <ChevronDown className={`h-3.5 w-3.5 transition ${dateOpen ? "rotate-180" : ""}`} />
          </button>
          {dateOpen && <><button className="fixed inset-0 z-10 cursor-default" aria-label="Close date menu" onClick={() => setDateOpen(false)} /><div className="absolute right-0 top-full z-20 mt-2 w-44 border border-slate-200 bg-white p-1.5 shadow-xl">
            {["31 May 2026", "30 May 2026", "29 May 2026", "28 May 2026", "27 May 2026"].map((date) => <button key={date} type="button" onClick={() => { setSelectedDate(date); setDateOpen(false); }} className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium ${selectedDate === date ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}>{date}{selectedDate === date && <Check className="h-4 w-4 text-teal-700" />}</button>)}
          </div></>}
        </div>

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
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setNotifOpen(false)}
              />

              <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.15)]">

                <div className="max-h-[28rem] overflow-y-auto">

                  {breaches.length > 0 && (
                    <div className="border-b border-slate-200/70 pb-1">

                      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        SLA Breaches
                      </p>

                      {breaches.map((breach) => (
                        <button
                          type="button"
                          key={`${breach._id}-${breach.breachReason}`}
                          onClick={() => {
                            setNotifOpen(false);

                            router.push(
                              `/cases/${breach._id}`
                            );
                          }}
                          className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-900/5"
                        >
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />

                          <span>
                            <span className="font-semibold text-slate-900">
                              {breach.caseId}
                            </span>

                            <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                              {breach.breachReason}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between px-3 py-2">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Activity
                    </p>

                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="px-3 pb-3 text-xs font-medium text-slate-600">
                      Nothing new right now.
                    </p>
                  ) : (
                    notifications.map((notification) => {
                      const Icon =
                        NOTIFICATION_ICONS[
                        notification.type
                        ];

                      return (
                        <button
                          type="button"
                          key={notification._id}
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className="flex w-full items-start gap-2 bg-accent-soft/40 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-900/5"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                            <Icon className="h-3 w-3" />
                          </span>

                          <span className="min-w-0 flex-1">

                            <span className="block font-semibold text-slate-900">
                              {notification.title}
                            </span>

                            <span className="block truncate text-[11px] font-medium text-slate-500">
                              {notification.message}
                            </span>

                            <span className="mt-0.5 block text-[10px] text-slate-400">
                              {timeAgo(
                                notification.createdAt
                              )}
                            </span>
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

        {/* ============================
                ADMIN PROFILE
            ============================ */}

        <div className="relative">

          <button
            type="button"
            onClick={handleProfileClick}
            className={`flex items-center gap-2 rounded-[9px] transition-colors hover:bg-slate-900/5 ${isDashboard
                ? "px-1.5 py-1"
                : "px-2 py-1.5"
              }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-[#edf3f6] text-[11px] font-semibold text-accent shadow-sm">

              {admin?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={admin.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials || "AU"
              )}
            </span>

            <span className="hidden text-left sm:block">

              <span
                className={`block font-extrabold leading-tight tracking-tight text-slate-900 ${isDashboard
                    ? "text-[10px]"
                    : "text-[13px]"
                  }`}
              >
                {displayName}
              </span>

              <span
                className={`mt-0.5 block capitalize leading-tight text-slate-500 ${isDashboard
                    ? "text-[8px] font-semibold"
                    : "text-[10px] font-semibold"
                  }`}
              >
                {displayRole}
              </span>
            </span>

            <ChevronDown
              className={`ml-1 h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />

              <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white py-1 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">

                <div className="border-b border-slate-100 px-3 py-2.5">

                  <p className="truncate text-[11px] font-extrabold text-slate-900">
                    {displayName}
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold capitalize text-slate-500">
                    {displayRole}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setPasswordError("");
                    setPasswordModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 border-t border-slate-100 px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
      </header >

  {/* ==========================================
          CHANGE PASSWORD MODAL
      ========================================== */}

    < Modal
  isOpen = { passwordModalOpen }
  onClose = {() => setPasswordModalOpen(false)
}
title = "Change Password"
footer = {
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setPasswordModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleChangePassword}
              loading={passwordSaving}
            >
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
      onChange={(event) =>
        setCurrentPassword(event.target.value)
      }
    />

    <Input
      label="New Password"
      type="password"
      required
      value={newPassword}
      onChange={(event) =>
        setNewPassword(event.target.value)
      }
      hint="At least 8 characters. You'll be signed out of every session after this."
    />

    {passwordError && (
      <p className="text-xs font-medium text-red-600">
        {passwordError}
      </p>
    )}
  </div>
      </Modal >
    </>
  );
}