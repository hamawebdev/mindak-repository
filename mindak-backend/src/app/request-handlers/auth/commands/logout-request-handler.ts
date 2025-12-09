import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IRefreshTokenRepository } from '@/domain/repositories/refresh-token-repository.interface';

type ResponseBody = {
  success: boolean;
  message: string;
};

/**
 * Logout request handler
 * Revokes all refresh tokens for the authenticated user.
 *
 * Note: Access tokens are stateless JWTs and cannot be invalidated.
 * For production, consider implementing a token blacklist using Redis.
 */
@injectable()
export class LogoutRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.RefreshTokenRepository) private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    // Revoke all refresh tokens for the user
    if (req.user) {
      await this.refreshTokenRepository.revokeAllUserTokens(req.user.id);
    }

    const response: ResponseBody = {
      success: true,
      message: 'Logged out successfully',
    };

    res.status(200).send(response);
  }
}

