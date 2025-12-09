import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import { Service } from '@/domain/models/service';

export type CreateServiceUseCasePayload = {
  name: string;
  description?: string | null;
  price?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
  displayOrder?: number;
};

export type CreateServiceUseCaseSuccess = {
  service: Service;
};

export type CreateServiceUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreateServiceUseCase implements IUseCase<CreateServiceUseCasePayload, CreateServiceUseCaseSuccess, CreateServiceUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
  ) {}

  async execute(payload: CreateServiceUseCasePayload) {
    try {
      const service = new Service({
        id: this.idGenerator.generate(),
        name: payload.name,
        description: payload.description ?? null,
        price: payload.price ?? null,
        categoryId: payload.categoryId ?? null,
        isActive: payload.isActive ?? true,
        displayOrder: payload.displayOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdService = await this.serviceRepository.create(service);

      return new Success({ service: createdService });
    } catch (error) {
      return new Failure<CreateServiceUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

