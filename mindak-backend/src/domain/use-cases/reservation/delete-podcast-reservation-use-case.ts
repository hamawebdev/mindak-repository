import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastReservationRepository } from '@/domain/repositories/podcast-reservation-repository.interface';

export type DeletePodcastReservationUseCasePayload = {
  id: string;
};

export type DeletePodcastReservationUseCaseSuccess = {
  success: true;
};

export type DeletePodcastReservationUseCaseFailure = {
  reason: 'ReservationNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastReservationUseCase implements IUseCase<DeletePodcastReservationUseCasePayload, DeletePodcastReservationUseCaseSuccess, DeletePodcastReservationUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationRepository) private readonly podcastReservationRepository: IPodcastReservationRepository,
  ) {}

  async execute(payload: DeletePodcastReservationUseCasePayload) {
    try {
      // Verify reservation exists
      const reservation = await this.podcastReservationRepository.findById(payload.id);
      if (!reservation) {
        return new Failure<DeletePodcastReservationUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      // Delete reservation
      await this.podcastReservationRepository.delete(payload.id);

      return new Success({ success: true as const });
    } catch (error) {
      return new Failure<DeletePodcastReservationUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

