// ─── Request Body Types ───────────────────────────────────────────────────────

export interface AddToCartItemInput {
  itemId: number;
  quantity: number;
}

export interface CartInput {
  userId: number;
  items: AddToCartItemInput[];
}

export interface AddToCartInput extends CartInput {
  restaurantId: number;
}

export interface ModifyCartInput extends CartInput {
  cartId?:number
}


export interface DeleteCartItem {
  userId: number;
  itemId: number;
  cartId?:number
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
