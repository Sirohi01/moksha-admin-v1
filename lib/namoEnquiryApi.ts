import { api } from "./api";

export interface NamoEnquiry {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  createdAt: string;
}

export const namoEnquiryApi = {
  list: () => api.get<NamoEnquiry[]>("/namo-enquiries/admin"),
};
