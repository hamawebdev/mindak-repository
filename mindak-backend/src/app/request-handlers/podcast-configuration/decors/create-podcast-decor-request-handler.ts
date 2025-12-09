import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { CreatePodcastDecorUseCaseFailure, CreatePodcastDecorUseCasePayload, CreatePodcastDecorUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/create-podcast-decor-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class CreatePodcastDecorRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.CreatePodcastDecorUseCase) private readonly createPodcastDecorUseCase: IUseCase<CreatePodcastDecorUseCasePayload, CreatePodcastDecorUseCaseSuccess, CreatePodcastDecorUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const input = req.body;

    const result = await this.createPodcastDecorUseCase.execute(input);

    if (result.isSuccess()) {
      res.status(201).send({
        success: true,
        data: result.value.decor,
      });
    } else {
      res.status(500).send({
        success: false,
        data: null,
        error: result.failure?.error.message || 'Unknown error',
      });
    }
  }
}
