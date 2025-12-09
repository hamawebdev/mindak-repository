import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeletePodcastFormQuestionUseCaseFailure, DeletePodcastFormQuestionUseCasePayload, DeletePodcastFormQuestionUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/questions/delete-podcast-form-question-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message?: string;
  error?: unknown;
};

@injectable()
export class DeletePodcastFormQuestionRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeletePodcastFormQuestionUseCase) private readonly deletePodcastFormQuestionUseCase: IUseCase<DeletePodcastFormQuestionUseCasePayload, DeletePodcastFormQuestionUseCaseSuccess, DeletePodcastFormQuestionUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    const result = await this.deletePodcastFormQuestionUseCase.execute({ id });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        message: 'Question deleted successfully',
      });
    } else {
      const failure = result.failure;
      if (failure?.reason === 'QuestionNotFound') {
        throw HttpError.notFound('Question not found');
      }
      if (failure?.reason === 'MandatoryQuestion') {
        throw HttpError.badRequest(failure.error.message);
      }
      throw failure?.error || new Error('Unknown error');
    }
  }
}
