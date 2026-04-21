import express from 'express';
import { CartController } from './cart.controller';

const router = express.Router();
const cartController = new CartController();

// POST   /api/v1/cart/add
router.post('/add', cartController.addToCart);

// GET    /api/v1/cart/customer/:customerId
router.get('/customer/:customerId', cartController.viewCart);

// PUT    /api/v1/cart/modify/:cartId  — update item quantity
router.put('/modify/:cartId', cartController.updateQuantity)

// DELETE   /api/v1/cart/modify/:cartId  — delete cart item
router.delete('/modify/:cartId', cartController.deleteCartItem)

// DELETE /api/v1/cart/clear/:customerId  — clear entire cart
router.delete('/clear/:customerId', cartController.clearCart);

export { router as cartRouter };
