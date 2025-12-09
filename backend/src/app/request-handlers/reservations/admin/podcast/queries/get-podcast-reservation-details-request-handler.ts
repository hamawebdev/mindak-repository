import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetPodcastReservationDetailsUseCaseFailure, GetPodcastReservationDetailsUseCasePayload, GetPodcastReservationDetailsUseCaseSuccess } from '@/domain/use-cases/reservation/get-podcast-reservation-details-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    reservation: {
      id: string;
      confirmationId: string;
      status: string;
      clientAnswers: any[];
      clientIp: string | null;
      userAgent: string | null;
      submittedAt: string;
      createdAt: string;
      updatedAt: string;
    };
    statusHistory: Array<{
      id: string;
      oldStatus: string | null;
      newStatus: string;
      notes: string | null;
      changedBy: string | null;
      changedAt: string;
    }>;
    notes: Array<{
      id: string;
      noteText: string;
      createdBy: string;
      createdAt: string;
    }>;
  };
};

@injectable()
export class GetPodcastReservationDetailsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetPodcastReservationDetailsUseCase) private readonly getPodcastReservationDetailsUseCase: IUseCase<GetPodcastReservationDetailsUseCasePayload, GetPodcastReservationDetailsUseCaseSuccess, GetPodcastReservationDetailsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    if (!id) {
      throw HttpError.badRequest('Reservation ID is required');
    }

    const result = await this.getPodcastReservationDetailsUseCase.execute({ id });

    if (result.isSuccess()) {
      const { reservation, statusHistory, notes } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          reservation: {
            id: reservation.id,
            confirmationId: reservation.confirmationId,
            status: reservation.status,
            clientAnswers: reservation.clientAnswers,
            clientIp: reservation.clientIp,
            userAgent: reservation.userAgent,
            submittedAt: reservation.submittedAt.toISOString(),
            createdAt: reservation.createdAt.toISOString(),
            updatedAt: reservation.updatedAt.toISOString(),
          },
          statusHistory: statusHistory.map(h => ({
            id: h.id,
            oldStatus: h.oldStatus,
            newStatus: h.newStatus,
            notes: h.notes,
            changedBy: h.changedBy,
            changedAt: h.changedAt.toISOString(),
          })),
          notes: notes.map(n => ({
            id: n.id,
            noteText: n.noteText,
            createdBy: n.createdBy,
            createdAt: n.createdAt.toISOString(),
          })),
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

