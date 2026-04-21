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
  itemId: number;
  itemQuantity: number;
}
export interface ModifyCartResult {
  customerId: number;
  cartId: number;
  itemId: number;
  itemQuantity: number;
  totalPrice?: number;
  totalQuantity?: number;
}

export interface DeleteCartItemInput {
  customerId: number;
  itemId: number;
}
export interface DeleteCartItemResult {
  customerId: number;
  cartId:number,
  itemId: number;
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
