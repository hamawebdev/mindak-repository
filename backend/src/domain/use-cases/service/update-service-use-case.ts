import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { Service } from '@/domain/models/service';

export type UpdateServiceUseCasePayload = {
  id: string;
  name?: string;
  description?: string | null;
  price?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdateServiceUseCaseSuccess = {
  service: Service;
};

export type UpdateServiceUseCaseFailure = {
  reason: 'ServiceNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdateServiceUseCase implements IUseCase<UpdateServiceUseCasePayload, UpdateServiceUseCaseSuccess, UpdateServiceUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(payload: UpdateServiceUseCasePayload) {
    try {
      // Check if service exists
      const existingService = await this.serviceRepository.findById(payload.id);
      if (!existingService) {
        return new Failure<UpdateServiceUseCaseFailure>({
          reason: 'ServiceNotFound',
          error: new Error('Service not found'),
        });
      }

      const updatedService = await this.serviceRepository.update(payload.id, {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        categoryId: payload.categoryId as any,
        isActive: payload.isActive,
        displayOrder: payload.displayOrder,
      });

      return new Success({ service: updatedService });
    } catch (error) {
      return new Failure<UpdateServiceUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

