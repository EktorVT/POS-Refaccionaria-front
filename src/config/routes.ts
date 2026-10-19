import type { UserRole } from "../types/auth";

export function getDefaultRoute(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/home";

    case "CASHIER":
      return "/sale";
  }
}
