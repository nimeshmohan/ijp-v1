import type { ActivityLogEntry, CreateActivityLogInput } from "@ijp/shared";
import { firestore } from "../config/firebaseAdmin";

const COLLECTION = "activityLogs";

// Safety cap for the in-memory pagination below — comfortably above what an
// internal HR tool's audit trail will realistically accumulate before this
// gets revisited with real Firestore cursor-based pagination.
const MAX_ENTRIES_READ = 1000;

export interface ListActivityLogParams {
  page?: number;
  pageSize?: number;
}

export interface ListActivityLogResult {
  items: ActivityLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export const activityLogService = {
  async record(input: CreateActivityLogInput): Promise<void> {
    await firestore.collection(COLLECTION).add({
      ...input,
      timestamp: new Date().toISOString(),
    });
  },

  async list(
    params: ListActivityLogParams = {},
  ): Promise<ListActivityLogResult> {
    const { page = 1, pageSize = 20 } = params;

    const snapshot = await firestore
      .collection(COLLECTION)
      .orderBy("timestamp", "desc")
      .limit(MAX_ENTRIES_READ)
      .get();

    const all = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as ActivityLogEntry,
    );

    const total = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return { items, total, page, pageSize };
  },

  async listRecent(limit: number): Promise<ActivityLogEntry[]> {
    const snapshot = await firestore
      .collection(COLLECTION)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as ActivityLogEntry,
    );
  },
};
