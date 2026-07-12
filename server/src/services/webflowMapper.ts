import type { Job } from "@ijp/shared";
import { WEBFLOW_FIELD_SLUGS } from "../config/webflowFields";
import type { WebflowItem } from "../types/webflow";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Adapts Webflow's raw item wire format into our normalized domain `Job`. */
export function fromWebflowItem(item: WebflowItem): Job {
  const { fieldData } = item;
  return {
    id: item.id,
    slug: asString(fieldData.slug),
    title: asString(fieldData[WEBFLOW_FIELD_SLUGS.title]),
    location: asString(fieldData[WEBFLOW_FIELD_SLUGS.location]),
    vacancies: asNumber(fieldData[WEBFLOW_FIELD_SLUGS.vacancies]),
    aboutTheRole: asString(fieldData[WEBFLOW_FIELD_SLUGS.aboutTheRole]),
    published: !item.isDraft && !item.isArchived,
    createdOn: item.createdOn,
    lastUpdated: item.lastUpdated,
  };
}

interface JobFieldInput {
  title: string;
  location: string;
  vacancies: number;
  aboutTheRole: string;
}

/** Builds a Webflow `fieldData` payload from our domain input. */
export function toWebflowFieldData(
  input: JobFieldInput,
  slug: string,
): Record<string, unknown> {
  return {
    [WEBFLOW_FIELD_SLUGS.title]: input.title,
    slug,
    [WEBFLOW_FIELD_SLUGS.location]: input.location,
    [WEBFLOW_FIELD_SLUGS.vacancies]: input.vacancies,
    [WEBFLOW_FIELD_SLUGS.aboutTheRole]: input.aboutTheRole,
  };
}
