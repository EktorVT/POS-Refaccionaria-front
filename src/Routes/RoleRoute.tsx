import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/Auth/useAuth";
import type { UserRole } from "../types/auth";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
