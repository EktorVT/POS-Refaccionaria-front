import type { Product } from "./products";

export const MovementType = {
  IN: "IN",
  OUT: "OUT"
} as const;

export type MovementType = (typeof MovementType)[keyof typeof MovementType];

export const movementTypeLabel: Record<MovementType, string> = {
  IN: "Entrada",
  OUT: "Venta"
};

export interface InventoryMovement {
  id: number;
  productId: number;
  product: Product;
  type: MovementType;
  quantity: number;
  unitCost: number;
  stockBefore: number;
  stockAfter: number;
  userId: number;
  user: { id: number; username: string };
  createdAt: string;
}

export interface CreateEntryRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface MovementFilters {
  type?: MovementType;
  productId?: number;
  userId?: number;
  from?: string;
  to?: string;
}
