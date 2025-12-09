import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { CreatePodcastFormStepUseCaseFailure, CreatePodcastFormStepUseCasePayload, CreatePodcastFormStepUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/steps/create-podcast-form-step-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class CreatePodcastFormStepRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.CreatePodcastFormStepUseCase) private readonly createPodcastFormStepUseCase: IUseCase<CreatePodcastFormStepUseCasePayload, CreatePodcastFormStepUseCaseSuccess, CreatePodcastFormStepUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const input = req.body;

    const result = await this.createPodcastFormStepUseCase.execute(input);

    if (result.isSuccess()) {
      res.status(201).send({
        success: true,
        data: result.value.step,
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
