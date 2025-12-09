import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeleteServiceReservationUseCaseFailure, DeleteServiceReservationUseCasePayload, DeleteServiceReservationUseCaseSuccess } from '@/domain/use-cases/reservation/delete-service-reservation-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

@injectable()
export class DeleteServiceReservationRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeleteServiceReservationUseCase) private readonly deleteServiceReservationUseCase: IUseCase<DeleteServiceReservationUseCasePayload, DeleteServiceReservationUseCaseSuccess, DeleteServiceReservationUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    if (!id) {
      throw HttpError.badRequest('Reservation ID is required');
    }

    const result = await this.deleteServiceReservationUseCase.execute({ id });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Reservation deleted successfully',
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

