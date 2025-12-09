import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';
import type { ServiceReservation } from '@/domain/models/service-reservation';

export type GetServiceClientDataUseCasePayload = {
  clientId: string;
};

export type GetServiceClientDataUseCaseSuccess = {
  client: {
    id: string;
    reservations: Array<{
      reservationId: string;
      confirmationId: string;
      serviceIds: string[];
      status: string;
      submittedAt: Date;
      clientAnswers: ServiceReservation['clientAnswers'];
    }>;
  };
};

export type GetServiceClientDataUseCaseFailure = {
  reason: 'ClientNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetServiceClientDataUseCase implements IUseCase<GetServiceClientDataUseCasePayload, GetServiceClientDataUseCaseSuccess, GetServiceClientDataUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
  ) {}

  async execute(payload: GetServiceClientDataUseCasePayload) {
    try {
      const reservations = await this.serviceReservationRepository.findByClientId(payload.clientId);

      if (reservations.length === 0) {
        return new Failure<GetServiceClientDataUseCaseFailure>({
          reason: 'ClientNotFound',
          error: new Error('No reservations found for this client'),
        });
      }

      const clientData = {
        id: payload.clientId,
        reservations: reservations.map(r => ({
          reservationId: r.id,
          confirmationId: r.confirmationId,
          serviceIds: r.serviceIds,
          status: r.status,
          submittedAt: r.submittedAt,
          clientAnswers: r.clientAnswers,
        })),
      };

      return new Success({ client: clientData });
    } catch (error) {
      return new Failure<GetServiceClientDataUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
