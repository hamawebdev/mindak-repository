import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';

export type BulkUpdateServiceStatusUseCasePayload = {
  ids: string[];
  isActive: boolean;
};

export type BulkUpdateServiceStatusUseCaseSuccess = Record<string, never>;

export type BulkUpdateServiceStatusUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class BulkUpdateServiceStatusUseCase implements IUseCase<BulkUpdateServiceStatusUseCasePayload, BulkUpdateServiceStatusUseCaseSuccess, BulkUpdateServiceStatusUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(payload: BulkUpdateServiceStatusUseCasePayload) {
    try {
      await this.serviceRepository.bulkUpdateStatus(payload.ids, payload.isActive);
      return new Success({});
    } catch (error) {
      return new Failure<BulkUpdateServiceStatusUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

