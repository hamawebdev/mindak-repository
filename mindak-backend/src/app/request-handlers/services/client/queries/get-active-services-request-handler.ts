import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetActiveServicesUseCaseFailure, GetActiveServicesUseCasePayload, GetActiveServicesUseCaseSuccess } from '@/domain/use-cases/service/get-active-services-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
};

@injectable()
export class GetActiveServicesRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetActiveServicesUseCase) private readonly getActiveServicesUseCase: IUseCase<GetActiveServicesUseCasePayload, GetActiveServicesUseCaseSuccess, GetActiveServicesUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const result = await this.getActiveServicesUseCase.execute({});

    if (result.isSuccess()) {
      const { services } = result.value;

      const response: ResponseBody = {
        success: true,
        data: services.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
        })),
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

