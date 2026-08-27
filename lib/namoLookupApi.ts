import { api } from "./api";

export const NAMO_LOOKUP_TYPES = [
  "CATEGORY", "OCCUPATION", "DESIGNATION", "DEPARTMENT", "PROFESSION", "UNIVERSITY",
  "DATA", "OBJ_NAME", "ORGANIZATION", "SOURCE", "CALL_TARGET", "COORDINATOR_STATUS",
  "BANK", "STATUS_OPTION", "IP",
] as const;
export type NamoLookupType = (typeof NAMO_LOOKUP_TYPES)[number];

export interface NamoLookup {
  _id: string;
  type: NamoLookupType;
  name: string;
  payload: Record<string, unknown>;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const namoLookupApi = {
  list: (type?: NamoLookupType) => api.get<NamoLookup[]>(`/namo-lookups/admin${type ? `?type=${type}` : ""}`),
  create: (input: { type: NamoLookupType; name: string; status?: "ACTIVE" | "INACTIVE" }) =>
    api.post<NamoLookup>("/namo-lookups/admin", input),
  update: (id: string, input: { name?: string; status?: "ACTIVE" | "INACTIVE" }) =>
    api.put<NamoLookup>(`/namo-lookups/admin/${id}`, input),
  remove: (id: string) => api.delete<NamoLookup>(`/namo-lookups/admin/${id}`),
};
