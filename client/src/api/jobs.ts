import type { CreateJobInput, Job, UpdateJobInput } from "@ijp/shared";
import { apiClient } from "@/lib/apiClient";

export type JobSortField =
  "title" | "location" | "vacancies" | "lastUpdated" | "createdOn";

export interface ListJobsParams {
  search?: string;
  sortBy?: JobSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ListJobsResult {
  items: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export function fetchJobs(params: ListJobsParams): Promise<ListJobsResult> {
  return apiClient.get<ListJobsResult>("/api/jobs", params);
}

export function fetchJob(id: string): Promise<Job> {
  return apiClient.get<Job>(`/api/jobs/${id}`);
}

export function createJob(input: CreateJobInput): Promise<Job> {
  return apiClient.post<Job>("/api/jobs", input);
}

export function updateJob(id: string, input: UpdateJobInput): Promise<Job> {
  return apiClient.put<Job>(`/api/jobs/${id}`, input);
}

export function deleteJob(id: string): Promise<void> {
  return apiClient.del(`/api/jobs/${id}`);
}

export function publishJob(id: string): Promise<Job> {
  return apiClient.post<Job>(`/api/jobs/${id}/publish`);
}
