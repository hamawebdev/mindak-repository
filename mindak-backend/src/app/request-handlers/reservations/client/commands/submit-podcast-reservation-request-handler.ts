import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { SubmitPodcastReservationUseCaseFailure, SubmitPodcastReservationUseCasePayload, SubmitPodcastReservationUseCaseSuccess } from '@/domain/use-cases/reservation/submit-podcast-reservation-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    confirmationId: string;
    status: string;
    submittedAt: string;
    message: string;
  };
};

const payloadSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.string(),
    answerId: z.string().nullable().optional(),
  })),
});

@injectable()
export class SubmitPodcastReservationRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.SubmitPodcastReservationUseCase) private readonly submitPodcastReservationUseCase: IUseCase<SubmitPodcastReservationUseCasePayload, SubmitPodcastReservationUseCaseSuccess, SubmitPodcastReservationUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const validation = payloadSchema.safeParse(req.body);
    if (!validation.success) {
      throw HttpError.badRequest('Invalid request body');
    }

    const { answers } = validation.data;

    // Get client IP and user agent
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    const result = await this.submitPodcastReservationUseCase.execute({
      answers,
      clientIp,
      userAgent,
    });

    if (result.isSuccess()) {
      const { reservation } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          confirmationId: reservation.confirmationId,
          status: reservation.status,
          submittedAt: reservation.submittedAt.toISOString(),
          message: 'Your podcast reservation has been submitted successfully. You will receive a confirmation email shortly.',
        },
      };

      res.status(201).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'ValidationError':
          throw HttpError.badRequest('Validation failed');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

