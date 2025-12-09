import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { Service } from '@/domain/models/service';

export type GetServiceByIdUseCasePayload = {
  id: string;
};

export type GetServiceByIdUseCaseSuccess = {
  service: Service;
};

export type GetServiceByIdUseCaseFailure = {
  reason: 'ServiceNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetServiceByIdUseCase implements IUseCase<GetServiceByIdUseCasePayload, GetServiceByIdUseCaseSuccess, GetServiceByIdUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(payload: GetServiceByIdUseCasePayload) {
    try {
      const service = await this.serviceRepository.findById(payload.id);

      if (!service) {
        return new Failure<GetServiceByIdUseCaseFailure>({
          reason: 'ServiceNotFound',
          error: new Error('Service not found'),
        });
      }

      return new Success({ service });
    } catch (error) {
      return new Failure<GetServiceByIdUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

