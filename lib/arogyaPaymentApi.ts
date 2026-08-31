import { api } from "./api";

export type ArogyaPaymentGateway = "RAZORPAY" | "OFFLINE";
export type ArogyaPaymentStatus = "CREATED" | "PAID" | "FAILED";

export interface ArogyaPayment {
  _id: string;
  gateway: ArogyaPaymentGateway;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  amountPaise: number;
  currency: string;
  status: ArogyaPaymentStatus;
  passId?: { _id: string; name: string } | null;
  selectedDays: number[];
  registrationType: "single" | "group";
  groupSize: number;
  couponCode?: string;
  delegateRegistrationId?: { _id: string; fullName: string; delegateCode: string } | null;
  paymentMode?: string;
  note?: string;
  recordedBy?: { _id: string; name: string } | null;
  createdAt: string;
}

export interface ArogyaPaymentListFilters {
  status?: ArogyaPaymentStatus;
  gateway?: ArogyaPaymentGateway;
}

export const arogyaPaymentApi = {
  list: (filters: ArogyaPaymentListFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.gateway) params.set("gateway", filters.gateway);
    const query = params.toString();
    return api.get<ArogyaPayment[]>(`/arogya-payments/admin${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api.get<ArogyaPayment>(`/arogya-payments/admin/${id}`),
};
