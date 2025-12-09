import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { AddServiceReservationNoteUseCaseFailure, AddServiceReservationNoteUseCasePayload, AddServiceReservationNoteUseCaseSuccess } from '@/domain/use-cases/reservation/add-service-reservation-note-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    note: {
      id: string;
      noteText: string;
      createdBy: string;
      createdAt: string;
    };
  };
};

const payloadSchema = z.object({
  noteText: z.string().min(1, 'Note text is required'),
});

@injectable()
export class AddServiceReservationNoteRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.AddServiceReservationNoteUseCase) private readonly addServiceReservationNoteUseCase: IUseCase<AddServiceReservationNoteUseCasePayload, AddServiceReservationNoteUseCaseSuccess, AddServiceReservationNoteUseCaseFailure>,
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

    const { noteText } = validation.data;
    const createdBy = (req as any).user?.id;

    if (!createdBy) {
      throw HttpError.unauthorized('Unauthorized');
    }

    const result = await this.addServiceReservationNoteUseCase.execute({
      reservationId: id,
      noteText,
      createdBy,
    });

    if (result.isSuccess()) {
      const { note } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          note: {
            id: note.id,
            noteText: note.noteText,
            createdBy: note.createdBy,
            createdAt: note.createdAt.toISOString(),
          },
        },
      };

      res.status(201).send(response);
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

