import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/Auth/useAuth";
import { getDefaultRoute } from "../config/routes";

export default function GuestRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <Outlet />;
}
