import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeletePodcastQuestionUseCaseFailure, DeletePodcastQuestionUseCasePayload, DeletePodcastQuestionUseCaseSuccess } from '@/domain/use-cases/form/delete-podcast-question-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

@injectable()
export class DeletePodcastQuestionRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeletePodcastQuestionUseCase) private readonly deletePodcastQuestionUseCase: IUseCase<DeletePodcastQuestionUseCasePayload, DeletePodcastQuestionUseCaseSuccess, DeletePodcastQuestionUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    const result = await this.deletePodcastQuestionUseCase.execute({ id });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Question deleted successfully',
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'QuestionNotFound':
          throw HttpError.notFound('Question not found');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

