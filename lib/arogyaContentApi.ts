import { api } from "./api";

export const AROGYA_CONTENT_KINDS = [
  "HERO", "CHAIRMAN_MESSAGE", "FOUNDER_MESSAGE", "FAQ_ITEM", "FAQ_SETTINGS",
  "GLIMPSE_SETTINGS", "GLIMPSE_GALLERY", "GLIMPSE_VIDEO", "GLIMPSE_COUNTER", "GLIMPSE_YEAR", "GLIMPSE_CATEGORY",
  "GLOBAL_VOICES_SETTINGS", "GLOBAL_VOICES_CATEGORY", "GLOBAL_VOICES_COUNTER", "GLOBAL_VOICES_SPEAKER", "GLOBAL_VOICES_CAROUSEL_SPEAKER",
  "PARTNER_CATEGORY", "PARTNER_LOGO", "PARTNER_SETTINGS",
  "SPEAKER_EMINENT", "SPEAKER_EMINENT_HEADING", "SPEAKER_EXPERT", "SPEAKER_EXPERT_HEADING",
  "SPEAKER_MORE_CATEGORY", "SPEAKER_MORE_ITEM", "SPEAKER_ORGANISING_HEADING", "SPEAKER_ORGANISING_MEMBER",
  "SPEAKER_PREVIOUS", "SPEAKER_PREVIOUS_HEADING", "SPEAKER_HERO", "SPEAKER_COUNTER",
  "SEO", "SOCIAL_MEDIA", "SETTINGS",
  "TESTIMONIAL_ITEM", "TESTIMONIAL_SETTINGS", "TESTIMONIAL_COUNTER", "VIDEO_TESTIMONIAL_ITEM",
  "SPEAKER_ESTEEMED", "SPEAKER_ESTEEMED_SETTINGS", "RESOURCE_SETTINGS", "PDF_CARD",
] as const;
export type ArogyaContentKind = (typeof AROGYA_CONTENT_KINDS)[number];
export type ArogyaContentStatus = "ACTIVE" | "INACTIVE";
export interface ArogyaContent {
  _id: string; kind: ArogyaContentKind; slug?: string; title?: string;
  payload: Record<string, unknown>; status: ArogyaContentStatus; order: number;
  createdAt: string; updatedAt: string;
}
export interface ArogyaContentInput {
  kind: ArogyaContentKind; slug?: string; title?: string;
  payload: Record<string, unknown>; status: ArogyaContentStatus; order: number;
}

export const arogyaContentApi = {
  list: (kind?: ArogyaContentKind, status?: ArogyaContentStatus) => {
    const params = new URLSearchParams();
    if (kind) params.set("kind", kind);
    if (status) params.set("status", status);
    return api.get<ArogyaContent[]>(`/arogya-content/admin${params.size ? `?${params}` : ""}`);
  },
  create: (input: ArogyaContentInput) => api.post<ArogyaContent>("/arogya-content/admin", input),
  update: (id: string, input: Partial<ArogyaContentInput>) => api.put<ArogyaContent>(`/arogya-content/admin/${id}`, input),
  remove: (id: string) => api.delete<ArogyaContent>(`/arogya-content/admin/${id}`),
  upload: (file: File) => {
    const data = new FormData(); data.append("file", file);
    return api.postForm<{ url: string; publicId: string }>("/arogya-content/admin/upload?folder=cms", data);
  },
};
