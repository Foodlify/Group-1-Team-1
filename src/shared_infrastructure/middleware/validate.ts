import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { StatusCodes } from 'http-status-codes';

export function validate(
  schema: ZodType,
  getData?: (req: Request) => unknown,
) {
  const isBodyOnly = !getData;
  const getter = getData ?? ((req: Request) => req.body);

  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(getter(req));
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          path:    issue.path,
          message: issue.message,
          code:    issue.code,
        })),
      });
      return;
    }
    if (isBodyOnly) req.body = result.data as typeof req.body;
    next();
  };
}
