import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastReservationRepository } from '@/domain/repositories/podcast-reservation-repository.interface';
import type { PodcastReservation } from '@/domain/models/podcast-reservation';

export type GetPodcastClientDataUseCasePayload = {
  clientId: string;
};

export type GetPodcastClientDataUseCaseSuccess = {
  client: {
    id: string;
    reservations: Array<{
      reservationId: string;
      confirmationId: string;
      status: string;
      submittedAt: Date;
      clientAnswers: PodcastReservation['clientAnswers'];
    }>;
  };
};

export type GetPodcastClientDataUseCaseFailure = {
  reason: 'ClientNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetPodcastClientDataUseCase implements IUseCase<GetPodcastClientDataUseCasePayload, GetPodcastClientDataUseCaseSuccess, GetPodcastClientDataUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationRepository) private readonly podcastReservationRepository: IPodcastReservationRepository,
  ) {}

  async execute(payload: GetPodcastClientDataUseCasePayload) {
    try {
      const reservations = await this.podcastReservationRepository.findByClientId(payload.clientId);

      if (reservations.length === 0) {
        return new Failure<GetPodcastClientDataUseCaseFailure>({
          reason: 'ClientNotFound',
          error: new Error('No reservations found for this client'),
        });
      }

      const clientData = {
        id: payload.clientId,
        reservations: reservations.map(r => ({
          reservationId: r.id,
          confirmationId: r.confirmationId,
          status: r.status,
          submittedAt: r.submittedAt,
          clientAnswers: r.clientAnswers,
        })),
      };

      return new Success({ client: clientData });
    } catch (error) {
      return new Failure<GetPodcastClientDataUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
