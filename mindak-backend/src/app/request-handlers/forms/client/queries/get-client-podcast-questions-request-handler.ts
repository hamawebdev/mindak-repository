import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetClientPodcastQuestionsUseCaseFailure, GetClientPodcastQuestionsUseCasePayload, GetClientPodcastQuestionsUseCaseSuccess } from '@/domain/use-cases/form/get-client-podcast-questions-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: Array<{
    id: string;
    question_text: string;
    question_type: string;
    required: boolean;
    order: number;
    placeholder: string | null;
    help_text: string | null;
    validation_rules: Record<string, unknown> | null;
    answers: Array<{
      id: string;
      answer_text: string;
      answer_value: string | null;
      answer_metadata: Record<string, unknown> | null;
      order: number;
    }>;
  }>;
};

@injectable()
export class GetClientPodcastQuestionsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetClientPodcastQuestionsUseCase) private readonly getClientPodcastQuestionsUseCase: IUseCase<GetClientPodcastQuestionsUseCasePayload, GetClientPodcastQuestionsUseCaseSuccess, GetClientPodcastQuestionsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const result = await this.getClientPodcastQuestionsUseCase.execute({});

    if (result.isSuccess()) {
      const { questions } = result.value;

      const response: ResponseBody = {
        success: true,
        data: questions.map(q => ({
          id: q.id,
          question_text: q.questionText,
          question_type: q.questionType,
          required: q.required,
          order: q.order,
          placeholder: q.placeholder,
          help_text: q.helpText,
          validation_rules: q.validationRules,
          answers: q.answers.map(a => ({
            id: a.id,
            answer_text: a.answerText,
            answer_value: a.answerValue,
            answer_metadata: a.answerMetadata,
            order: a.order,
          })),
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

