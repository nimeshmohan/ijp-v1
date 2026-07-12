import { z } from "zod";
import { ACTIVITY_ACTIONS } from "../constants";

export const activityActionSchema = z.enum(ACTIVITY_ACTIONS);
export type ActivityAction = z.infer<typeof activityActionSchema>;

/** A single audit trail entry, stored in Firestore's `activityLogs` collection. */
export interface ActivityLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: ActivityAction;
  cmsItemId: string | null;
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  timestamp: string;
}

export type CreateActivityLogInput = Omit<ActivityLogEntry, "id" | "timestamp">;
