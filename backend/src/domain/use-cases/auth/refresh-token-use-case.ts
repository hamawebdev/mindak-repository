import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';

import { CORE_DI_TYPES } from '@/container/core/di-types';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { Failure, Success } from '@/core/result/result';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { IRefreshTokenRepository } from '@/domain/repositories/refresh-token-repository.interface';
import type { IUserRepository } from '@/domain/repositories/user-repository.interface';

export type RefreshTokenUseCasePayload = {
  refreshToken: string;
};

type RefreshTokenUseCaseFailureReason = 'InvalidToken' | 'TokenExpired' | 'TokenRevoked' | 'UserNotFound' | 'UnknownError';
export type RefreshTokenUseCaseFailure = {
  reason: RefreshTokenUseCaseFailureReason;
  error: Error;
};

export type RefreshTokenUseCaseSuccess = {
  accessToken: string;
  refreshToken: string;
};

@injectable()
export class RefreshTokenUseCase implements IUseCase<RefreshTokenUseCasePayload, RefreshTokenUseCaseSuccess, RefreshTokenUseCaseFailure> {
  constructor(
    private readonly config: {
      jwtSecret: string;
      jwtExpiresInSeconds: number;
      refreshTokenSecret: string;
      refreshTokenExpiresInDays: number;
    },
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
    @inject(REPOSITORIES_DI_TYPES.RefreshTokenRepository) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @inject(REPOSITORIES_DI_TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(payload: RefreshTokenUseCasePayload) {
    try {
      // Find the refresh token in database
      const storedToken = await this.refreshTokenRepository.findByToken(payload.refreshToken);

      if (!storedToken) {
        return new Failure<RefreshTokenUseCaseFailure>({
          reason: 'InvalidToken',
          error: new Error('Refresh token not found'),
        });
      }

      // Check if token is revoked
      if (storedToken.isRevoked) {
        return new Failure<RefreshTokenUseCaseFailure>({
          reason: 'TokenRevoked',
          error: new Error('Refresh token has been revoked'),
        });
      }

      // Check if token is expired
      if (storedToken.expiresAt < this.time.now()) {
        return new Failure<RefreshTokenUseCaseFailure>({
          reason: 'TokenExpired',
          error: new Error('Refresh token has expired'),
        });
      }

      // Verify JWT signature
      try {
        jwt.verify(payload.refreshToken, this.config.refreshTokenSecret);
      } catch {
        return new Failure<RefreshTokenUseCaseFailure>({
          reason: 'InvalidToken',
          error: new Error('Invalid refresh token signature'),
        });
      }

      // Get user
      const user = await this.userRepository.findOneById(storedToken.userId);
      if (!user) {
        return new Failure<RefreshTokenUseCaseFailure>({
          reason: 'UserNotFound',
          error: new Error('User not found'),
        });
      }

      // Generate new access token
      const accessToken = jwt.sign({ id: user.id }, this.config.jwtSecret, {
        expiresIn: this.config.jwtExpiresInSeconds,
      });

      // Generate new refresh token
      const newRefreshToken = jwt.sign({ id: user.id }, this.config.refreshTokenSecret, {
        expiresIn: `${this.config.refreshTokenExpiresInDays}d`,
      });

      // Revoke old refresh token
      await this.refreshTokenRepository.revokeToken(storedToken.id);

      // Store new refresh token
      const expiresAt = new Date(this.time.now());
      expiresAt.setDate(expiresAt.getDate() + this.config.refreshTokenExpiresInDays);

      await this.refreshTokenRepository.create({
        id: this.idGenerator.generate(),
        userId: user.id,
        token: newRefreshToken,
        expiresAt,
        isRevoked: false,
        createdAt: this.time.now(),
      });

      return new Success({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return new Failure<RefreshTokenUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

