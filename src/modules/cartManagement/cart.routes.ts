import express from 'express';
import { CartController } from './cart.controller';
import {
  addCartValidator,
  updateCartValidator,
  deleteCartValidator,
} from './cart.middleware';
import { authValidator } from '../../middlewares/auth_handling/auth-handling';

const router = express.Router();
const cartController = new CartController();

// POST   /api/v1/cart — add item to cart
router.post('/', authValidator, addCartValidator, cartController.addToCart);

// GET    /api/v1/cart — get entire cart
router.get('/', authValidator, cartController.viewCart);

// DELETE /api/v1/cart  — clear entire cart
router.delete('/', authValidator, cartController.clearCart);

// PUT    /api/v1/cart/:itemId — update item quantity
router.patch(
  '/:itemId',
  authValidator,
  updateCartValidator,
  cartController.updateQuantity,
);

// DELETE   /api/v1/cart/:itemId  — delete cart item
router.delete(
  '/:itemId',
  authValidator,
  deleteCartValidator,
  cartController.deleteCartItem,
);

// GET    /api/v1/cart — get total price of items in cart
router.get('/price', authValidator, cartController.getTotalPrice);
// GET    /api/v1/cart — get total amount  of items in cart
router.get('/quantity', authValidator, cartController.getTotalQuantity);

export { router as cartRouter };
