import type { ActivityLogEntry } from "@ijp/shared";
import { apiClient } from "@/lib/apiClient";

export interface DashboardSummary {
  totalJobs: number;
  publishedJobs: number;
  draftJobs: number;
  recentActivity: ActivityLogEntry[];
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>("/api/dashboard/summary");
}
