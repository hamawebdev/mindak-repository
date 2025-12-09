import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { CreatePodcastFormQuestionUseCaseFailure, CreatePodcastFormQuestionUseCasePayload, CreatePodcastFormQuestionUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/questions/create-podcast-form-question-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class CreatePodcastFormQuestionRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.CreatePodcastFormQuestionUseCase) private readonly createPodcastFormQuestionUseCase: IUseCase<CreatePodcastFormQuestionUseCasePayload, CreatePodcastFormQuestionUseCaseSuccess, CreatePodcastFormQuestionUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const input = req.body;

    const result = await this.createPodcastFormQuestionUseCase.execute(input);

    if (result.isSuccess()) {
      res.status(201).send({
        success: true,
        data: result.value.question,
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
