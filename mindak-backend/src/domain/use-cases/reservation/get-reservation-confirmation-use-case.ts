import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastReservationRepository } from '@/domain/repositories/podcast-reservation-repository.interface';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';
import type { PodcastReservation } from '@/domain/models/podcast-reservation';
import type { ServiceReservation } from '@/domain/models/service-reservation';

export type GetReservationConfirmationUseCasePayload = {
  confirmationId: string;
};

export type GetReservationConfirmationUseCaseSuccess = {
  reservation: PodcastReservation | ServiceReservation;
  type: 'podcast' | 'service';
};

export type GetReservationConfirmationUseCaseFailure = {
  reason: 'ReservationNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetReservationConfirmationUseCase implements IUseCase<GetReservationConfirmationUseCasePayload, GetReservationConfirmationUseCaseSuccess, GetReservationConfirmationUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationRepository) private readonly podcastReservationRepository: IPodcastReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
  ) {}

  async execute(payload: GetReservationConfirmationUseCasePayload) {
    try {
      const { confirmationId } = payload;

      // Determine type from confirmation ID prefix
      if (confirmationId.startsWith('POD-')) {
        const reservation = await this.podcastReservationRepository.findByConfirmationId(confirmationId);
        if (!reservation) {
          return new Failure<GetReservationConfirmationUseCaseFailure>({
            reason: 'ReservationNotFound',
            error: new Error('Reservation not found'),
          });
        }
        return new Success({ reservation, type: 'podcast' as const });
      } else if (confirmationId.startsWith('SRV-')) {
        const reservation = await this.serviceReservationRepository.findByConfirmationId(confirmationId);
        if (!reservation) {
          return new Failure<GetReservationConfirmationUseCaseFailure>({
            reason: 'ReservationNotFound',
            error: new Error('Reservation not found'),
          });
        }
        return new Success({ reservation, type: 'service' as const });
      } else {
        return new Failure<GetReservationConfirmationUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Invalid confirmation ID format'),
        });
      }
    } catch (error) {
      return new Failure<GetReservationConfirmationUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

