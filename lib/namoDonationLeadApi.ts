import { api } from "./api";

export interface NamoDonationLead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  country: string;
  state: string;
  city: string;
  address: string;
  sewaType: string;
  donationPackage: string;
  amount: number;
  pan?: string;
  message?: string;
  anonymous: boolean;
  createdAt: string;
}

export const namoDonationLeadApi = {
  list: () => api.get<NamoDonationLead[]>("/namo-donation-leads/admin"),
};
