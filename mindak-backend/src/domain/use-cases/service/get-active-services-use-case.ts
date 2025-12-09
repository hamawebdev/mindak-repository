import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { Service } from '@/domain/models/service';

export type GetActiveServicesUseCasePayload = Record<string, never>;

export type GetActiveServicesUseCaseSuccess = {
  services: Service[];
};

export type GetActiveServicesUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetActiveServicesUseCase implements IUseCase<GetActiveServicesUseCasePayload, GetActiveServicesUseCaseSuccess, GetActiveServicesUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(_payload: GetActiveServicesUseCasePayload) {
    try {
      const services = await this.serviceRepository.findAllActive();
      return new Success({ services });
    } catch (error) {
      return new Failure<GetActiveServicesUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

