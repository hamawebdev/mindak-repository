import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';
import type { IReservationStatusHistoryRepository } from '@/domain/repositories/reservation-status-history-repository.interface';
import type { IReservationNoteRepository } from '@/domain/repositories/reservation-note-repository.interface';
import type { ServiceReservation } from '@/domain/models/service-reservation';
import type { ReservationStatusHistory } from '@/domain/models/reservation-status-history';
import type { ReservationNote } from '@/domain/models/reservation-note';

export type GetServiceReservationDetailsUseCasePayload = {
  id: string;
};

export type GetServiceReservationDetailsUseCaseSuccess = {
  reservation: ServiceReservation;
  statusHistory: ReservationStatusHistory[];
  notes: ReservationNote[];
};

export type GetServiceReservationDetailsUseCaseFailure = {
  reason: 'ReservationNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetServiceReservationDetailsUseCase implements IUseCase<GetServiceReservationDetailsUseCasePayload, GetServiceReservationDetailsUseCaseSuccess, GetServiceReservationDetailsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationStatusHistoryRepository) private readonly statusHistoryRepository: IReservationStatusHistoryRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationNoteRepository) private readonly noteRepository: IReservationNoteRepository,
  ) {}

  async execute(payload: GetServiceReservationDetailsUseCasePayload) {
    try {
      const reservation = await this.serviceReservationRepository.findById(payload.id);

      if (!reservation) {
        return new Failure<GetServiceReservationDetailsUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      const [statusHistory, notes] = await Promise.all([
        this.statusHistoryRepository.findByReservationId(payload.id, 'service'),
        this.noteRepository.findByReservationId(payload.id, 'service'),
      ]);

      return new Success({ reservation, statusHistory, notes });
    } catch (error) {
      return new Failure<GetServiceReservationDetailsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

