import { inject, injectable } from 'inversify';
import { z, type ZodIssue } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { SubmitServiceReservationUseCaseFailure, SubmitServiceReservationUseCasePayload, SubmitServiceReservationUseCaseSuccess } from '@/domain/use-cases/reservation/submit-service-reservation-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    confirmationId: string;
    status: string;
    services: Array<{
      id: string;
      name: string;
    }>;
    submittedAt: string;
    message: string;
  };
};

const payloadSchema = z.object({
  serviceIds: z.array(z.string()).min(1, 'At least one service must be selected'),
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.string(),
    answerId: z.string().nullable().optional(),
  })),
});

@injectable()
export class SubmitServiceReservationRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.SubmitServiceReservationUseCase) private readonly submitServiceReservationUseCase: IUseCase<SubmitServiceReservationUseCasePayload, SubmitServiceReservationUseCaseSuccess, SubmitServiceReservationUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const validation = payloadSchema.safeParse(req.body);
    if (!validation.success) {
      const validationDetails = validation.error.issues.map((e: ZodIssue) => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));
      throw HttpError.badRequest('Invalid request body', {
        code: 'REQUEST_VALIDATION_ERROR',
        details: validationDetails,
      });
    }

    const { serviceIds, answers } = validation.data;

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    const result = await this.submitServiceReservationUseCase.execute({
      serviceIds,
      answers,
      clientIp,
      userAgent,
    });

    if (result.isSuccess()) {
      const { reservation, services } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          confirmationId: reservation.confirmationId,
          status: reservation.status,
          services,
          submittedAt: reservation.submittedAt.toISOString(),
          message: 'Your service reservation has been submitted successfully. You will receive a confirmation email shortly.',
        },
      };

      res.status(201).send(response);
      return;
    }

    if (!result.failure) {
      throw HttpError.internalServerError('Unexpected result state');
    }

    const failure = result.failure;

    switch (failure.reason) {
      case 'ValidationError':
        throw HttpError.unprocessableEntity('Domain validation failed', {
          code: 'DOMAIN_VALIDATION_ERROR',
          details: (failure as any).details ?? (failure as any).issues ?? [],
        });
      case 'ServicesNotFound':
        throw HttpError.notFound('One or more services were not found', {
          code: 'SERVICES_NOT_FOUND',
          details: { missingServiceIds: (failure as any).missingServiceIds ?? (failure as any).ids ?? [] },
        });
      case 'UnknownError':
      default:
        throw HttpError.internalServerError('Failed to submit service reservation', (failure as any).error, {
          code: 'RESERVATION_SUBMISSION_FAILED',
        });
    }
  }
}

