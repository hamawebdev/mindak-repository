import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';

export type DeleteServiceReservationUseCasePayload = {
  id: string;
};

export type DeleteServiceReservationUseCaseSuccess = {
  success: true;
};

export type DeleteServiceReservationUseCaseFailure = {
  reason: 'ReservationNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeleteServiceReservationUseCase implements IUseCase<DeleteServiceReservationUseCasePayload, DeleteServiceReservationUseCaseSuccess, DeleteServiceReservationUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
  ) {}

  async execute(payload: DeleteServiceReservationUseCasePayload) {
    try {
      // Verify reservation exists
      const reservation = await this.serviceReservationRepository.findById(payload.id);
      if (!reservation) {
        return new Failure<DeleteServiceReservationUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      // Delete reservation
      await this.serviceReservationRepository.delete(payload.id);

      return new Success({ success: true as const });
    } catch (error) {
      return new Failure<DeleteServiceReservationUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

