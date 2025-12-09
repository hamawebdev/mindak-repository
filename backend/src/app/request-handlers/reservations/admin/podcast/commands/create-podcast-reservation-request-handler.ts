import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { CreatePodcastReservationAdminUseCaseFailure, CreatePodcastReservationAdminUseCasePayload, CreatePodcastReservationAdminUseCaseSuccess } from '@/domain/use-cases/reservation/create-podcast-reservation-admin-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    reservation: {
      id: string;
      confirmationId: string | null;
      status: string;
      startAt: string;
      endAt: string;
      calendarStart: string;
      calendarEnd: string;
      durationHours: number;
      timezone: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string | null;
      totalPrice: string;
      assignedAdminId: string | null;
      createdAt: string;
      confirmedAt: string | null;
    };
  };
};

const payloadSchema = z.object({
  startAt: z.string(),
  endAt: z.string(),
  timezone: z.string().optional(),
  status: z.enum(['pending', 'confirmed']).optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  decorId: z.string().uuid().optional(),
  packOfferId: z.string().uuid().optional(),
  themeId: z.string().uuid().optional(),
  customTheme: z.string().optional(),
  podcastDescription: z.string().optional(),
  supplementIds: z.array(z.string().uuid()).optional(),
  assignedAdminId: z.string().uuid().optional(),
  notes: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    answerText: z.string().optional(),
    answerOptionIds: z.array(z.string()).optional(),
  })).optional(),
});

@injectable()
export class CreatePodcastReservationRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.CreatePodcastReservationAdminUseCase)
    private readonly createPodcastReservationAdminUseCase: IUseCase<
      CreatePodcastReservationAdminUseCasePayload,
      CreatePodcastReservationAdminUseCaseSuccess,
      CreatePodcastReservationAdminUseCaseFailure
    >,
  ) { }

  async handler(req: Request, res: Response<ResponseBody>) {
    const validation = payloadSchema.safeParse(req.body);

    if (!validation.success) {
      throw HttpError.badRequest('Invalid request body', { details: validation.error.issues });
    }

    const createdBy = (req as any).user?.id;
    if (!createdBy) {
      throw HttpError.unauthorized('Unauthorized');
    }

    // Sanitize answers to handle answerOptionIds properly
    const sanitizedData = {
      ...validation.data,
      answers: validation.data.answers?.map(answer => ({
        questionId: answer.questionId,
        answerText: answer.answerText,
        // Only include answerOptionIds if it's a non-empty array
        ...(Array.isArray(answer.answerOptionIds) && answer.answerOptionIds.length > 0
          ? { answerOptionIds: answer.answerOptionIds }
          : {}),
      })),
    };

    const result = await this.createPodcastReservationAdminUseCase.execute({
      ...sanitizedData,
      createdBy,
    });

    if (result.isSuccess()) {
      const { reservation } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          reservation: {
            id: reservation.id,
            confirmationId: reservation.confirmationId,
            status: reservation.status,
            startAt: reservation.startAt.toISOString(),
            endAt: reservation.endAt.toISOString(),
            calendarStart: reservation.calendarStart || '',
            calendarEnd: reservation.calendarEnd || '',
            durationHours: reservation.durationHours,
            timezone: reservation.timezone,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            customerPhone: reservation.customerPhone,
            totalPrice: reservation.totalPrice,
            assignedAdminId: reservation.assignedAdminId,
            createdAt: reservation.createdAt.toISOString(),
            confirmedAt: reservation.confirmedAt ? reservation.confirmedAt.toISOString() : null,
          },
        },
      };

      res.status(201).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'InvalidDuration':
          throw HttpError.badRequest('Reservation duration must be a whole number of hours.');
        case 'InvalidTimeSlot':
          throw HttpError.badRequest('Start and end times must be on the hour (00 minutes).');
        case 'SlotAlreadyBooked':
          throw HttpError.conflict('The selected time slot is no longer available');
        case 'ValidationError':
          throw HttpError.badRequest('Validation failed', { details: failure.errors });
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}
