import api from "../api/axios";

interface ItemSale {
  productId: number;
  quantity: number;
}

export interface PostSaleRequest {
  products: ItemSale[];
}

export const postSale = async (data: PostSaleRequest) => {
  const response = await api.post("/sales", data);
  return response.data;
};
