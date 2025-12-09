import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceReservationRepository, ServiceReservationFilters, PaginationParams, PaginatedResult } from '@/domain/repositories/service-reservation-repository.interface';
import type { ServiceReservation } from '@/domain/models/service-reservation';

export type ListServiceReservationsUseCasePayload = {
  filters: ServiceReservationFilters;
  pagination: PaginationParams;
};

export type ListServiceReservationsUseCaseSuccess = {
  result: PaginatedResult<ServiceReservation>;
};

export type ListServiceReservationsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class ListServiceReservationsUseCase implements IUseCase<ListServiceReservationsUseCasePayload, ListServiceReservationsUseCaseSuccess, ListServiceReservationsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
  ) {}

  async execute(payload: ListServiceReservationsUseCasePayload) {
    try {
      const result = await this.serviceReservationRepository.findAll(
        payload.filters,
        payload.pagination
      );

      return new Success({ result });
    } catch (error) {
      return new Failure<ListServiceReservationsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

