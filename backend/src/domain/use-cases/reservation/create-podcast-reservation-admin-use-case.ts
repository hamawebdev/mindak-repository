import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { PodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import type { PodcastReservationNew, AdminCreateReservationInput } from '@/domain/models/podcast-reservation-new';

export type CreatePodcastReservationAdminUseCasePayload = AdminCreateReservationInput & {
  createdBy: string;
};

export type CreatePodcastReservationAdminUseCaseSuccess = {
  reservation: PodcastReservationNew;
};

export type CreatePodcastReservationAdminUseCaseFailure = {
  reason: 'InvalidDuration' | 'InvalidTimeSlot' | 'SlotAlreadyBooked' | 'ValidationError' | 'UnknownError';
  error: Error;
  errors?: any[];
};

@injectable()
export class CreatePodcastReservationAdminUseCase implements IUseCase<
  CreatePodcastReservationAdminUseCasePayload,
  CreatePodcastReservationAdminUseCaseSuccess,
  CreatePodcastReservationAdminUseCaseFailure
> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationNewRepository)
    private readonly reservationRepository: PodcastReservationNewRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) { }

  async execute(payload: CreatePodcastReservationAdminUseCasePayload) {
    try {
      // Parse dates
      const startAt = new Date(payload.startAt);
      const endAt = new Date(payload.endAt);
      const timezone = payload.timezone || 'Europe/Paris';

      // Validation: Check if dates are valid
      if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
        return new Failure<CreatePodcastReservationAdminUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Invalid date format'),
          errors: [{ field: 'startAt/endAt', message: 'Invalid ISO 8601 date format' }],
        });
      }

      // Validation: Start must be before end
      if (startAt >= endAt) {
        return new Failure<CreatePodcastReservationAdminUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Start time must be before end time'),
          errors: [{ field: 'startAt', message: 'Start time must be before end time' }],
        });
      }

      // Validation: Times must be on the hour (minutes = 0)
      if (startAt.getMinutes() !== 0 || endAt.getMinutes() !== 0) {
        return new Failure<CreatePodcastReservationAdminUseCaseFailure>({
          reason: 'InvalidTimeSlot',
          error: new Error('Start and end times must be on the hour (00 minutes).'),
        });
      }

      // Validation: Duration must be whole hours
      const durationMs = endAt.getTime() - startAt.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      if (!Number.isInteger(durationHours) || durationHours < 1) {
        return new Failure<CreatePodcastReservationAdminUseCaseFailure>({
          reason: 'InvalidDuration',
          error: new Error('Reservation duration must be a whole number of hours.'),
        });
      }

      // Check slot availability
      const isAvailable = await this.reservationRepository.checkSlotAvailability(startAt, endAt);
      if (!isAvailable) {
        return new Failure<CreatePodcastReservationAdminUseCaseFailure>({
          reason: 'SlotAlreadyBooked',
          error: new Error('The selected time slot is no longer available'),
        });
      }

      // Generate confirmation ID if status is confirmed
      const status = payload.status || 'confirmed';
      let confirmationId: string | undefined;

      if (status === 'confirmed') {
        const year = startAt.getFullYear();
        const sequence = await this.reservationRepository.getConfirmationSequence(year);
        confirmationId = `CONF-${year}-${sequence.toString().padStart(4, '0')}`;
      }

      // Calculate total price (simplified - in reality would calculate from pack + supplements)
      const totalPrice = '0.00'; // TODO: Implement pricing logic

      // Create reservation
      const reservation = await this.reservationRepository.adminCreate({
        ...payload,
        durationHours,
        totalPrice: parseFloat(totalPrice),
        confirmationId,
      });

      return new Success({ reservation });
    } catch (error) {
      return new Failure<CreatePodcastReservationAdminUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
