import type { Product } from "../../types/products";
import api from "../api/axios";

export interface GetProductRequest {
  id: string;
}

export const getProduct = async (data: GetProductRequest): Promise<Product> => {
  const response = await api.get(`/products/${data.id}`);
  return response.data;
};

export const searchProduct = async (query: string): Promise<Product[]> => {
  const response = await api.get(
    `/products/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

export interface ProductPayload {
  name: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
}

export const postProduct = async (data: ProductPayload): Promise<Product> => {
  const response = await api.post("/products", data);
  return response.data;
};

export const patchProduct = async (
  id: number,
  data: Partial<ProductPayload>
): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};
