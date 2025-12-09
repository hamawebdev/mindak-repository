import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetTrendAnalysisUseCaseFailure, GetTrendAnalysisUseCasePayload, GetTrendAnalysisUseCaseSuccess } from '@/domain/use-cases/analytics/get-trend-analysis-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    metric: string;
    period: string;
    data: Array<{
      date: string;
      value: number;
      label?: string;
    }>;
    summary: {
      total: number;
      average: number;
      peak: number;
      peakDate: string;
    };
  };
};

const querySchema = z.object({
  metric: z.enum(['reservations', 'podcast', 'services', 'conversion']).default('reservations'),
  period: z.string().default('30d'),
});

@injectable()
export class GetTrendAnalysisRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetTrendAnalysisUseCase) private readonly getTrendAnalysisUseCase: IUseCase<GetTrendAnalysisUseCasePayload, GetTrendAnalysisUseCaseSuccess, GetTrendAnalysisUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { metric, period } = querySchema.parse(req.query);

    const result = await this.getTrendAnalysisUseCase.execute({ metric, period });

    if (result.isSuccess()) {
      const { analysis } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          metric: analysis.metric,
          period: analysis.period,
          data: analysis.data,
          summary: analysis.summary,
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

