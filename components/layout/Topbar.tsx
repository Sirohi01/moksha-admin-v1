"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  ChevronDown,
  KeyRound,
  Bell,
  AlertTriangle,
  HeartHandshake,
  Mail,
  FolderKanban,
  HandHeart,
  CheckCheck,
  Globe2,
  CalendarDays,
  Check,
} from "lucide-react";

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
      .catch(() => {});

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications([]);
    setUnreadCount(0);

    adminNotificationsApi
      .markAllRead()
      .catch(() => {});
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
    <>
      <header
        className={`relative z-50 shrink-0 border-b border-[#e8e8e3] bg-white ${
          isDashboard ? "h-[66px]" : "h-14"
        }`}
      >
        <div className="flex h-full items-center justify-between gap-3 px-2.5 sm:px-4">

          {/* ==============================
              LEFT SIDE
          ============================== */}

          <div className="flex min-w-0 items-center gap-2.5">

            <button
              type="button"
              onClick={() => {
                closeHeaderDropdowns();
                onMenuClick();
              }}
              className={`grid shrink-0 place-items-center transition-colors ${
                isDashboard
                  ? "h-10 w-10 rounded-[12px] bg-[#30392d] text-white hover:bg-[#252e23]"
                  : "h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-900/5"
              }`}
              aria-label="Open menu"
            >
              <Menu
                className={
                  isDashboard
                    ? "h-5 w-5"
                    : "h-[18px] w-[18px]"
                }
              />
            </button>

            {isDashboard ? (
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-extrabold leading-tight tracking-[-0.025em] text-[#13213d]">
                  Welcome back, {firstName}!{" "}
                  <span className="text-[18px]">👋</span>
                </h1>

                <p className="truncate text-[11px] font-medium leading-tight text-[#4a5261]">
                  Here&apos;s an overview of your website{" "}
                  <b className="font-extrabold">
                    {selectedWebsite}
                  </b>
                </p>
              </div>
            ) : (
              <h1 className="text-base font-semibold tracking-tight text-slate-900">
                {currentPageTitle(pathname)}
              </h1>
            )}
          </div>

          {/* ==============================
              RIGHT SIDE
          ============================== */}

          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* ============================
                WEBSITE SELECTOR
            ============================ */}

            {isDashboard && (
              <div className="relative hidden xl:block">

                <button
                  type="button"
                  onClick={handleWebsiteClick}
                  className="flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e2da] bg-[#fffdfa] px-3 text-[10px] font-bold text-[#13213d] transition-colors hover:bg-[#fff9ef]"
                >
                  <Globe2 className="h-3.5 w-3.5" />

                  <span>{selectedWebsite}</span>

                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      websiteOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {websiteOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close website menu"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setWebsiteOpen(false)}
                    />

                    <div className="absolute right-0 top-full z-20 mt-2 w-[210px] overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">

                      <div className="px-2.5 pb-2 pt-1">
                        <p className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#8a92a0]">
                          Select Website
                        </p>
                      </div>

                      {WEBSITE_OPTIONS.map((website) => (
                        <button
                          key={website}
                          type="button"
                          onClick={() => {
                            setSelectedWebsite(website);
                            setWebsiteOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-[7px] px-3 py-2.5 text-left text-[9px] font-bold transition-colors ${
                            selectedWebsite === website
                              ? "bg-[#f2f5f2] text-[#26372b]"
                              : "text-[#465168] hover:bg-[#f7f7f4]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Globe2 className="h-3.5 w-3.5" />
                            {website}
                          </span>

                          {selectedWebsite === website && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ============================
                DATE SELECTOR
            ============================ */}

            {isDashboard && (
              <div className="relative hidden xl:block">

                <button
                  type="button"
                  onClick={handleDateClick}
                  className="flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e2da] bg-[#fffdfa] px-3 text-[10px] font-bold text-[#13213d] transition-colors hover:bg-[#fff9ef]"
                >
                  <CalendarDays className="h-3.5 w-3.5" />

                  <span>{selectedDate}</span>

                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      dateOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dateOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close date menu"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setDateOpen(false)}
                    />

                    <div className="absolute right-0 top-full z-20 mt-2 w-[180px] overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">

                      <div className="px-2.5 pb-2 pt-1">
                        <p className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#8a92a0]">
                          Select Date
                        </p>
                      </div>

                      {DATE_OPTIONS.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date);
                            setDateOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-[7px] px-3 py-2.5 text-left text-[9px] font-bold transition-colors ${
                            selectedDate === date
                              ? "bg-[#f2f5f2] text-[#26372b]"
                              : "text-[#465168] hover:bg-[#f7f7f4]"
                          }`}
                        >
                          <span>{date}</span>

                          {selectedDate === date && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ============================
                NOTIFICATION BELL
            ============================ */}

            <div className="relative">

              <button
                type="button"
                onClick={handleBellClick}
                className={`relative flex items-center justify-center text-slate-600 transition-colors hover:bg-slate-900/5 ${
                  isDashboard
                    ? "h-9 w-9 rounded-[9px]"
                    : "h-8 w-8 rounded-lg"
                }`}
                aria-label="Notifications"
              >
                <Bell
                  className={
                    isDashboard
                      ? "h-[18px] w-[18px]"
                      : "h-4 w-4"
                  }
                />

                {bellBadgeCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-red-600 px-1 text-[9px] font-semibold text-white shadow-sm">
                    {bellBadgeCount > 9
                      ? "9+"
                      : bellBadgeCount}
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
                className={`flex items-center gap-2 rounded-[9px] transition-colors hover:bg-slate-900/5 ${
                  isDashboard
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
                    className={`block font-extrabold leading-tight tracking-tight text-slate-900 ${
                      isDashboard
                        ? "text-[10px]"
                        : "text-[13px]"
                    }`}
                  >
                    {displayName}
                  </span>

                  <span
                    className={`mt-0.5 block capitalize leading-tight text-slate-500 ${
                      isDashboard
                        ? "text-[8px] font-semibold"
                        : "text-[10px] font-semibold"
                    }`}
                  >
                    {displayRole}
                  </span>
                </span>

                <ChevronDown
                  className={`ml-1 h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
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
      </header>

      {/* ==========================================
          CHANGE PASSWORD MODAL
      ========================================== */}

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
        footer={
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
      </Modal>
    </>
  );
}