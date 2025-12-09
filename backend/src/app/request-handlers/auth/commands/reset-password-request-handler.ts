import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { ResetPasswordUseCaseFailure, ResetPasswordUseCasePayload, ResetPasswordUseCaseSuccess } from '@/domain/use-cases/auth/reset-password-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

const payloadSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

@injectable()
export class ResetPasswordRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.ResetPasswordUseCase) private readonly resetPasswordUseCase: IUseCase<ResetPasswordUseCasePayload, ResetPasswordUseCaseSuccess, ResetPasswordUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { token, newPassword } = payloadSchema.parse(req.body);

    const result = await this.resetPasswordUseCase.execute({ token, newPassword });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Password has been reset successfully',
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'InvalidToken':
          throw HttpError.badRequest('Invalid or expired reset token');
        case 'TokenExpired':
          throw HttpError.badRequest('Reset token has expired');
        case 'TokenAlreadyUsed':
          throw HttpError.badRequest('Reset token has already been used');
        case 'UserNotFound':
          throw HttpError.notFound('User not found');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

