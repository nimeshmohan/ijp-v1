import type { AppUser, CreateUserInput } from "@ijp/shared";
import { apiClient } from "@/lib/apiClient";

export function fetchUsers(): Promise<{ items: AppUser[] }> {
  return apiClient.get<{ items: AppUser[] }>("/api/users");
}

export function createUser(input: CreateUserInput): Promise<AppUser> {
  return apiClient.post<AppUser>("/api/users", input);
}

export function setUserStatus(
  uid: string,
  disabled: boolean,
): Promise<AppUser> {
  return apiClient.patch<AppUser>(`/api/users/${uid}/status`, { disabled });
}

export function deleteUser(uid: string): Promise<void> {
  return apiClient.del(`/api/users/${uid}`);
}

export function requestPasswordReset(
  email: string,
): Promise<{ resetLink: string }> {
  return apiClient.post<{ resetLink: string }>("/api/users/reset-password", {
    email,
  });
}
