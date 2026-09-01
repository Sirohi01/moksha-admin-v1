import { api } from "./api";

export type DashboardSourceStatus = "connected" | "not_connected" | "error";

export interface DashboardSource<T> {
  status: DashboardSourceStatus;
  updatedAt: string;
  message?: string;
  data: T | null;
}

export interface LiveDashboardOverview {
  generatedAt: string;
  sources: {
    internal: DashboardSource<{
      totalPages: number;
      totalPosts: number;
      totalEnquiries: number;
      enquiriesMtd: number;
      totalRequests: number;
      growth: { posts: number | null; enquiriesMtd: number | null };
      recentSubmissions: Array<{ id: string; name: string; type: string; city?: string; createdAt: string }>;
      topLocations: Array<{ city: string; count: number }>;
    }>;
    analytics: DashboardSource<{
      users: number;
      sessions: number;
      pageViews: number;
      averageSessionSeconds: number;
      bounceRate: number;
      conversions: number;
      growth: { users: number | null; sessions: number | null; pageViews: number | null; averageSession: number | null; bounceRate: number | null; conversionRate: number | null };
    }>;
    searchConsole: DashboardSource<{
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
      growth: { clicks: number | null; impressions: number | null; ctr: number | null; position: number | null };
    }>;
    pageSpeed: DashboardSource<{
      performanceScore: number;
      seoScore: number;
      lcp: number | null;
      inp: number | null;
      cls: number | null;
      fcp: number | null;
      tbt: number | null;
    }>;
  };
}

export const dashboardApi = {
  overview: () => api.get<LiveDashboardOverview>("/dashboard/admin/overview"),
};
