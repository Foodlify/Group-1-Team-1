import express from 'express';
import { CartController } from './cart.controller';
import { authCustomer as authValidator } from '../../middlewares/auth_handling/auth.middleware';
import { validate } from '../../shared_infrastructure/middleware/validate';
import { CartSchema, DeleteCartSchema } from './cart.validation';

const router = express.Router();
const cartController = new CartController();

// POST /api/v1/cart
router.post('/', authValidator, validate(CartSchema), cartController.addToCart);

// GET /api/v1/cart
router.get('/', authValidator, cartController.viewCart);

// DELETE /api/v1/cart
router.delete('/', authValidator, cartController.clearCart);

// PATCH /api/v1/cart/:itemId
router.patch(
  '/:itemId',
  authValidator,
  validate(CartSchema, (req) => ({ ...req.body, itemId: req.params.itemId })),
  cartController.updateQuantity,
);

// DELETE /api/v1/cart/:itemId
router.delete(
  '/:itemId',
  authValidator,
  validate(DeleteCartSchema, (req) => ({ itemId: req.params.itemId })),
  cartController.deleteCartItem,
);

// GET /api/v1/cart/price-quantity
router.get('/price-quantity', authValidator, cartController.getTotalPriceAndQuantity);

export { router as cartRouter };
