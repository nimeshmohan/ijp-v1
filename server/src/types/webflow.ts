/** Raw shapes returned by the Webflow Data API v2 — internal to the server. */

export interface WebflowItem {
  id: string;
  cmsLocaleId?: string;
  lastPublished: string | null;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: Record<string, unknown>;
}

export interface WebflowListResponse {
  items: WebflowItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface WebflowPublishResponse {
  publishedItemIds: string[];
  errors?: string[];
}
