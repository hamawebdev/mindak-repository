import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetDashboardMetricsUseCaseFailure, GetDashboardMetricsUseCasePayload, GetDashboardMetricsUseCaseSuccess } from '@/domain/use-cases/analytics/get-dashboard-metrics-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    totalReservations: number;
    podcastReservations: number;
    serviceReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    conversionRate: number;
    periodComparison: {
      reservationsChange: number;
      conversionRateChange: number;
    };
  };
};

const querySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
});

@injectable()
export class GetDashboardMetricsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetDashboardMetricsUseCase) private readonly getDashboardMetricsUseCase: IUseCase<GetDashboardMetricsUseCasePayload, GetDashboardMetricsUseCaseSuccess, GetDashboardMetricsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { period } = querySchema.parse(req.query);

    const result = await this.getDashboardMetricsUseCase.execute({ period });

    if (result.isSuccess()) {
      const { metrics } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          totalReservations: metrics.totalReservations,
          podcastReservations: metrics.podcastReservations,
          serviceReservations: metrics.serviceReservations,
          pendingReservations: metrics.pendingReservations,
          confirmedReservations: metrics.confirmedReservations,
          completedReservations: metrics.completedReservations,
          cancelledReservations: metrics.cancelledReservations,
          conversionRate: metrics.conversionRate,
          periodComparison: metrics.periodComparison,
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

