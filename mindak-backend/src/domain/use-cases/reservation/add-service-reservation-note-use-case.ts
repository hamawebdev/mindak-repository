import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';
import type { IReservationNoteRepository } from '@/domain/repositories/reservation-note-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { ReservationNote } from '@/domain/models/reservation-note';

export type AddServiceReservationNoteUseCasePayload = {
  reservationId: string;
  noteText: string;
  createdBy: string;
};

export type AddServiceReservationNoteUseCaseSuccess = {
  note: ReservationNote;
};

export type AddServiceReservationNoteUseCaseFailure = {
  reason: 'ReservationNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class AddServiceReservationNoteUseCase implements IUseCase<AddServiceReservationNoteUseCasePayload, AddServiceReservationNoteUseCaseSuccess, AddServiceReservationNoteUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationNoteRepository) private readonly noteRepository: IReservationNoteRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: AddServiceReservationNoteUseCasePayload) {
    try {
      // Verify reservation exists
      const reservation = await this.serviceReservationRepository.findById(payload.reservationId);
      if (!reservation) {
        return new Failure<AddServiceReservationNoteUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      // Create note
      const note = new ReservationNote({
        id: this.idGenerator.generate(),
        reservationId: payload.reservationId,
        reservationType: 'service',
        noteText: payload.noteText,
        createdBy: payload.createdBy,
        createdAt: this.time.now(),
      });

      const createdNote = await this.noteRepository.create(note);

      return new Success({ note: createdNote });
    } catch (error) {
      return new Failure<AddServiceReservationNoteUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

