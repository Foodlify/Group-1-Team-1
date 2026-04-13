// ─── Request Body Types ───────────────────────────────────────────────────────

export interface AddToCartItemInput {
  itemId: number;
  quantity: number;
}

export interface AddToCartInput {
  userId: number;
  restaurantId: number;
  items: AddToCartItemInput[];
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface CartItemResult {
  id: number;
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
