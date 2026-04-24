// cart Not found
// restaurant Not match
// quantity exceed
// cart item not found

import { StatusCodes } from 'http-status-codes';
import { errorMessage } from '../../shared_infrastructure/error/errorMessages';

export class CartNotFound extends Error {
  constructor(
    public message: string,
    public statusCode = StatusCodes.NOT_FOUND,
    public code = errorMessage.CART_NOT_FOUND.code,
  ) {
    super(message);
  }
}

export class CartItemNotFound extends Error {
  constructor(
    public message: string,
    public statusCode = StatusCodes.NOT_FOUND,
    public code = errorMessage.CART_ITEM_NOT_FOUND.code,
  ) {
    super(message);
  }
}
export class MenuItemNotFound extends Error {
  constructor(
    public message: string,
    public statusCode = StatusCodes.NOT_FOUND,
    public code = errorMessage.CART_ITEM_NOT_FOUND.code,
  ) {
    super(message);
  }
}
export class RestaurantNotMatch extends Error {
  constructor(
    public message: string,
    public statusCode = StatusCodes.BAD_REQUEST,
    public code = errorMessage.RESTAURANT_NOT_MATCH.code,
  ) {
    super(message);
  }
}
export class QuantityExceed extends Error {
  constructor(
    public message: string,
    public statusCode = StatusCodes.BAD_REQUEST,
    public code = errorMessage.QUANTITY_EXCEED.code,
  ) {
    super(message);
  }
}
