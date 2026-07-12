import { z } from "zod";
import {
  JOB_LOCATION_MAX_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  JOB_VACANCIES_MAX,
  JOB_VACANCIES_MIN,
} from "../constants";
import { stripHtml } from "../utils";

/**
 * The single source of truth for "is this job data valid".
 * Imported by the React form (via zodResolver) AND the Express route
 * handler, so the two can never drift out of sync.
 */
export const jobFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(
      JOB_TITLE_MAX_LENGTH,
      `Job title must be ${JOB_TITLE_MAX_LENGTH} characters or fewer`,
    ),
  location: z
    .string()
    .trim()
    .min(1, "Location is required")
    .max(
      JOB_LOCATION_MAX_LENGTH,
      `Location must be ${JOB_LOCATION_MAX_LENGTH} characters or fewer`,
    ),
  vacancies: z
    .number({ invalid_type_error: "Vacancies must be a number" })
    .int("Vacancies must be a whole number")
    .min(JOB_VACANCIES_MIN, `Vacancies must be at least ${JOB_VACANCIES_MIN}`)
    .max(JOB_VACANCIES_MAX, `Vacancies cannot exceed ${JOB_VACANCIES_MAX}`),
  aboutTheRole: z
    .string()
    .refine(
      (val) => stripHtml(val).length > 0,
      "About the Role cannot be empty",
    ),
  published: z.boolean(),
});

export type JobFormInput = z.infer<typeof jobFormSchema>;

/** Payload accepted by POST /api/jobs and PUT /api/jobs/:id */
export const createJobSchema = jobFormSchema;
export const updateJobSchema = jobFormSchema;

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

/**
 * Normalized Job entity returned by our API. This intentionally does NOT
 * mirror Webflow's raw item shape (fieldData, cmsLocaleId, etc.) — the
 * server's Webflow service adapts to/from this shape so the rest of the
 * app never has to know about Webflow's wire format.
 */
export interface Job {
  id: string;
  slug: string;
  title: string;
  location: string;
  vacancies: number;
  aboutTheRole: string;
  published: boolean;
  createdOn: string;
  lastUpdated: string;
}
