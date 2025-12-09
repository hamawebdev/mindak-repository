import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetPodcastAnalyticsUseCaseFailure, GetPodcastAnalyticsUseCasePayload, GetPodcastAnalyticsUseCaseSuccess } from '@/domain/use-cases/analytics/get-podcast-analytics-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    totalCount: number;
    statusBreakdown: {
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
    };
    timeSeriesData: Array<{
      date: string;
      count: number;
    }>;
  };
};

const querySchema = z.object({
  dateFrom: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dateTo: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

@injectable()
export class GetPodcastAnalyticsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetPodcastAnalyticsUseCase) private readonly getPodcastAnalyticsUseCase: IUseCase<GetPodcastAnalyticsUseCasePayload, GetPodcastAnalyticsUseCaseSuccess, GetPodcastAnalyticsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { dateFrom, dateTo } = querySchema.parse(req.query);

    const result = await this.getPodcastAnalyticsUseCase.execute({
      filters: { dateFrom, dateTo },
    });

    if (result.isSuccess()) {
      const { analytics } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          totalCount: analytics.totalCount,
          statusBreakdown: analytics.statusBreakdown,
          timeSeriesData: analytics.timeSeriesData,
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

