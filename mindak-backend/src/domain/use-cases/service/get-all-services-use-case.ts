import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { Service } from '@/domain/models/service';

export type GetAllServicesUseCasePayload = {
  includeInactive?: boolean;
};

export type GetAllServicesUseCaseSuccess = {
  services: Service[];
};

export type GetAllServicesUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetAllServicesUseCase implements IUseCase<GetAllServicesUseCasePayload, GetAllServicesUseCaseSuccess, GetAllServicesUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(payload: GetAllServicesUseCasePayload) {
    try {
      const services = payload.includeInactive
        ? await this.serviceRepository.findAll()
        : await this.serviceRepository.findAllActive();

      return new Success({ services });
    } catch (error) {
      return new Failure<GetAllServicesUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

