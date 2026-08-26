import { api } from "./api";

export type ProjectStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface ProjectOrganisation {
  _id: string;
  code?: string;
  name: string;
}

export interface Project {
  _id: string;
  organisationId: string | ProjectOrganisation;
  programCode: string;
  code: string;
  name: string;
  editionLabel?: string;
  status: ProjectStatus;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectInput {
  organisationId: string;
  programCode: string;
  code: string;
  name: string;
  editionLabel?: string;
  status: ProjectStatus;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export type ProjectUpdateInput = Omit<ProjectInput, "programCode" | "code">;

export interface ProjectListFilters {
  organisationId?: string;
  programCode?: string;
  status?: ProjectStatus;
}

export const projectApi = {
  list: (filters: ProjectListFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.organisationId) params.set("organisationId", filters.organisationId);
    if (filters.programCode) params.set("programCode", filters.programCode);
    if (filters.status) params.set("status", filters.status);
    const query = params.toString();
    return api.get<Project[]>(`/projects/admin${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api.get<Project>(`/projects/admin/${id}`),
  create: (input: ProjectInput) => api.post<Project>("/projects/admin", input),
  update: (id: string, input: ProjectUpdateInput) => api.put<Project>(`/projects/admin/${id}`, input),
};
