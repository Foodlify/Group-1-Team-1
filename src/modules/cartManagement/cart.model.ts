// ─── Request Body Types ───────────────────────────────────────────────────────

// add - update quantity
export interface CartItemInput {
  customerId: number;
  itemId: number;
  itemQuantity: number;
}

export interface DeleteCartItemInput {
  customerId: number;
  itemId: number;
}

export interface CartItemResponse {
  customerId: number;
  itemId: number;
  itemQuantity: number;
  itemName: string;
}
export interface DeleteCartItemResponse {
  itemId: number;
  itemName: string;
}

export interface CartItem {
  itemId: number;
  itemQuantity: number;
  itemPrice: number;
  itemName: String;
}
export interface ViewCartResponse {
  cartId: number;
  cartItems: CartItem[];
}

export interface CartItems {
  quantity: number;
  price: number;
}

// ─── Redis Cart Types ─────────────────────────────────────────────────────────

export interface CartRedisItem {
  id: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartRedisMeta {
  customerId: number;
  restaurantId: number;
  isLocked: boolean;
}

export interface CartRedisData extends CartRedisMeta {
  items: CartRedisItem[];
}
