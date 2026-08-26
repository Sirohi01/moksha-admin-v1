import { api } from "./api";

export interface ArogyaDelegateRegistration {
  _id: string;
  delegateCode: string;
  groupId?: string;
  isGroupPrimary: boolean;
  title?: string;
  fullName: string;
  email: string;
  mobile: string;
  whatsappNumber?: string;
  designation?: string;
  organization?: string;
  country?: string;
  state?: string;
  city?: string;
  registrationType: "single" | "group";
  passName: string;
  amountPaise: number;
  selectedDays: number[];
  couponCode?: string;
  isSpeaker: boolean;
  dietary?: string;
  assistance?: string;
  documentUrl?: string;
  createdAt: string;
}

export interface ArogyaDelegateListFilters {
  registrationType?: "single" | "group";
  search?: string;
}

export type ArogyaPaymentMode = "CASH" | "CHEQUE" | "PAYTM" | "NEFT_RTGS" | "OTHER";

export interface ArogyaDelegateFormFields {
  title?: string;
  fullName: string;
  email: string;
  mobile: string;
  whatsappNumber?: string;
  designation?: string;
  organization?: string;
  country?: string;
  state?: string;
  city?: string;
  industryType?: string;
  areasOfInterest?: string;
  source?: string;
  isSpeaker?: boolean;
  dietary?: string;
  assistance?: string;
}

export interface OfflineSingleInput {
  passId: string;
  selectedDays: number[];
  couponCode?: string;
  paymentMode: ArogyaPaymentMode;
  note?: string;
  form: ArogyaDelegateFormFields;
}

export interface OfflineGroupInput {
  passId: string;
  selectedDays: number[];
  couponCode?: string;
  paymentMode: ArogyaPaymentMode;
  note?: string;
  groupSize: number;
  primary: ArogyaDelegateFormFields;
  members: ArogyaDelegateFormFields[];
}

export const arogyaDelegateApi = {
  list: (filters: ArogyaDelegateListFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.registrationType) params.set("registrationType", filters.registrationType);
    if (filters.search) params.set("search", filters.search);
    const query = params.toString();
    return api.get<ArogyaDelegateRegistration[]>(`/arogya-delegates/admin${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api.get<ArogyaDelegateRegistration>(`/arogya-delegates/admin/${id}`),
  createOfflineSingle: (input: OfflineSingleInput) =>
    api.post<ArogyaDelegateRegistration>("/arogya-delegates/admin/offline/single", input),
  createOfflineGroup: (input: OfflineGroupInput) =>
    api.post<ArogyaDelegateRegistration[]>("/arogya-delegates/admin/offline/group", input),
};
