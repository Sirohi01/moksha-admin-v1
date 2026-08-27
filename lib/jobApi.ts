import { api } from "./api";

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface Job {
  _id: string;
  title: string;
  slug: string;
  department?: string;
  location: string;
  employmentType: string;
  summary: string;
  description: string;
  requirements: string[];
  experienceText?: string;
  salaryText?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  status: JobStatus;
  publishedAt?: string;
  closesAt?: string;
  createdAt: string;
}

export interface JobInput {
  title: string;
  slug: string;
  department?: string;
  location: string;
  employmentType: string;
  summary: string;
  description: string;
  requirements: string[];
  experienceText?: string;
  salaryText?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  status: JobStatus;
  closesAt?: string;
}

export const jobApi = {
  list: (status?: JobStatus) => api.get<Job[]>(`/jobs/admin${status ? `?status=${status}` : ""}`),
  create: (input: JobInput) => api.post<Job>("/jobs/admin", input),
  update: (id: string, input: Partial<JobInput>) => api.put<Job>(`/jobs/admin/${id}`, input),
  remove: (id: string) => api.delete<Job>(`/jobs/admin/${id}`),
};
