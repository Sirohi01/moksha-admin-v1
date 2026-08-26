import { api } from "./api";

export type ArogyaPassApplicableTo = "both" | "single" | "group";
export type ArogyaPassStatus = "active" | "inactive";

export interface ArogyaPass {
  _id: string;
  name: string;
  price: number;
  daysText: string;
  applicableTo: ArogyaPassApplicableTo;
  includes: string[];
  isMostPopular: boolean;
  status: ArogyaPassStatus;
  order: number;
}
export type ArogyaPassInput = Omit<ArogyaPass, "_id">;

export const arogyaPassApi = {
  list: () => api.get<ArogyaPass[]>("/arogya-passes/admin?all=true"),
  create: (input: ArogyaPassInput) => api.post<ArogyaPass>("/arogya-passes/admin", input),
  update: (id: string, input: Partial<ArogyaPassInput>) => api.put<ArogyaPass>(`/arogya-passes/admin/${id}`, input),
  remove: (id: string) => api.delete<null>(`/arogya-passes/admin/${id}`),
};
