import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdateQuestionAnswerUseCaseFailure, UpdateQuestionAnswerUseCasePayload, UpdateQuestionAnswerUseCaseSuccess } from '@/domain/use-cases/form/update-question-answer-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    id: string;
    question_id: string;
    answer_text: string;
    answer_value: string | null;
    answer_metadata: Record<string, unknown> | null;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
};

const payloadSchema = z.object({
  answer_text: z.string().min(1).optional(),
  answer_value: z.string().nullable().optional(),
  answer_metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

@injectable()
export class UpdateServicesQuestionAnswerRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdateQuestionAnswerUseCase) private readonly updateQuestionAnswerUseCase: IUseCase<UpdateQuestionAnswerUseCasePayload, UpdateQuestionAnswerUseCaseSuccess, UpdateQuestionAnswerUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const payload = payloadSchema.parse(req.body);

    const result = await this.updateQuestionAnswerUseCase.execute({
      id,
      answerText: payload.answer_text,
      answerValue: payload.answer_value,
      answerMetadata: payload.answer_metadata,
      order: payload.order,
      isActive: payload.is_active,
    });

    if (result.isSuccess()) {
      const { answer } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          id: answer.id,
          question_id: answer.questionId,
          answer_text: answer.answerText,
          answer_value: answer.answerValue,
          answer_metadata: answer.answerMetadata,
          order: answer.order,
          is_active: answer.isActive,
          created_at: answer.createdAt.toISOString(),
          updated_at: answer.updatedAt.toISOString(),
        },
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

