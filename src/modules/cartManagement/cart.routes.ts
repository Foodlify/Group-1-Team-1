import express from 'express';
import { CartController } from './cart.controller';

const router = express.Router();
const cartController = new CartController();

// POST   /api/v1/cart/add
router.post('/add', cartController.addToCart);

// GET    /api/v1/cart/:cartId
router.get('/:cartId', cartController.viewCart);

// PUT    /api/v1/cart/modify/:cartId  — update item quantity
router.put('/modify/:cartId', cartController.updateQuantity);

// DELETE /api/v1/cart/:cartId  — clear entire cart
router.delete('/:cartId', cartController.clearCart);

export { router as cartRouter };
