import { inject, injectable } from 'inversify';
import crypto from 'crypto';

import { CORE_DI_TYPES } from '@/container/core/di-types';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { Failure, Success } from '@/core/result/result';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { IPasswordResetTokenRepository } from '@/domain/repositories/password-reset-token-repository.interface';
import type { IUserRepository } from '@/domain/repositories/user-repository.interface';

export type ForgotPasswordUseCasePayload = {
  email: string;
};

type ForgotPasswordUseCaseFailureReason = 'UserNotFound' | 'UnknownError';
export type ForgotPasswordUseCaseFailure = {
  reason: ForgotPasswordUseCaseFailureReason;
  error: Error;
};

export type ForgotPasswordUseCaseSuccess = {
  resetToken: string;
  userId: string;
  email: string;
};

@injectable()
export class ForgotPasswordUseCase implements IUseCase<ForgotPasswordUseCasePayload, ForgotPasswordUseCaseSuccess, ForgotPasswordUseCaseFailure> {
  constructor(
    private readonly config: {
      resetTokenExpiresInHours: number;
    },
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
    @inject(REPOSITORIES_DI_TYPES.PasswordResetTokenRepository) private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @inject(REPOSITORIES_DI_TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(payload: ForgotPasswordUseCasePayload) {
    try {
      // Find user by email
      const user = await this.userRepository.findOneByEmail(payload.email);

      if (!user) {
        return new Failure<ForgotPasswordUseCaseFailure>({
          reason: 'UserNotFound',
          error: new Error('User not found'),
        });
      }

      // Delete any existing reset tokens for this user
      await this.passwordResetTokenRepository.deleteUserTokens(user.id);

      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Calculate expiration time
      const expiresAt = new Date(this.time.now());
      expiresAt.setHours(expiresAt.getHours() + this.config.resetTokenExpiresInHours);

      // Store reset token
      await this.passwordResetTokenRepository.create({
        id: this.idGenerator.generate(),
        userId: user.id,
        token: resetToken,
        expiresAt,
        isUsed: false,
        createdAt: this.time.now(),
      });

      return new Success({
        resetToken,
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      return new Failure<ForgotPasswordUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

