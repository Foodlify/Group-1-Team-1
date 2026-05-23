import { StatusCodes } from 'http-status-codes';
import { errorMessage } from '../../shared_infrastructure/error/errorMessages';

export class EmailAlreadyRegistered extends Error {
  constructor(
    public message: string = errorMessage.EMAIL_ALREADY_REGISTERED.message,
    public statusCode = StatusCodes.CONFLICT,
    public code = errorMessage.EMAIL_ALREADY_REGISTERED.code,
  ) {
    super(message);
  }
}

export class PhoneAlreadyRegistered extends Error {
  constructor(
    public message: string = errorMessage.PHONE_ALREADY_REGISTERED.message,
    public statusCode = StatusCodes.CONFLICT,
    public code = errorMessage.PHONE_ALREADY_REGISTERED.code,
  ) {
    super(message);
  }
}

export class InvalidCredentials extends Error {
  constructor(
    public message: string = errorMessage.INVALID_CREDENTIALS.message,
    public statusCode = StatusCodes.UNAUTHORIZED,
    public code = errorMessage.INVALID_CREDENTIALS.code,
  ) {
    super(message);
  }
}

export class InvalidToken extends Error {
  constructor(
    public message: string = errorMessage.INVALID_TOKEN.message,
    public statusCode = StatusCodes.UNAUTHORIZED,
    public code = errorMessage.INVALID_TOKEN.code,
  ) {
    super(message);
  }
}

export class CustomerNotFound extends Error {
  constructor(
    public message: string = errorMessage.CUSTOMER_NOT_FOUND.message,
    public statusCode = StatusCodes.NOT_FOUND,
    public code = errorMessage.CUSTOMER_NOT_FOUND.code,
  ) {
    super(message);
  }
}

export class PasswordMismatch extends Error {
  constructor(
    public message: string = errorMessage.PASSWORD_MISMATCH.message,
    public statusCode = StatusCodes.BAD_REQUEST,
    public code = errorMessage.PASSWORD_MISMATCH.code,
  ) {
    super(message);
  }
}
