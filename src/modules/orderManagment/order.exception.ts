import { StatusCodes } from "http-status-codes";
import { errorMessage } from "../../shared_infrastructure/error/errorMessages";

export class PriceNotMatch extends Error {
  constructor(
    public message: string,
    public statusCode = StatusCodes.BAD_REQUEST,
    public code = errorMessage.PRICE_NOT_MATCH.code,
  ) {
    super(message);
  }
}
