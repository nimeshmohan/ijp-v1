// Explicit named re-exports (not `export *`) are required here: TypeScript
// compiles `export *` to a dynamic __exportStar helper in CommonJS output,
// which cjs-module-lexer (used by both esbuild and Rollup for CJS→ESM
// interop) cannot statically analyze. That silently breaks named imports
// of this package from the Vite-built client, in both dev and production,
// even though the server (plain Node `require`) never notices.

export {
  JOB_TITLE_MAX_LENGTH,
  JOB_LOCATION_MAX_LENGTH,
  JOB_VACANCIES_MIN,
  JOB_VACANCIES_MAX,
  WEBFLOW_COLLECTION_ID,
  USER_ROLES,
  ACTIVITY_ACTIONS,
} from "./constants";

export { stripHtml, slugify } from "./utils";

export {
  jobFormSchema,
  createJobSchema,
  updateJobSchema,
  type JobFormInput,
  type CreateJobInput,
  type UpdateJobInput,
  type Job,
} from "./types/job";

export {
  userRoleSchema,
  type UserRole,
  type AppUser,
  createUserSchema,
  type CreateUserInput,
  updateUserRoleSchema,
  type UpdateUserRoleInput,
} from "./types/user";

export {
  activityActionSchema,
  type ActivityAction,
  type ActivityLogEntry,
  type CreateActivityLogInput,
} from "./types/activityLog";
