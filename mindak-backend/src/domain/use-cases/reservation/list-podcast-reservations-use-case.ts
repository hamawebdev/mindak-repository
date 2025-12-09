import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastReservationRepository, PodcastReservationFilters, PaginationParams, PaginatedResult } from '@/domain/repositories/podcast-reservation-repository.interface';
import type { PodcastReservation } from '@/domain/models/podcast-reservation';

export type ListPodcastReservationsUseCasePayload = {
  filters: PodcastReservationFilters;
  pagination: PaginationParams;
};

export type ListPodcastReservationsUseCaseSuccess = {
  result: PaginatedResult<PodcastReservation>;
};

export type ListPodcastReservationsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class ListPodcastReservationsUseCase implements IUseCase<ListPodcastReservationsUseCasePayload, ListPodcastReservationsUseCaseSuccess, ListPodcastReservationsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationRepository) private readonly podcastReservationRepository: IPodcastReservationRepository,
  ) {}

  async execute(payload: ListPodcastReservationsUseCasePayload) {
    try {
      const result = await this.podcastReservationRepository.findAll(
        payload.filters,
        payload.pagination
      );

      return new Success({ result });
    } catch (error) {
      return new Failure<ListPodcastReservationsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

