import type { UserRole } from "./auth";

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
