import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetReservationConfirmationUseCaseFailure, GetReservationConfirmationUseCasePayload, GetReservationConfirmationUseCaseSuccess } from '@/domain/use-cases/reservation/get-reservation-confirmation-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    confirmationId: string;
    type: 'podcast' | 'service';
    status: string;
    submittedAt: string;
    clientAnswers: Array<{
      questionText: string;
      questionType: string;
      value: string;
      answerText?: string | null;
    }>;
    serviceIds?: string[];
  };
};

@injectable()
export class GetReservationConfirmationRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetReservationConfirmationUseCase) private readonly getReservationConfirmationUseCase: IUseCase<GetReservationConfirmationUseCasePayload, GetReservationConfirmationUseCaseSuccess, GetReservationConfirmationUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { confirmationId } = req.params;

    if (!confirmationId) {
      throw HttpError.badRequest('Confirmation ID is required');
    }

    const result = await this.getReservationConfirmationUseCase.execute({
      confirmationId,
    });

    if (result.isSuccess()) {
      const { reservation, type } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          confirmationId: reservation.confirmationId,
          type,
          status: reservation.status,
          submittedAt: reservation.submittedAt.toISOString(),
          clientAnswers: reservation.clientAnswers.map(a => ({
            questionText: a.questionText,
            questionType: a.questionType,
            value: a.value,
            answerText: a.answerText,
          })),
          ...(type === 'service' && { serviceIds: (reservation as any).serviceIds }),
        },
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'ReservationNotFound':
          throw HttpError.notFound('Reservation not found');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

