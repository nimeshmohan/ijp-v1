import type { ActivityLogEntry } from "@ijp/shared";
import { apiClient } from "@/lib/apiClient";

export interface ListActivityLogParams {
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ListActivityLogResult {
  items: ActivityLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export function fetchActivityLogs(
  params: ListActivityLogParams,
): Promise<ListActivityLogResult> {
  return apiClient.get<ListActivityLogResult>("/api/activity-logs", params);
}
