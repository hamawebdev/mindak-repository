import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastReservationScheduleUseCaseFailure, UpdatePodcastReservationScheduleUseCasePayload, UpdatePodcastReservationScheduleUseCaseSuccess } from '@/domain/use-cases/reservation/update-podcast-reservation-schedule-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    reservation: {
      id: string;
      status: string;
      startAt: string;
      endAt: string;
      calendarStart: string;
      calendarEnd: string;
      durationHours: number;
      updatedAt: string;
    };
  };
};

const payloadSchema = z.object({
  startAt: z.string(),
  endAt: z.string(),
  timezone: z.string().optional(),
  keepStatus: z.boolean().optional().default(true),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'rejected', 'completed']).optional(),
  reason: z.string().optional(),
});

@injectable()
export class UpdatePodcastReservationScheduleRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastReservationScheduleUseCase)
    private readonly updatePodcastReservationScheduleUseCase: IUseCase<
      UpdatePodcastReservationScheduleUseCasePayload,
      UpdatePodcastReservationScheduleUseCaseSuccess,
      UpdatePodcastReservationScheduleUseCaseFailure
    >,
  ) { }

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    if (!id) {
      throw HttpError.badRequest('Reservation ID is required');
    }

    const validation = payloadSchema.safeParse(req.body);

    if (!validation.success) {
      throw HttpError.badRequest('Invalid request body', { details: validation.error.issues });
    }

    const updatedBy = (req as any).user?.id;
    if (!updatedBy) {
      throw HttpError.unauthorized('Unauthorized');
    }

    const result = await this.updatePodcastReservationScheduleUseCase.execute({
      id,
      ...validation.data,
      updatedBy,
    });

    if (result.isSuccess()) {
      const { reservation } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          reservation: {
            id: reservation.id,
            status: reservation.status,
            startAt: reservation.startAt.toISOString(),
            endAt: reservation.endAt.toISOString(),
            calendarStart: reservation.calendarStart || '',
            calendarEnd: reservation.calendarEnd || '',
            durationHours: reservation.durationHours,
            updatedAt: reservation.updatedAt.toISOString(),
          },
        },
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'ReservationNotFound':
          throw HttpError.notFound('Reservation not found');
        case 'InvalidDuration':
          throw HttpError.badRequest('Duration must be whole hours (1h, 2h, 3h, ...).');
        case 'InvalidTimeSlot':
          throw HttpError.badRequest('Start and end times must be on the hour (00 minutes).');
        case 'SlotAlreadyBooked':
          throw HttpError.conflict('The selected time slot is no longer available');
        case 'ReservationNotEditable':
          throw HttpError.badRequest('Cannot modify completed or cancelled reservations');
        case 'ValidationError':
          throw HttpError.badRequest('Validation failed', { details: failure.errors });
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}
