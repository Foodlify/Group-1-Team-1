// ─── Request Body Types ───────────────────────────────────────────────────────

export interface AddToCartItemInput {
  itemId: number;
  quantity: number;
}

export interface AddToCartInput {
  customerId: number;
  restaurantId: number;
  items: AddToCartItemInput[];
}

export interface ModifyCartInput {
  customerId: number;
  cartId?: number;
  itemId: number;
  quantity: number
}

export interface DeleteCartItem {
  customerId: number;
  itemId: number;
  cartId?: number;
}
// ─── Response Types ───────────────────────────────────────────────────────────

export interface CartItemResult {
  cartItemId: number;
  cartId: number;
  menuItemId: number;
  quantity: number;
  itemName: string;
  price: number;
}

export interface CartResult {
  cartId: number;
  userId: number;
  items: CartItemResult[];
}
