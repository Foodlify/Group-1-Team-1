import { StatusCodes } from 'http-status-codes';
import { errorMessage } from './errorMessages';

export class NOT_FOUND extends Error {
  constructor(
    public record: string,
    public message = `${record} ${errorMessage.NOT_FOUND.message}`,
    public code = `${record}${errorMessage.NOT_FOUND.code}`,
    public statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message);
    this.record = record;
  }
}
export class BAD_REQUEST extends Error {
  constructor(
    public record: string,
    public message = `${record} ${errorMessage.BAD_REQUEST.message}`,
    public code = `${record}${errorMessage.BAD_REQUEST.code}`,
    public statusCode = StatusCodes.BAD_REQUEST,
  ) {
    super(message);
    this.record = record;
  }
}
