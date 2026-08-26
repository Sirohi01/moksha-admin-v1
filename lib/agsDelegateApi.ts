import { api } from "./api";

export type AgsDelegateStatus = "ACTIVE" | "INACTIVE";
export type AgsClientStatus = "NEW" | "WARM" | "HOT" | "REGISTERED" | "PAYMENT_REFUNDED" | "NOT_INTERESTED";

export interface AgsDelegate {
  _id: string;
  title?: string;
  firstName: string;
  lastName?: string;
  profession?: string;
  age?: number;
  event?: string;
  mobile: string;
  alternate?: string;
  landline?: string;
  email?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  pin?: string;
  category?: string;
  college?: string;
  university?: string;
  enquiryFor?: string;
  leadForward?: string;
  mode?: string;
  status: AgsDelegateStatus;
  clientStatus: AgsClientStatus;
  coordinator?: string;
  remark?: string;
  companyName?: string;
  companyAddress?: string;
  companyCountry?: string;
  companyState?: string;
  companyCity?: string;
  companyPin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AgsDelegateInput = Omit<AgsDelegate, "_id" | "createdAt" | "updatedAt">;

export interface AgsDelegateListFilters {
  status?: AgsDelegateStatus;
  clientStatus?: AgsClientStatus;
  search?: string;
}

function toQuery(filters: AgsDelegateListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.clientStatus) params.set("clientStatus", filters.clientStatus);
  if (filters.search) params.set("search", filters.search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const agsDelegateApi = {
  list: (filters: AgsDelegateListFilters = {}) => api.get<AgsDelegate[]>(`/ags-delegates/admin${toQuery(filters)}`),
  getById: (id: string) => api.get<AgsDelegate>(`/ags-delegates/admin/${id}`),
  create: (input: Partial<AgsDelegateInput>) => api.post<AgsDelegate>("/ags-delegates/admin", input),
  update: (id: string, input: Partial<AgsDelegateInput>) => api.put<AgsDelegate>(`/ags-delegates/admin/${id}`, input),
  remove: (id: string) => api.delete<null>(`/ags-delegates/admin/${id}`),
};
