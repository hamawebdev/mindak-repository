import { inject, injectable } from 'inversify';

import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { Failure, Success } from '@/core/result/result';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { IUserRepository } from '@/domain/repositories/user-repository.interface';
import type { IEncryptor } from '@/domain/services/security/encryptor.interface';

export type ChangePasswordUseCasePayload = {
  userId: string;
  currentPassword: string;
  newPassword: string;
};

type ChangePasswordUseCaseFailureReason = 'UserNotFound' | 'InvalidCurrentPassword' | 'UnknownError';
export type ChangePasswordUseCaseFailure = {
  reason: ChangePasswordUseCaseFailureReason;
  error: Error;
};

export type ChangePasswordUseCaseSuccess = {
  userId: string;
};

@injectable()
export class ChangePasswordUseCase implements IUseCase<ChangePasswordUseCasePayload, ChangePasswordUseCaseSuccess, ChangePasswordUseCaseFailure> {
  constructor(
    @inject(SERVICES_DI_TYPES.Encryptor) private readonly encryptor: IEncryptor,
    @inject(REPOSITORIES_DI_TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(payload: ChangePasswordUseCasePayload) {
    try {
      // Get user
      const user = await this.userRepository.findOneById(payload.userId);
      if (!user) {
        return new Failure<ChangePasswordUseCaseFailure>({
          reason: 'UserNotFound',
          error: new Error('User not found'),
        });
      }

      // Verify current password
      const isValidPassword = await this.encryptor.comparePassword(payload.currentPassword, user.hashPassword);
      if (!isValidPassword) {
        return new Failure<ChangePasswordUseCaseFailure>({
          reason: 'InvalidCurrentPassword',
          error: new Error('Current password is incorrect'),
        });
      }

      // Hash new password
      const hashedPassword = await this.encryptor.hashPassword(payload.newPassword);

      // Update user password
      await this.userRepository.updatePassword(user.id, hashedPassword);

      return new Success({
        userId: user.id,
      });
    } catch (error) {
      return new Failure<ChangePasswordUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

