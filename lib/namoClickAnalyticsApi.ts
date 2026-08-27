import { api } from "./api";

export interface NamoClickAnalyticsLog {
  _id: string;
  iconName: string;
  ipAddress: string;
  clickedAt: string;
}

export interface NamoClickAnalyticsStats {
  stats: Record<string, number>;
  logs: NamoClickAnalyticsLog[];
}

export const namoClickAnalyticsApi = {
  get: () => api.get<NamoClickAnalyticsStats>("/namo-click-analytics/admin"),
};
