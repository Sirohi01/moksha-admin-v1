import { api } from "./api";

export type ArogyaCategoryType = "single" | "group" | "both";

export interface ArogyaCategory {
  _id: string;
  name: string;
  type: ArogyaCategoryType;
}
export interface ArogyaCategoryInput {
  name: string;
  type: ArogyaCategoryType;
}

export const arogyaCategoryApi = {
  list: () => api.get<ArogyaCategory[]>("/arogya-categories/admin"),
  create: (input: ArogyaCategoryInput) => api.post<ArogyaCategory>("/arogya-categories/admin", input),
  update: (id: string, input: Partial<ArogyaCategoryInput>) => api.put<ArogyaCategory>(`/arogya-categories/admin/${id}`, input),
  remove: (id: string) => api.delete<null>(`/arogya-categories/admin/${id}`),
};
