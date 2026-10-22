import api from "./api/axios";

import {
  type CreateEntryRequest,
  type InventoryMovement,
  type MovementFilters
} from "../types/inventory";
export const postEntry = async (
  data: CreateEntryRequest
): Promise<InventoryMovement> => {
  const response = await api.post("/inventory/entries", data);
  return response.data;
};

export const getMovements = async (
  filters: MovementFilters = {}
): Promise<InventoryMovement[]> => {
  const response = await api.get("/inventory/movements", { params: filters });
  return response.data;
};

export const getMovement = async (id: number): Promise<InventoryMovement> => {
  const response = await api.get(`/inventory/movements/${id}`);
  return response.data;
};

export const getProductMovements = async (
  productId: number
): Promise<InventoryMovement[]> => {
  const response = await api.get(`/inventory/movements/product/${productId}`);
  return response.data;
};
