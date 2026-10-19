import { type CartItem } from "./cart.utils";

export function createSaleData(cart: CartItem[]) {
  return {
    products: cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity
    }))
  };
}
