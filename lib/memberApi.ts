import { api } from "./api";

export type MemberStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";
export interface Member {
  _id: string;
  applicantName: string;
  surname?: string;
  mobile: string;
  email: string;
  city?: string;
  state?: string;
  occupation?: string;
  designation?: string;
  status: MemberStatus;
  aadharMasked?: string;
  initiatives: string[];
  volunteeringFor: string[];
  areaOfInterest: string[];
  createdAt: string;
}

export const memberApi = {
  list: (status?: MemberStatus) => api.get<Member[]>(`/members/admin${status ? `?status=${status}` : ""}`),
  get: (id: string) => api.get<Member>(`/members/admin/${id}`),
  update: (id: string, input: Partial<Member>) => api.put<Member>(`/members/admin/${id}`, input),
};
