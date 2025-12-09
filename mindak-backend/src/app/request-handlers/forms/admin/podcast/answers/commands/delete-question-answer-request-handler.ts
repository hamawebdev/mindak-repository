import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeleteQuestionAnswerUseCaseFailure, DeleteQuestionAnswerUseCasePayload, DeleteQuestionAnswerUseCaseSuccess } from '@/domain/use-cases/form/delete-question-answer-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

@injectable()
export class DeleteQuestionAnswerRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeleteQuestionAnswerUseCase) private readonly deleteQuestionAnswerUseCase: IUseCase<DeleteQuestionAnswerUseCasePayload, DeleteQuestionAnswerUseCaseSuccess, DeleteQuestionAnswerUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    const result = await this.deleteQuestionAnswerUseCase.execute({ id });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Answer deleted successfully',
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'AnswerNotFound':
          throw HttpError.notFound('Answer not found');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

