import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';

export type DeleteServiceUseCasePayload = {
  id: string;
};

export type DeleteServiceUseCaseSuccess = Record<string, never>;

export type DeleteServiceUseCaseFailure = {
  reason: 'ServiceNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeleteServiceUseCase implements IUseCase<DeleteServiceUseCasePayload, DeleteServiceUseCaseSuccess, DeleteServiceUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(payload: DeleteServiceUseCasePayload) {
    try {
      // Check if service exists
      const existingService = await this.serviceRepository.findById(payload.id);
      if (!existingService) {
        return new Failure<DeleteServiceUseCaseFailure>({
          reason: 'ServiceNotFound',
          error: new Error('Service not found'),
        });
      }

      await this.serviceRepository.delete(payload.id);

      return new Success({});
    } catch (error) {
      return new Failure<DeleteServiceUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

