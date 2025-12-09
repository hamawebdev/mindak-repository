import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastReservationRepository } from '@/domain/repositories/podcast-reservation-repository.interface';
import type { IReservationStatusHistoryRepository } from '@/domain/repositories/reservation-status-history-repository.interface';
import type { IReservationNoteRepository } from '@/domain/repositories/reservation-note-repository.interface';
import type { PodcastReservation } from '@/domain/models/podcast-reservation';
import type { ReservationStatusHistory } from '@/domain/models/reservation-status-history';
import type { ReservationNote } from '@/domain/models/reservation-note';

export type GetPodcastReservationDetailsUseCasePayload = {
  id: string;
};

export type GetPodcastReservationDetailsUseCaseSuccess = {
  reservation: PodcastReservation;
  statusHistory: ReservationStatusHistory[];
  notes: ReservationNote[];
};

export type GetPodcastReservationDetailsUseCaseFailure = {
  reason: 'ReservationNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetPodcastReservationDetailsUseCase implements IUseCase<GetPodcastReservationDetailsUseCasePayload, GetPodcastReservationDetailsUseCaseSuccess, GetPodcastReservationDetailsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationRepository) private readonly podcastReservationRepository: IPodcastReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationStatusHistoryRepository) private readonly statusHistoryRepository: IReservationStatusHistoryRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationNoteRepository) private readonly noteRepository: IReservationNoteRepository,
  ) {}

  async execute(payload: GetPodcastReservationDetailsUseCasePayload) {
    try {
      const reservation = await this.podcastReservationRepository.findById(payload.id);

      if (!reservation) {
        return new Failure<GetPodcastReservationDetailsUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      const [statusHistory, notes] = await Promise.all([
        this.statusHistoryRepository.findByReservationId(payload.id, 'podcast'),
        this.noteRepository.findByReservationId(payload.id, 'podcast'),
      ]);

      return new Success({ reservation, statusHistory, notes });
    } catch (error) {
      return new Failure<GetPodcastReservationDetailsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

