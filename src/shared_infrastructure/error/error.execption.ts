import { StatusCodes } from 'http-status-codes';
import { errorMessage } from './errorMessages';

export class NotFound extends Error {
  constructor(
    public record: string,
    public message=`${record} ${errorMessage.NOT_FOUND.message}`,
    public code = `${record}${errorMessage.NOT_FOUND.code}`,
    public statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message);
    this.record = record;
  }
}
