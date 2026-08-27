import { api } from "./api";

export const NAMO_CONTENT_KINDS = ["BLOG", "FAQ", "TESTIMONIAL", "BANNER", "GALLERY_IMAGE", "GALLERY_VIDEO", "ABOUT", "ACHIEVEMENT", "INITIATIVE", "OBJECTIVE", "RECENT_UPDATE", "TRUST_BODY", "SEO", "SOCIAL_MEDIA", "HERO", "NEWSLETTER", "CATEGORY_IMAGE", "PUBLISHED", "SEO_CODE", "EVENT", "AGS_EVENT"] as const;
export type NamoContentKind = (typeof NAMO_CONTENT_KINDS)[number];
export type NamoContentStatus = "ACTIVE" | "INACTIVE";
export interface NamoContent {
  _id: string; kind: NamoContentKind; slug?: string; title?: string;
  payload: Record<string, unknown>; status: NamoContentStatus; order: number;
  createdAt: string; updatedAt: string;
}
export interface NamoContentInput {
  kind: NamoContentKind; slug?: string; title?: string;
  payload: Record<string, unknown>; status: NamoContentStatus; order: number;
}

export const namoContentApi = {
  list: (kind?: NamoContentKind, status?: NamoContentStatus) => {
    const params = new URLSearchParams();
    if (kind) params.set("kind", kind);
    if (status) params.set("status", status);
    return api.get<NamoContent[]>(`/namo-content/admin${params.size ? `?${params}` : ""}`);
  },
  create: (input: NamoContentInput) => api.post<NamoContent>("/namo-content/admin", input),
  update: (id: string, input: Partial<NamoContentInput>) => api.put<NamoContent>(`/namo-content/admin/${id}`, input),
  remove: (id: string) => api.delete<NamoContent>(`/namo-content/admin/${id}`),
  upload: (file: File) => {
    const data = new FormData(); data.append("file", file);
    return api.postForm<{ url: string; publicId: string }>("/namo-content/admin/upload?folder=cms", data);
  },
};
