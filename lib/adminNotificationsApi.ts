import { api } from "./api";

export type AdminNotificationType = "DONATION" | "ENQUIRY" | "CASE" | "VOLUNTEER" | "DELEGATE" | "MEMBER" | "JOB_APPLICATION" | "SUPPORT";

export interface AdminNotificationItem {
  _id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotificationsResult {
  notifications: AdminNotificationItem[];
  unreadCount: number;
}

export const adminNotificationsApi = {
  list: (organisationCode?: string) => api.get<AdminNotificationsResult>(`/notifications/admin${organisationCode ? `?organisationCode=${organisationCode}` : ""}`),
  markRead: (id: string) => api.patch(`/notifications/admin/${id}/read`),
  markAllRead: (organisationCode?: string) => api.patch(`/notifications/admin/read-all${organisationCode ? `?organisationCode=${organisationCode}` : ""}`),
};
