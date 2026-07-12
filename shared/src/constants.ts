/**
 * Domain-wide constants shared between client and server.
 * Keeping these in one place avoids magic numbers/strings drifting
 * between frontend validation and backend validation.
 */

export const JOB_TITLE_MAX_LENGTH = 200;
export const JOB_LOCATION_MAX_LENGTH = 200;
export const JOB_VACANCIES_MIN = 1;
export const JOB_VACANCIES_MAX = 1000;

/** The single Webflow CMS collection this application is permitted to touch. */
export const WEBFLOW_COLLECTION_ID = "6a533add938a981683bbfe8b";

export const USER_ROLES = ["admin", "hr"] as const;

export const ACTIVITY_ACTIONS = [
  "CREATE_JOB",
  "UPDATE_JOB",
  "DELETE_JOB",
  "PUBLISH_JOB",
  "UNPUBLISH_JOB",
  "CREATE_USER",
  "DISABLE_USER",
  "ENABLE_USER",
  "DELETE_USER",
  "RESET_PASSWORD",
] as const;
