export enum ErrorStatus {
  BAD_REQUEST = 400,  //  bad request
  UNAUTHORIZED = 401, // user credentials are wrong
  VALIDATION_ERROR = 402, // validation failed
  FORBIDDEN = 403,    // user hasn't role to access endpoint
  NOT_FOUND = 404,    // data not found in DB
  CONFLICT = 409,     // email already exist , idempotency violation 
  INTERNAL_SERVER_ERROR = 500,  // server not respond
}