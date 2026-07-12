import { z } from "zod";
import { USER_ROLES } from "../constants";

export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

/** Application user profile, stored in Firestore and keyed by Firebase Auth uid. */
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  disabled: boolean;
  createdAt: string;
  createdBy: string;
}

export const createUserSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  displayName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  role: userRoleSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
