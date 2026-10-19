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
    label: "navigation.home",
    icon: Home,
    roles: ["ADMIN"]
  },
  {
    path: "/sale",
    label: "navigation.sale",
    icon: ShoppingCart,
    roles: ["ADMIN", "CASHIER"]
  },
  {
    path: "/inventory",
    label: "navigation.inventory",
    icon: Package,
    roles: ["ADMIN", "CASHIER"]
  },
  {
    path: "/earnings",
    label: "navigation.earnings",
    icon: BanknoteArrowDown,
    roles: ["ADMIN"]
  },
  {
    path: "/settings",
    label: "navigation.settings",
    icon: Settings,
    roles: ["ADMIN", "CASHIER"]
  }
];
