import redisClient from '../../../lib/redis';
import { CartRedisItem, CartRedisMeta, CartRedisData } from './cart.model';

/**
 * Redis key format:
 *   cart:{customerId}          → Hash   — cart metadata (restaurantId, isLocked)
 *   cart:{customerId}:items    → Hash   — cartItemId → JSON CartRedisItem
 *   cart:{customerId}:counter  → String — auto-increment for cart-item IDs
 */


// ─── Key helpers ──────────────────────────────────────────────────────────────

const cartKey    = (id: number) => `cart:${id}`;
const itemsKey   = (id: number) => `cart:${id}:items`;
const counterKey = (id: number) => `cart:${id}:counter`;

// ─── Repository ───────────────────────────────────────────────────────────────
// Uses the singleton redisClient — connected once at startup in app.ts.
// The client's reconnectStrategy handles any later disconnects automatically.

export class CartRedisRepository {
  // ── Read ────────────────────────────────────────────────────────────────────

  /** Returns null when the customer has no active cart. */
  static async findCartByCustomerId(customerId: number): Promise<CartRedisData | null> {
    const meta = await redisClient.hGetAll(cartKey(customerId));
    if (!meta || Object.keys(meta).length === 0) return null;

    const rawItems = await redisClient.hGetAll(itemsKey(customerId));
    const items: CartRedisItem[] = Object.values(rawItems).map((v) => JSON.parse(v));

    return {
      customerId,
      restaurantId: Number(meta.restaurantId),
      isLocked: meta.isLocked === 'true',
      items,
    };
  }

  /** Get a single cart item by its cart-item ID. */
  static async findCartItemById(
    customerId: number,
    cartItemId: number,
  ): Promise<CartRedisItem | null> {
    const raw = await redisClient.hGet(itemsKey(customerId), String(cartItemId));
    if (!raw) return null;
    return JSON.parse(raw) as CartRedisItem;
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  /** Create a brand-new cart with the customer's first item. */
  static async createCartWithItem(
    customerId: number,
    restaurantId: number,
    item: Omit<CartRedisItem, 'id'>,
  ): Promise<CartRedisData> {
    await redisClient.set(counterKey(customerId), '1');
    const newItem: CartRedisItem = { id: 1, ...item };

    await redisClient.hSet(cartKey(customerId), {
      restaurantId: String(restaurantId),
      isLocked: 'false',
    });
    await redisClient.hSet(itemsKey(customerId), '1', JSON.stringify(newItem));

    return { customerId, restaurantId, isLocked: false, items: [newItem] };
  }

  /** Add a new item to an existing cart. Returns the created item. */
  static async addItemToCart(
    customerId: number,
    item: Omit<CartRedisItem, 'id'>,
  ): Promise<CartRedisItem> {
    const newId = await redisClient.incr(counterKey(customerId));
    const newItem: CartRedisItem = { id: newId, ...item };
    await redisClient.hSet(itemsKey(customerId), String(newId), JSON.stringify(newItem));
    return newItem;
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  /** Update the quantity of an existing cart item. */
  static async updateCartItemQuantity(
    customerId: number,
    cartItemId: number,
    quantity: number,
  ): Promise<CartRedisItem | null> {
    const raw = await redisClient.hGet(itemsKey(customerId), String(cartItemId));
    if (!raw) return null;

    const item: CartRedisItem = { ...JSON.parse(raw), quantity };
    await redisClient.hSet(itemsKey(customerId), String(cartItemId), JSON.stringify(item));
    return item;
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  /** Remove one item. Returns true if it existed. */
  static async deleteCartItem(customerId: number, cartItemId: number): Promise<boolean> {
    const removed = await redisClient.hDel(itemsKey(customerId), String(cartItemId));
    return removed > 0;
  }

  /** Wipe the entire cart (metadata + items + counter). */
  static async clearCart(customerId: number): Promise<void> {
    await redisClient.del([cartKey(customerId), itemsKey(customerId), counterKey(customerId)]);
  }

  // ── Lock / Unlock ───────────────────────────────────────────────────────────

  static async lockCart(customerId: number): Promise<void> {
    await redisClient.hSet(cartKey(customerId), 'isLocked', 'true');
  }

  static async unlockCart(customerId: number): Promise<void> {
    await redisClient.hSet(cartKey(customerId), 'isLocked', 'false');
  }
}
