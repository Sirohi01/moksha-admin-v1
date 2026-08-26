import { api } from "./api";

export type ArogyaCouponApplicableTo = "single" | "group" | "both";
export type ArogyaCouponStatus = "available" | "used" | "inactive";

export interface ArogyaCoupon {
  _id: string;
  code: string;
  discountPercent: number;
  applicableTo: ArogyaCouponApplicableTo;
  status: ArogyaCouponStatus;
  usageLimit: number;
  usedCount: number;
  usedBy: string[];
}
export interface ArogyaCouponInput {
  code: string;
  discountPercent: number;
  applicableTo: ArogyaCouponApplicableTo;
  usageLimit: number;
  status: ArogyaCouponStatus;
}

export const arogyaCouponApi = {
  list: () => api.get<ArogyaCoupon[]>("/arogya-coupons/admin"),
  create: (input: ArogyaCouponInput) => api.post<ArogyaCoupon>("/arogya-coupons/admin", input),
  update: (id: string, input: Partial<Omit<ArogyaCouponInput, "code">>) => api.put<ArogyaCoupon>(`/arogya-coupons/admin/${id}`, input),
  remove: (id: string) => api.delete<null>(`/arogya-coupons/admin/${id}`),
};
