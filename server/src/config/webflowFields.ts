/**
 * Maps our domain field names to this Webflow collection's field slugs.
 * "name" and "slug" are Webflow's built-in fields present on every
 * collection; the rest are custom fields on the Job Postings collection.
 *
 * If your Webflow collection's custom fields use different slugs than the
 * defaults below, this is the only file that needs to change — nothing
 * else in the app references raw Webflow field slugs directly.
 */
export const WEBFLOW_FIELD_SLUGS = {
  title: "name",
  location: "location",
  vacancies: "vacancies",
  aboutTheRole: "about-the-role",
} as const;
