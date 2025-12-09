import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { IAuthenticator } from '@/domain/services/auth/authenticator.interface';
import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { User } from '@/domain/models/user';
import { Failure, Success } from '@/core/result/result';
import type { IRefreshTokenRepository } from '@/domain/repositories/refresh-token-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';

export type LoginUseCasePayload = {
  email: string;
  password: string;
};

type LoginUseCaseFailureReason = 'InvalidCredentials' | 'UnknownError';
export type LoginUseCaseFailure = {
  reason: LoginUseCaseFailureReason;
  error: Error;
};

export type LoginUseCaseSuccess = {
  user: User;
  token: string;
  refreshToken: string;
};

@injectable()
export class LoginUseCase implements IUseCase<LoginUseCasePayload, LoginUseCaseSuccess, LoginUseCaseFailure> {
  constructor(
    private readonly config: {
      refreshTokenSecret: string;
      refreshTokenExpiresInDays: number;
    },
    @inject(SERVICES_DI_TYPES.Authenticator) private readonly authenticator: IAuthenticator,
    @inject(REPOSITORIES_DI_TYPES.RefreshTokenRepository) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: LoginUseCasePayload) {
    try {
      const result = await this.authenticator.authenticate(payload.email, payload.password);
      if (!result.success) {
        return new Failure<LoginUseCaseFailure>({
          reason: 'InvalidCredentials',
          error: new Error('Invalid credentials'),
        });
      }

      const { user, token } = result;

      // Generate refresh token
      const refreshToken = jwt.sign({ id: user.id }, this.config.refreshTokenSecret, {
        expiresIn: `${this.config.refreshTokenExpiresInDays}d`,
      });

      // Store refresh token in database
      const expiresAt = new Date(this.time.now());
      expiresAt.setDate(expiresAt.getDate() + this.config.refreshTokenExpiresInDays);

      await this.refreshTokenRepository.create({
        id: this.idGenerator.generate(),
        userId: user.id,
        token: refreshToken,
        expiresAt,
        isRevoked: false,
        createdAt: this.time.now(),
      });

      return new Success({ user, token, refreshToken });
    } catch (error) {
      return new Failure<LoginUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}