import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import AppError from '../utils/AppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      message = `Duplicate value for ${target}. Email already exists.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Invalid reference. Related record does not exist.';
    } else if (err.code === 'P2014') {
      statusCode = 400;
      message = 'Cannot delete. Related records exist.';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  } else if (err instanceof Error) {
    message = err.message || message;
    const maybeStatus = (err as Error & { statusCode?: number }).statusCode;
    if (typeof maybeStatus === 'number') statusCode = maybeStatus;
  }

  const response: Record<string, unknown> = {
    success: false,
    status: statusCode,
    message,
  };

  if (process.env.NODE_ENV === 'development' && err instanceof Error) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
