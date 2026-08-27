import { api } from "./api";

export interface NamoAgsCollegeContact {
  contactPerson?: string;
  designation?: string;
  email?: string;
  mobile?: string;
  alternate?: string;
  landline?: string;
}

export interface NamoAgsCollege {
  _id: string;
  collegeName: string;
  category?: string;
  website?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  affilatedTo?: string;
  status: "Active" | "Inactive";
  contacts: NamoAgsCollegeContact[];
}
export type NamoAgsCollegeInput = Omit<NamoAgsCollege, "_id">;

export const namoAgsCollegeApi = {
  list: () => api.get<NamoAgsCollege[]>("/namo-ags-colleges/admin"),
  create: (input: NamoAgsCollegeInput) => api.post<NamoAgsCollege>("/namo-ags-colleges/admin", input),
  update: (id: string, input: Partial<NamoAgsCollegeInput>) => api.put<NamoAgsCollege>(`/namo-ags-colleges/admin/${id}`, input),
  remove: (id: string) => api.delete<NamoAgsCollege>(`/namo-ags-colleges/admin/${id}`),
};
