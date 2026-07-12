import type { ActivityAction } from "@ijp/shared";

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  CREATE_JOB: "Created a job posting",
  UPDATE_JOB: "Updated a job posting",
  DELETE_JOB: "Deleted a job posting",
  PUBLISH_JOB: "Published a job posting",
  UNPUBLISH_JOB: "Unpublished a job posting",
  CREATE_USER: "Created a user",
  DISABLE_USER: "Disabled a user",
  ENABLE_USER: "Enabled a user",
  DELETE_USER: "Deleted a user",
  RESET_PASSWORD: "Reset a password",
};
