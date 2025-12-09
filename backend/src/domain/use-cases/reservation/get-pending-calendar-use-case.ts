import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { PodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import type { ITime } from '@/core/time/time.interface';
import type { PodcastReservationNew } from '@/domain/models/podcast-reservation-new';

export type GetPendingCalendarUseCasePayload = {
  date?: Date;
};

export type GetPendingCalendarUseCaseSuccess = {
  reservations: PodcastReservationNew[];
};

export type GetPendingCalendarUseCaseFailure = {
  reason: 'InvalidDate' | 'UnknownError';
  error: Error;
};

@injectable()
export class GetPendingCalendarUseCase implements IUseCase<
  GetPendingCalendarUseCasePayload,
  GetPendingCalendarUseCaseSuccess,
  GetPendingCalendarUseCaseFailure
> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationNewRepository)
    private readonly reservationRepository: PodcastReservationNewRepository,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) { }

  async execute(payload: GetPendingCalendarUseCasePayload) {
    try {
      let reservations: PodcastReservationNew[];

      if (payload.date) {
        // Validate date
        if (isNaN(payload.date.getTime())) {
          return new Failure<GetPendingCalendarUseCaseFailure>({
            reason: 'InvalidDate',
            error: new Error('Invalid date format. Use YYYY-MM-DD'),
          });
        }

        // Get pending reservations for specific date
        const startOfDay = new Date(payload.date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(payload.date);
        endOfDay.setHours(23, 59, 59, 999);

        reservations = await this.reservationRepository.findPendingByDateRange(startOfDay, endOfDay);
      } else {
        // Get next 30 days of pending reservations
        const startDate = this.time.now();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        reservations = await this.reservationRepository.findPendingByDateRange(startDate, endDate);
      }

      return new Success({ reservations });
    } catch (error) {
      return new Failure<GetPendingCalendarUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
