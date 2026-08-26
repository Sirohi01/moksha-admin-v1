import { api } from "./api";

export type AccessGrantStatus = "ACTIVE" | "REVOKED";

export interface AccessGrantPerson {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface AccessGrantOrganisation {
  _id: string;
  code: string;
  name: string;
}

export interface AccessGrantRole {
  _id: string;
  name: string;
  slug: string;
}

export interface AccessGrant {
  _id: string;
  status: AccessGrantStatus;
  grantedAt: string;
  expiresAt?: string;
  userId: AccessGrantPerson;
  organisationId: AccessGrantOrganisation | null;
  programCode: string | null;
  roleId: AccessGrantRole;
  grantedBy: AccessGrantPerson;
}

export interface CreateAccessGrantInput {
  userId: string;
  organisationId?: string | null;
  programCode?: string | null;
  roleId: string;
  expiresAt?: string;
}

export interface AccessGrantFilters {
  userId?: string;
  organisationId?: string;
  status?: AccessGrantStatus;
}

export const accessGrantApi = {
  list: (filters: AccessGrantFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.userId) params.set("userId", filters.userId);
    if (filters.organisationId) params.set("organisationId", filters.organisationId);
    if (filters.status) params.set("status", filters.status);
    const query = params.toString();
    return api.get<AccessGrant[]>(`/access-grants/admin${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api.get<AccessGrant>(`/access-grants/admin/${id}`),
  create: (input: CreateAccessGrantInput) => api.post<AccessGrant>("/access-grants/admin", input),
  updateExpiry: (id: string, expiresAt: string) =>
    api.put<AccessGrant>(`/access-grants/admin/${id}`, { expiresAt }),
  revoke: (id: string) => api.put<AccessGrant>(`/access-grants/admin/${id}/revoke`),
};
