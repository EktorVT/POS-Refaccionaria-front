import api from "../api/axios";
import type {
  CategoryGroup,
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductPayload
} from "../../types/products";

export interface GetProductRequest {
  id: string;
}

export const getProducts = async (
  filters: ProductFilters = {}
): Promise<PaginatedProducts> => {
  const response = await api.get("/products", { params: filters });
  return response.data;
};

export const getCategories = async (): Promise<CategoryGroup[]> => {
  const response = await api.get("/products/categories");
  return response.data;
};

export const searchProduct = async (query: string): Promise<Product[]> => {
  const response = await api.get(
    `/products/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const postProduct = async (data: ProductPayload): Promise<Product> => {
  const response = await api.post("/products", data);
  return response.data;
};

export const patchProduct = async (
  id: number,
  data: Partial<Omit<ProductPayload, "stock">>
): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};
