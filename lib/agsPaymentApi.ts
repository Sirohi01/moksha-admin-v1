import { api } from "./api";

export type AgsPaymentMode = "CASH" | "CHEQUE" | "PAYTM" | "NEFT_RTGS" | "PAYMENT_GATEWAY";
export type AgsPaymentStatus = "ACTIVE" | "CANCELLED";

export interface AgsPayment {
  _id: string;
  agsDelegateId: string;
  registrationNo: string;
  paymentFor?: string;
  seminarDay?: string;
  aadharOrPanMasked?: string;
  amount: number;
  paymentMode: AgsPaymentMode;
  bankName?: string;
  chequeNo?: string;
  dateOfIssue?: string;
  branch?: string;
  paytmNo?: string;
  upiId?: string;
  transactionId?: string;
  bankReferenceNo?: string;
  orderNo?: string;
  status: AgsPaymentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgsPaymentInput {
  agsDelegateId: string;
  paymentFor?: string;
  seminarDay?: string;
  aadharOrPanNo?: string;
  amount: number;
  paymentMode: AgsPaymentMode;
  bankName?: string;
  chequeNo?: string;
  dateOfIssue?: string;
  branch?: string;
  paytmNo?: string;
  upiId?: string;
  transactionId?: string;
  bankReferenceNo?: string;
  orderNo?: string;
}

export const agsPaymentApi = {
  list: (agsDelegateId?: string) =>
    api.get<AgsPayment[]>(`/ags-payments/admin${agsDelegateId ? `?agsDelegateId=${encodeURIComponent(agsDelegateId)}` : ""}`),
  getById: (id: string) => api.get<AgsPayment>(`/ags-payments/admin/${id}`),
  create: (input: AgsPaymentInput) => api.post<AgsPayment>("/ags-payments/admin", input),
  update: (id: string, input: Partial<Omit<AgsPaymentInput, "agsDelegateId">>) =>
    api.put<AgsPayment>(`/ags-payments/admin/${id}`, input),
  cancel: (id: string) => api.put<AgsPayment>(`/ags-payments/admin/${id}/cancel`),
};
