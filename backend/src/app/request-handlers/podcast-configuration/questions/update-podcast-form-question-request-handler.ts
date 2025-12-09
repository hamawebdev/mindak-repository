import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastFormQuestionUseCaseFailure, UpdatePodcastFormQuestionUseCasePayload, UpdatePodcastFormQuestionUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/questions/update-podcast-form-question-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class UpdatePodcastFormQuestionRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastFormQuestionUseCase) private readonly updatePodcastFormQuestionUseCase: IUseCase<UpdatePodcastFormQuestionUseCasePayload, UpdatePodcastFormQuestionUseCaseSuccess, UpdatePodcastFormQuestionUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const input = req.body;

    const result = await this.updatePodcastFormQuestionUseCase.execute({ id, input });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: result.value.question,
      });
    } else {
      const failure = result.failure;
      if (failure?.reason === 'QuestionNotFound') {
        throw HttpError.notFound('Question not found');
      }
      throw failure?.error || new Error('Unknown error');
    }
  }
}
