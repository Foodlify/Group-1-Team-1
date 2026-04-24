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
  ItemName: String;
}
export interface ViewCartResponse {
  cartId: number;
  cartItems: CartItem[];
}

export interface CartItems {
  quantity: number;
  price: number;
}
