import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IPodcastReservationRepository } from '@/domain/repositories/podcast-reservation-repository.interface';
import type { IReservationNoteRepository } from '@/domain/repositories/reservation-note-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { ReservationNote } from '@/domain/models/reservation-note';

export type AddPodcastReservationNoteUseCasePayload = {
  reservationId: string;
  noteText: string;
  createdBy: string;
};

export type AddPodcastReservationNoteUseCaseSuccess = {
  note: ReservationNote;
};

export type AddPodcastReservationNoteUseCaseFailure = {
  reason: 'ReservationNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class AddPodcastReservationNoteUseCase implements IUseCase<AddPodcastReservationNoteUseCasePayload, AddPodcastReservationNoteUseCaseSuccess, AddPodcastReservationNoteUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationRepository) private readonly podcastReservationRepository: IPodcastReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationNoteRepository) private readonly noteRepository: IReservationNoteRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: AddPodcastReservationNoteUseCasePayload) {
    try {
      // Verify reservation exists
      const reservation = await this.podcastReservationRepository.findById(payload.reservationId);
      if (!reservation) {
        return new Failure<AddPodcastReservationNoteUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      // Create note
      const note = new ReservationNote({
        id: this.idGenerator.generate(),
        reservationId: payload.reservationId,
        reservationType: 'podcast',
        noteText: payload.noteText,
        createdBy: payload.createdBy,
        createdAt: this.time.now(),
      });

      const createdNote = await this.noteRepository.create(note);

      return new Success({ note: createdNote });
    } catch (error) {
      return new Failure<AddPodcastReservationNoteUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

