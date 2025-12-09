import { inject, injectable } from 'inversify';

import { CORE_DI_TYPES } from '@/container/core/di-types';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { ITime } from '@/core/time/time.interface';
import { Failure, Success } from '@/core/result/result';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { IPasswordResetTokenRepository } from '@/domain/repositories/password-reset-token-repository.interface';
import type { IUserRepository } from '@/domain/repositories/user-repository.interface';
import type { IEncryptor } from '@/domain/services/security/encryptor.interface';

export type ResetPasswordUseCasePayload = {
  token: string;
  newPassword: string;
};

type ResetPasswordUseCaseFailureReason = 'InvalidToken' | 'TokenExpired' | 'TokenAlreadyUsed' | 'UserNotFound' | 'UnknownError';
export type ResetPasswordUseCaseFailure = {
  reason: ResetPasswordUseCaseFailureReason;
  error: Error;
};

export type ResetPasswordUseCaseSuccess = {
  userId: string;
};

@injectable()
export class ResetPasswordUseCase implements IUseCase<ResetPasswordUseCasePayload, ResetPasswordUseCaseSuccess, ResetPasswordUseCaseFailure> {
  constructor(
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
    @inject(SERVICES_DI_TYPES.Encryptor) private readonly encryptor: IEncryptor,
    @inject(REPOSITORIES_DI_TYPES.PasswordResetTokenRepository) private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @inject(REPOSITORIES_DI_TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(payload: ResetPasswordUseCasePayload) {
    try {
      // Find the reset token
      const resetToken = await this.passwordResetTokenRepository.findByToken(payload.token);

      if (!resetToken) {
        return new Failure<ResetPasswordUseCaseFailure>({
          reason: 'InvalidToken',
          error: new Error('Reset token not found'),
        });
      }

      // Check if token is already used
      if (resetToken.isUsed) {
        return new Failure<ResetPasswordUseCaseFailure>({
          reason: 'TokenAlreadyUsed',
          error: new Error('Reset token has already been used'),
        });
      }

      // Check if token is expired
      if (resetToken.expiresAt < this.time.now()) {
        return new Failure<ResetPasswordUseCaseFailure>({
          reason: 'TokenExpired',
          error: new Error('Reset token has expired'),
        });
      }

      // Get user
      const user = await this.userRepository.findOneById(resetToken.userId);
      if (!user) {
        return new Failure<ResetPasswordUseCaseFailure>({
          reason: 'UserNotFound',
          error: new Error('User not found'),
        });
      }

      // Hash new password
      const hashedPassword = await this.encryptor.hashPassword(payload.newPassword);

      // Update user password
      await this.userRepository.updatePassword(user.id, hashedPassword);

      // Mark token as used
      await this.passwordResetTokenRepository.markAsUsed(resetToken.id);

      return new Success({
        userId: user.id,
      });
    } catch (error) {
      return new Failure<ResetPasswordUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

