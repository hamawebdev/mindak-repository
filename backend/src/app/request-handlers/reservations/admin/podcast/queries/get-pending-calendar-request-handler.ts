import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetPendingCalendarUseCaseFailure, GetPendingCalendarUseCasePayload, GetPendingCalendarUseCaseSuccess } from '@/domain/use-cases/reservation/get-pending-calendar-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: Array<{
    id: string;
    confirmationId: string | null;
    status: string;
    calendarStart: string;
    calendarEnd: string;
    durationHours: number;
    customerName: string;
    customerEmail: string;
    notes: string | null;
    assignedAdminId: string | null;
  }>;
};

@injectable()
export class GetPendingCalendarRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetPendingCalendarUseCase)
    private readonly getPendingCalendarUseCase: IUseCase<
      GetPendingCalendarUseCasePayload,
      GetPendingCalendarUseCaseSuccess,
      GetPendingCalendarUseCaseFailure
    >,
  ) { }

  async handler(req: Request, res: Response<ResponseBody>) {
    const date = req.query.date as string | undefined;

    const result = await this.getPendingCalendarUseCase.execute({
      date: date ? new Date(date) : undefined,
    });

    if (result.isSuccess()) {
      const { reservations } = result.value;

      const response: ResponseBody = {
        success: true,
        data: reservations.map(r => ({
          id: r.id,
          confirmationId: r.confirmationId,
          status: r.status,
          calendarStart: r.calendarStart || '',
          calendarEnd: r.calendarEnd || '',
          durationHours: r.durationHours,
          customerName: r.customerName,
          customerEmail: r.customerEmail,
          notes: r.notes,
          assignedAdminId: r.assignedAdminId,
        })),
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'InvalidDate':
          throw HttpError.badRequest('Invalid date format. Use YYYY-MM-DD');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}
