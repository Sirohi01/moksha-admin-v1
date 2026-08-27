import { api } from "./api";

export type NamoJobApplicationStatus = "Pending" | "Reviewed" | "Rejected";

export interface NamoJobApplication {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  currentLocation?: string;
  role?: string;
  message?: string;
  status: NamoJobApplicationStatus;
  createdAt: string;
}

export const namoJobApplicationApi = {
  list: (status?: NamoJobApplicationStatus) =>
    api.get<NamoJobApplication[]>(`/namo-job-applications/admin${status ? `?status=${status}` : ""}`),
  updateStatus: (id: string, status: NamoJobApplicationStatus) =>
    api.put<NamoJobApplication>(`/namo-job-applications/admin/${id}/status`, { status }),
};
