import type { CreateJobInput, Job, UpdateJobInput } from "@ijp/shared";
import { slugify } from "@ijp/shared";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { sanitizeRichText } from "../utils/sanitizeRichText";
import { webflowClient } from "./webflowClient";
import { fromWebflowItem, toWebflowFieldData } from "./webflowMapper";
import type {
  WebflowItem,
  WebflowListResponse,
  WebflowPublishResponse,
} from "../types/webflow";

const ITEMS_PATH = `/collections/${env.webflow.collectionId}/items`;

// Webflow caps list requests at 100 items per page. This is a safety cap on
// how many pages we'll walk for an internal job-postings collection that is
// never expected to hold anywhere near this many entries.
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

async function fetchAllItems(): Promise<WebflowItem[]> {
  const items: WebflowItem[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await webflowClient.get<WebflowListResponse>(ITEMS_PATH, {
      limit: PAGE_SIZE,
      offset,
    });
    items.push(...res.items);
    offset += res.items.length;
    if (res.items.length === 0 || offset >= res.pagination.total) break;
  }

  return items;
}

async function isSlugTaken(slug: string): Promise<boolean> {
  const res = await webflowClient.get<WebflowListResponse>(ITEMS_PATH, {
    slug,
    limit: 1,
  });
  return res.items.length > 0;
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  if (!base) {
    throw new AppError(
      "Job title must contain at least one letter or number.",
      400,
    );
  }

  let candidate = base;
  let suffix = 2;
  while (await isSlugTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export type JobSortField =
  "title" | "location" | "vacancies" | "lastUpdated" | "createdOn";
export type SortOrder = "asc" | "desc";

export interface ListJobsParams {
  search?: string;
  sortBy?: JobSortField;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface ListJobsResult {
  items: Job[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * All reads/writes against the single Job Postings collection
 * (`WEBFLOW_COLLECTION_ID`). No other collection is ever addressed.
 *
 * Webflow's list endpoint only supports exact-match filters, not free-text
 * search, so search/sort/pagination are applied in memory here after
 * fetching the (small, internal-tool-sized) full item set.
 */
export const webflowService = {
  async listJobs(params: ListJobsParams = {}): Promise<ListJobsResult> {
    const {
      search,
      sortBy = "lastUpdated",
      sortOrder = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    const rawItems = await fetchAllItems();
    let jobs = rawItems.map(fromWebflowItem);

    if (search && search.trim()) {
      const needle = search.trim().toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(needle) ||
          job.location.toLowerCase().includes(needle),
      );
    }

    const dir = sortOrder === "asc" ? 1 : -1;
    jobs = [...jobs].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * dir;
      }
      return String(aValue).localeCompare(String(bValue)) * dir;
    });

    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const items = jobs.slice(start, start + pageSize);

    return { items, total, page, pageSize };
  },

  async getJobStats(): Promise<{
    total: number;
    published: number;
    draft: number;
  }> {
    const rawItems = await fetchAllItems();
    const jobs = rawItems.map(fromWebflowItem);
    const published = jobs.filter((job) => job.published).length;
    return { total: jobs.length, published, draft: jobs.length - published };
  },

  async getJob(id: string): Promise<Job> {
    const item = await webflowClient.get<WebflowItem>(`${ITEMS_PATH}/${id}`);
    return fromWebflowItem(item);
  },

  async createJob(input: CreateJobInput): Promise<Job> {
    const slug = await generateUniqueSlug(input.title);
    const fieldData = toWebflowFieldData(
      { ...input, aboutTheRole: sanitizeRichText(input.aboutTheRole) },
      slug,
    );

    const created = await webflowClient.post<WebflowItem>(ITEMS_PATH, {
      isArchived: false,
      isDraft: !input.published,
      fieldData,
    });

    if (input.published) {
      await webflowClient.post<WebflowPublishResponse>(
        `${ITEMS_PATH}/publish`,
        {
          itemIds: [created.id],
        },
      );
      return webflowService.getJob(created.id);
    }

    return fromWebflowItem(created);
  },

  async updateJob(id: string, input: UpdateJobInput): Promise<Job> {
    // The slug is intentionally never regenerated on edit: changing it would
    // silently break a URL that may already be live and indexed.
    const existing = await webflowClient.get<WebflowItem>(
      `${ITEMS_PATH}/${id}`,
    );
    const slug =
      typeof existing.fieldData.slug === "string" && existing.fieldData.slug
        ? existing.fieldData.slug
        : await generateUniqueSlug(input.title);

    const fieldData = toWebflowFieldData(
      { ...input, aboutTheRole: sanitizeRichText(input.aboutTheRole) },
      slug,
    );

    await webflowClient.patch<WebflowItem>(`${ITEMS_PATH}/${id}`, {
      isArchived: false,
      isDraft: !input.published,
      fieldData,
    });

    if (input.published) {
      await webflowClient.post<WebflowPublishResponse>(
        `${ITEMS_PATH}/publish`,
        {
          itemIds: [id],
        },
      );
    }

    return webflowService.getJob(id);
  },

  async deleteJob(id: string): Promise<void> {
    await webflowClient.del(`${ITEMS_PATH}/${id}`);
  },

  async publishJob(id: string): Promise<Job> {
    await webflowClient.post<WebflowPublishResponse>(`${ITEMS_PATH}/publish`, {
      itemIds: [id],
    });
    return webflowService.getJob(id);
  },
};
