import type { Product } from "../types/products";

export interface CartItem {
  product: Product;
  quantity: number;
}
export function increaseQuantity(
  cart: CartItem[],
  productId: number
): CartItem[] {
  return cart.map((item) => {
    if (item.product.id !== productId) {
      return item;
    }

    if (item.quantity >= item.product.stock) {
      return item;
    }

    return {
      ...item,
      quantity: item.quantity + 1
    };
  });
}

export function decreaseQuantity(
  cart: CartItem[],
  productId: number
): CartItem[] {
  return cart
    .map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      return {
        ...item,
        quantity: item.quantity - 1
      };
    })
    .filter((item) => item.quantity > 0);
}

export const getStockStatus = (item: CartItem) => {
  const availableStock = item.product.stock - item.quantity;

  if (availableStock <= 0) {
    return "No stock";
  }

  if (availableStock <= 3) {
    return "Poco stock";
  }

  return null;
};

export function removeFromCart(
  cart: CartItem[],
  productId: number
): CartItem[] {
  return cart.filter((item) => item.product.id !== productId);
}
