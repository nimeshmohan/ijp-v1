import { Navigate, Outlet } from "react-router-dom";
import type { UserRole } from "@ijp/shared";
import { useAuth } from "@/providers/AuthProvider";

/** Guards a route (and its nested routes) to specific roles. Must run inside ProtectedRoute. */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { profile } = useAuth();

  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
