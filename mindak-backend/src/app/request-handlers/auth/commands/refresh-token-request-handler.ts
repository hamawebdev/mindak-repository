import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { RefreshTokenUseCaseFailure, RefreshTokenUseCasePayload, RefreshTokenUseCaseSuccess } from '@/domain/use-cases/auth/refresh-token-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

const payloadSchema = z.object({
  refreshToken: z.string(),
});

@injectable()
export class RefreshTokenRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.RefreshTokenUseCase) private readonly refreshTokenUseCase: IUseCase<RefreshTokenUseCasePayload, RefreshTokenUseCaseSuccess, RefreshTokenUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { refreshToken } = payloadSchema.parse(req.body);

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    if (result.isSuccess()) {
      const { accessToken, refreshToken: newRefreshToken } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'InvalidToken':
          throw HttpError.unauthorized('Invalid refresh token');
        case 'TokenExpired':
          throw HttpError.unauthorized('Refresh token has expired');
        case 'TokenRevoked':
          throw HttpError.unauthorized('Refresh token has been revoked');
        case 'UserNotFound':
          throw HttpError.notFound('User not found');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

