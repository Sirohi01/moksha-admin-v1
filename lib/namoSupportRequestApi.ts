import { api } from "./api";

export interface NamoSupportRequest {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  supportType: string;
  fullAddress: string;
  state: string;
  city: string;
  prefferedContribution: string;
  message: string;
  createdAt: string;
}

export const namoSupportRequestApi = {
  list: () => api.get<NamoSupportRequest[]>("/namo-support-requests/admin"),
};
