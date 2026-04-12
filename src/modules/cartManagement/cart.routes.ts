import express from 'express';
import { addToCartController } from './controllers/cart.controller';
import { clearCartController } from './controllers/cart.controller';
import { viewCartController } from './controllers/cart.controller';
import { deleteItemController } from './controllers/cart.controller';
import { updateQuantityController } from './controllers/cart.controller';


const router = express.Router();


router.route('/add').post(addToCartController);

router
  .route('modify/:cart-id')
  .put(updateQuantityController)
  .delete(deleteItemController);

router
.route('/:cart-id').get(viewCartController)
.delete(clearCartController);

export { router as cartRouter };
