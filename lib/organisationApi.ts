import { api } from "./api";

export type OrganisationStatus = "ACTIVE" | "INACTIVE";

export interface OrganisationDetails {
  registeredName?: string;
  panNumber?: string;
  registrationNumber?: string;
  registeredAddress?: string;
}

export interface OrganisationContactDetails {
  email?: string;
  phone?: string;
  address?: string;
}

export interface Organisation {
  _id: string;
  code: string;
  name: string;
  slug: string;
  status: OrganisationStatus;
  legalDetails?: OrganisationDetails;
  contactDetails?: OrganisationContactDetails;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganisationInput {
  code: string;
  name: string;
  slug: string;
  status: OrganisationStatus;
  legalDetails: OrganisationDetails;
  contactDetails: OrganisationContactDetails;
}

export type OrganisationUpdateInput = Omit<OrganisationInput, "code">;

export const organisationApi = {
  list: (status?: OrganisationStatus) =>
    api.get<Organisation[]>(`/organisations/admin${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  getById: (id: string) => api.get<Organisation>(`/organisations/admin/${id}`),
  create: (input: OrganisationInput) => api.post<Organisation>("/organisations/admin", input),
  update: (id: string, input: OrganisationUpdateInput) => api.put<Organisation>(`/organisations/admin/${id}`, input),
};
