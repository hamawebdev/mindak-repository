/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, injectable } from 'inversify';
import { ZodError, type ZodIssue } from 'zod';
import type { NextFunction, Request, Response } from 'express';

import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { ILogger } from '@/core/logger/logger.interface';
import { HttpError } from '@/app/http-error';

type FormatedError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export interface IErrorMiddleware {
  handler: (err: any, req: Request, res: Response, next: NextFunction) => void;
}

@injectable()
export class ErrorMiddleware implements IErrorMiddleware {
  constructor(
    @inject(CORE_DI_TYPES.Logger) private readonly logger: ILogger,
  ) {}

  private logError(httpError: HttpError) {
    this.logger.error('Http error caught by error middleware:', {
      status: httpError.status,
      name: httpError.name,
      message: httpError.message,
      ...(httpError.error && {
        error: {
          name: httpError.error.name,
          message: httpError.error.message,
          stack: httpError.error.stack,
        }
      })
    });
  }

  handler(err: any, req: Request, res: Response<FormatedError>, next: NextFunction) {
    let error: HttpError;
    if (err instanceof HttpError) {
      error = err;
    } else if (err instanceof ZodError) {
      const zodDetails = err.issues.map((e: ZodIssue) => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));
      error = HttpError.badRequest('Validation error', {
        code: 'VALIDATION_ERROR',
        details: zodDetails,
      });
    } else {
      const message = err.message ?? 'Internal server error';
      error = HttpError.internalServerError(message, err, {
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    this.logError(error);

    const errorResponse: {
      code: string;
      message: string;
      details?: unknown;
    } = {
      code: error.code ?? error.name.toUpperCase().replace(/([A-Z])/g, '_$1').slice(1),
      message: error.message,
    };

    if (error.details) {
      errorResponse.details = error.details;
    }

    const formatedError: FormatedError = {
      success: false,
      error: errorResponse,
    };

    res.status(error.status).send(formatedError);
  }
}