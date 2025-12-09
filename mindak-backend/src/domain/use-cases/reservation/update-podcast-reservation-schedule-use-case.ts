import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { PodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import type { PodcastReservationNew, UpdateScheduleInput } from '@/domain/models/podcast-reservation-new';

export type UpdatePodcastReservationScheduleUseCasePayload = UpdateScheduleInput & {
  id: string;
  updatedBy: string;
};

export type UpdatePodcastReservationScheduleUseCaseSuccess = {
  reservation: PodcastReservationNew;
};

export type UpdatePodcastReservationScheduleUseCaseFailure = {
  reason: 'ReservationNotFound' | 'InvalidDuration' | 'InvalidTimeSlot' | 'SlotAlreadyBooked' | 'ReservationNotEditable' | 'ValidationError' | 'UnknownError';
  error: Error;
  errors?: any[];
};

@injectable()
export class UpdatePodcastReservationScheduleUseCase implements IUseCase<
  UpdatePodcastReservationScheduleUseCasePayload,
  UpdatePodcastReservationScheduleUseCaseSuccess,
  UpdatePodcastReservationScheduleUseCaseFailure
> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationNewRepository)
    private readonly reservationRepository: PodcastReservationNewRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) { }

  async execute(payload: UpdatePodcastReservationScheduleUseCasePayload) {
    try {
      // Get existing reservation
      const existingReservation = await this.reservationRepository.findById(payload.id);
      if (!existingReservation) {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found'),
        });
      }

      // Check if reservation is editable
      if (existingReservation.status === 'completed' || existingReservation.status === 'cancelled') {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'ReservationNotEditable',
          error: new Error('Cannot modify completed or cancelled reservations'),
        });
      }

      // Parse dates
      const startAt = new Date(payload.startAt);
      const endAt = new Date(payload.endAt);

      // Validation: Check if dates are valid
      if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Invalid date format'),
          errors: [{ field: 'startAt/endAt', message: 'Invalid ISO 8601 date format' }],
        });
      }

      // Validation: Start must be before end
      if (startAt >= endAt) {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Start time must be before end time'),
          errors: [{ field: 'startAt', message: 'Start time must be before end time' }],
        });
      }

      // Validation: Times must be on the hour (minutes = 0)
      if (startAt.getMinutes() !== 0 || endAt.getMinutes() !== 0) {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'InvalidTimeSlot',
          error: new Error('Start and end times must be on the hour (00 minutes).'),
        });
      }

      // Validation: Duration must be whole hours
      const durationMs = endAt.getTime() - startAt.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      if (!Number.isInteger(durationHours) || durationHours < 1) {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'InvalidDuration',
          error: new Error('Duration must be whole hours (1h, 2h, 3h, ...).'),
        });
      }

      // Check slot availability (excluding current reservation)
      const isAvailable = await this.reservationRepository.checkSlotAvailability(
        startAt,
        endAt,
        payload.id
      );

      if (!isAvailable) {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'SlotAlreadyBooked',
          error: new Error('The selected time slot is no longer available'),
        });
      }

      // Update schedule
      const updatedReservation = await this.reservationRepository.updateSchedule(payload.id, {
        startAt: payload.startAt,
        endAt: payload.endAt,
        timezone: payload.timezone,
        keepStatus: payload.keepStatus,
        status: payload.status,
        reason: payload.reason,
        durationHours,
      });

      if (!updatedReservation) {
        return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
          reason: 'ReservationNotFound',
          error: new Error('Reservation not found after update'),
        });
      }

      return new Success({ reservation: updatedReservation });
    } catch (error) {
      return new Failure<UpdatePodcastReservationScheduleUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
