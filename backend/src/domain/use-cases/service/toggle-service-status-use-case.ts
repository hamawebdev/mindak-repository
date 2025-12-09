import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { Service } from '@/domain/models/service';

export type ToggleServiceStatusUseCasePayload = {
  id: string;
};

export type ToggleServiceStatusUseCaseSuccess = {
  service: Service;
};

export type ToggleServiceStatusUseCaseFailure = {
  reason: 'ServiceNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class ToggleServiceStatusUseCase implements IUseCase<ToggleServiceStatusUseCasePayload, ToggleServiceStatusUseCaseSuccess, ToggleServiceStatusUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(payload: ToggleServiceStatusUseCasePayload) {
    try {
      const service = await this.serviceRepository.toggleStatus(payload.id);
      return new Success({ service });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'Service not found') {
        return new Failure<ToggleServiceStatusUseCaseFailure>({
          reason: 'ServiceNotFound',
          error: err,
        });
      }

      return new Failure<ToggleServiceStatusUseCaseFailure>({
        reason: 'UnknownError',
        error: err,
      });
    }
  }
}

