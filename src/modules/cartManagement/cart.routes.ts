import express from 'express';
import { addToCartController } from './controllers/addToCart.controller';
import { clearCartController } from './controllers/clearCart.controller';
import { viewCartController } from './controllers/viewCart.controller';
import { deleteItemController } from './controllers/deleteItem.controller';
import { updateQuantityController } from './controllers/updateQuantity.controller';


const router = express.Router();


router.route('/add').post(addToCartController);

router
  .route('modify/:cart-id')
  .post(updateQuantityController)
  .delete(deleteItemController);

router
.route('/:cart-id').get(viewCartController)
.delete(clearCartController);

export { router as cartRouter };
