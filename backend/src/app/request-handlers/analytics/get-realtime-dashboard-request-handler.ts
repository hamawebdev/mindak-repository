import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetRealtimeDashboardUseCaseFailure, GetRealtimeDashboardUseCasePayload, GetRealtimeDashboardUseCaseSuccess } from '@/domain/use-cases/analytics/get-realtime-dashboard-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    todayReservations: number;
    todayPodcast: number;
    todayServices: number;
    recentReservations: Array<{
      id: string;
      type: 'podcast' | 'service';
      confirmationId: string;
      status: string;
      submittedAt: Date;
    }>;
    hourlyData: Array<{
      hour: number;
      count: number;
    }>;
  };
};

@injectable()
export class GetRealtimeDashboardRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetRealtimeDashboardUseCase) private readonly getRealtimeDashboardUseCase: IUseCase<GetRealtimeDashboardUseCasePayload, GetRealtimeDashboardUseCaseSuccess, GetRealtimeDashboardUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const result = await this.getRealtimeDashboardUseCase.execute({});

    if (result.isSuccess()) {
      const { data } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          todayReservations: data.todayReservations,
          todayPodcast: data.todayPodcast,
          todayServices: data.todayServices,
          recentReservations: data.recentReservations,
          hourlyData: data.hourlyData,
        },
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

