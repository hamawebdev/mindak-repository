import { injectable } from 'inversify';
import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '@/app/http-error';

export interface IAdminMiddleware {
  handler(req: Request, res: Response, next: NextFunction): void;
}

@injectable()
export class AdminMiddleware implements IAdminMiddleware {
  handler(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      throw HttpError.forbidden('User must be authenticated');
    }

    if (req.user.role !== 'admin') {
      throw HttpError.forbidden('User must be an admin');
    }

    next();
  }
}

