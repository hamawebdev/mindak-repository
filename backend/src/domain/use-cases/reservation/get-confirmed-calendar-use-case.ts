import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { PodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import type { ITime } from '@/core/time/time.interface';
import type { PodcastReservationNew } from '@/domain/models/podcast-reservation-new';

export type GetConfirmedCalendarUseCasePayload = {
  date?: Date;
};

export type GetConfirmedCalendarUseCaseSuccess = {
  reservations: PodcastReservationNew[];
};

export type GetConfirmedCalendarUseCaseFailure = {
  reason: 'InvalidDate' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetConfirmedCalendarUseCase implements IUseCase<
  GetConfirmedCalendarUseCasePayload,
  GetConfirmedCalendarUseCaseSuccess,
  GetConfirmedCalendarUseCaseFailure
> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationNewRepository)
    private readonly reservationRepository: PodcastReservationNewRepository,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) { }

  async execute(payload: GetConfirmedCalendarUseCasePayload) {
    try {
      let reservations: PodcastReservationNew[];

      if (payload.date) {
        // Validate date
        if (isNaN(payload.date.getTime())) {
          return new Failure<GetConfirmedCalendarUseCaseFailure>({
            reason: 'InvalidDate',
            error: new Error('Invalid date format. Use YYYY-MM-DD'),
          });
        }

        // Get reservations for specific date
        const dateString = payload.date.toISOString().split('T')[0]; // YYYY-MM-DD
        reservations = await this.reservationRepository.findConfirmedByDate(dateString);
      } else {
        // Get next 30 days of confirmed reservations
        const startDate = this.time.now();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        reservations = await this.reservationRepository.findConfirmedByDateRange(startDate, endDate);
      }

      return new Success({ reservations });
    } catch (error) {
      return new Failure<GetConfirmedCalendarUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
