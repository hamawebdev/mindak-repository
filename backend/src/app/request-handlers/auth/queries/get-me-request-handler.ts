import { injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
};

@injectable()
export class GetMeRequestHandler implements IRequestHandler<ResponseBody> {
  handler(req: Request, res: Response<ResponseBody>) {
    if (!req.user) {
      throw HttpError.unauthorized('User must be authenticated');
    }

    const response: ResponseBody = {
      success: true,
      data: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt.toISOString(),
        updatedAt: req.user.updatedAt.toISOString(),
      },
    };

    res.status(200).send(response);
  }
}

