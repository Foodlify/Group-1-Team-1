import { StatusCodes } from 'http-status-codes';

export class UserNotFound extends Error {
  constructor(
    public message   = 'User not found',
    public statusCode = StatusCodes.NOT_FOUND,
    public code      = 'UserNotFoundException',
  ) { super(message); }
}

export class UserEmailTaken extends Error {
  constructor(
    public message    = 'Email already registered',
    public statusCode = StatusCodes.CONFLICT,
    public code       = 'UserEmailTakenException',
  ) { super(message); }
}

export class InvalidCredentials extends Error {
  constructor(
    public message    = 'Invalid email or password',
    public statusCode = StatusCodes.UNAUTHORIZED,
    public code       = 'InvalidCredentialsException',
  ) { super(message); }
}

export class InvalidToken extends Error {
  constructor(
    public message    = 'Invalid or expired token',
    public statusCode = StatusCodes.UNAUTHORIZED,
    public code       = 'InvalidTokenException',
  ) { super(message); }
}

export class PasswordMismatch extends Error {
  constructor(
    public message    = 'Old password is incorrect',
    public statusCode = StatusCodes.BAD_REQUEST,
    public code       = 'PasswordMismatchException',
  ) { super(message); }
}

export class RoleNotFound extends Error {
  constructor(
    public message    = 'Role not found',
    public statusCode = StatusCodes.NOT_FOUND,
    public code       = 'RoleNotFoundException',
  ) { super(message); }
}
