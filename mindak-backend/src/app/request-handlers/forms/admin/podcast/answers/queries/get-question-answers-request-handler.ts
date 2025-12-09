import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetQuestionAnswersUseCaseFailure, GetQuestionAnswersUseCasePayload, GetQuestionAnswersUseCaseSuccess } from '@/domain/use-cases/form/get-question-answers-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: Array<{
    id: string;
    question_id: string;
    answer_text: string;
    answer_value: string | null;
    answer_metadata: Record<string, unknown> | null;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
};

@injectable()
export class GetQuestionAnswersRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetQuestionAnswersUseCase) private readonly getQuestionAnswersUseCase: IUseCase<GetQuestionAnswersUseCasePayload, GetQuestionAnswersUseCaseSuccess, GetQuestionAnswersUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { questionId } = req.params;

    const result = await this.getQuestionAnswersUseCase.execute({
      questionId,
      includeInactive: true, // Admin sees all answers
    });

    if (result.isSuccess()) {
      const { answers } = result.value;

      const response: ResponseBody = {
        success: true,
        data: answers.map(a => ({
          id: a.id,
          question_id: a.questionId,
          answer_text: a.answerText,
          answer_value: a.answerValue,
          answer_metadata: a.answerMetadata,
          order: a.order,
          is_active: a.isActive,
          created_at: a.createdAt.toISOString(),
          updated_at: a.updatedAt.toISOString(),
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

