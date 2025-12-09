import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { ChangePasswordUseCaseFailure, ChangePasswordUseCasePayload, ChangePasswordUseCaseSuccess } from '@/domain/use-cases/auth/change-password-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

const payloadSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

@injectable()
export class ChangePasswordRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.ChangePasswordUseCase) private readonly changePasswordUseCase: IUseCase<ChangePasswordUseCasePayload, ChangePasswordUseCaseSuccess, ChangePasswordUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    if (!req.user) {
      throw HttpError.unauthorized('User must be authenticated');
    }

    const { currentPassword, newPassword } = payloadSchema.parse(req.body);

    const result = await this.changePasswordUseCase.execute({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Password has been changed successfully',
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'UserNotFound':
          throw HttpError.notFound('User not found');
        case 'InvalidCurrentPassword':
          throw HttpError.badRequest('Current password is incorrect');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

