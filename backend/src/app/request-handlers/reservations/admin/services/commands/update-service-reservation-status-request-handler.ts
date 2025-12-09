import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdateServiceReservationStatusUseCaseFailure, UpdateServiceReservationStatusUseCasePayload, UpdateServiceReservationStatusUseCaseSuccess } from '@/domain/use-cases/reservation/update-service-reservation-status-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    reservation: {
      id: string;
      confirmationId: string;
      status: string;
      updatedAt: string;
    };
  };
};

const payloadSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

@injectable()
export class UpdateServiceReservationStatusRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdateServiceReservationStatusUseCase) private readonly updateServiceReservationStatusUseCase: IUseCase<UpdateServiceReservationStatusUseCasePayload, UpdateServiceReservationStatusUseCaseSuccess, UpdateServiceReservationStatusUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    if (!id) {
      throw HttpError.badRequest('Reservation ID is required');
    }

    const validation = payloadSchema.safeParse(req.body);
    if (!validation.success) {
      throw HttpError.badRequest('Invalid request body');
    }

    const { status, notes } = validation.data;
    const changedBy = (req as any).user?.id;

    if (!changedBy) {
      throw HttpError.unauthorized('Unauthorized');
    }

    const result = await this.updateServiceReservationStatusUseCase.execute({
      id,
      status,
      notes,
      changedBy,
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
        case 'InvalidStatus':
          throw HttpError.badRequest('Invalid status value');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

