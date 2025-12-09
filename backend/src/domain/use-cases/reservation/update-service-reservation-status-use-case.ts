import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';
import type { IReservationStatusHistoryRepository } from '@/domain/repositories/reservation-status-history-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import type { ServiceReservation } from '@/domain/models/service-reservation';
import { ReservationStatusHistory } from '@/domain/models/reservation-status-history';

export type UpdateServiceReservationStatusUseCasePayload = {
  id: string;
  status: string;
  notes?: string;
  changedBy: string;
};

export type UpdateServiceReservationStatusUseCaseSuccess = {
  reservation: ServiceReservation;
};

export type UpdateServiceReservationStatusUseCaseFailure = {
  reason: 'ReservationNotFound' | 'InvalidStatus' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdateServiceReservationStatusUseCase implements IUseCase<UpdateServiceReservationStatusUseCasePayload, UpdateServiceReservationStatusUseCaseSuccess, UpdateServiceReservationStatusUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationStatusHistoryRepository) private readonly statusHistoryRepository: IReservationStatusHistoryRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: UpdateServiceReservationStatusUseCasePayload) {
    try {
      // Validate status
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(payload.status)) {
        return new Failure<UpdateServiceReservationStatusUseCaseFailure>({
          reason: 'InvalidStatus',
          error: new Error('Invalid status value'),
        });
      }

      // Get current reservation
      const currentReservation = await this.serviceReservationRepository.findById(payload.id);
      if (!currentReservation) {
        return new Failure<UpdateServiceReservationStatusUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      // Update status
      const updatedReservation = await this.serviceReservationRepository.updateStatus(
        payload.id,
        payload.status
      );

      // Create status history entry
      const statusHistory = new ReservationStatusHistory({
        id: this.idGenerator.generate(),
        reservationId: payload.id,
        reservationType: 'service',
        oldStatus: currentReservation.status,
        newStatus: payload.status,
        notes: payload.notes || null,
        changedBy: payload.changedBy,
        changedAt: this.time.now(),
      });
      await this.statusHistoryRepository.create(statusHistory);

      return new Success({ reservation: updatedReservation });
    } catch (error) {
      return new Failure<UpdateServiceReservationStatusUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

