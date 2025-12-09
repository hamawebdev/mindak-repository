import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetTopServicesUseCaseFailure, GetTopServicesUseCasePayload, GetTopServicesUseCaseSuccess } from '@/domain/use-cases/analytics/get-top-services-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: Array<{
    serviceId: string;
    serviceName: string;
    reservationCount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
};

const querySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  period: z.string().default('30d'),
});

@injectable()
export class GetTopServicesRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetTopServicesUseCase) private readonly getTopServicesUseCase: IUseCase<GetTopServicesUseCasePayload, GetTopServicesUseCaseSuccess, GetTopServicesUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { limit, period } = querySchema.parse(req.query);

    const result = await this.getTopServicesUseCase.execute({ limit, period });

    if (result.isSuccess()) {
      const { services } = result.value;

      const response: ResponseBody = {
        success: true,
        data: services,
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

