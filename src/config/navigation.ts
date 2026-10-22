import {
  BanknoteArrowDown,
  Home,
  Package,
  Settings,
  ShoppingCart
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { UserRole } from "../types/auth";

export interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navigationItems: NavigationItem[] = [
  {
    path: "/home",
    label: "Inicio",
    icon: Home,
    roles: ["ADMIN"]
  },
  {
    path: "/sale",
    label: "Venta",
    icon: ShoppingCart,
    roles: ["ADMIN", "CASHIER"]
  },
  {
    path: "/inventory",
    label: "Inventario",
    icon: Package,
    roles: ["ADMIN", "CASHIER"]
  },
  {
    path: "/earnings",
    label: "Ganancias",
    icon: BanknoteArrowDown,
    roles: ["ADMIN"]
  },
  {
    path: "/settings",
    label: "Configuración",
    icon: Settings,
    roles: ["ADMIN", "CASHIER"]
  }
];
