import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastQuestionUseCaseFailure, UpdatePodcastQuestionUseCasePayload, UpdatePodcastQuestionUseCaseSuccess } from '@/domain/use-cases/form/update-podcast-question-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    id: string;
    form_type: string;
    question_text: string;
    question_type: string;
    required: boolean;
    order: number;
    placeholder: string | null;
    help_text: string | null;
    validation_rules: Record<string, unknown> | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
};

const payloadSchema = z.object({
  question_text: z.string().min(1).optional(),
  question_type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'number', 'url']).optional(),
  required: z.boolean().optional(),
  order: z.number().int().optional(),
  placeholder: z.string().nullable().optional(),
  help_text: z.string().nullable().optional(),
  validation_rules: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.boolean().optional(),
});

@injectable()
export class UpdatePodcastQuestionRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastQuestionUseCase) private readonly updatePodcastQuestionUseCase: IUseCase<UpdatePodcastQuestionUseCasePayload, UpdatePodcastQuestionUseCaseSuccess, UpdatePodcastQuestionUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const payload = payloadSchema.parse(req.body);

    const result = await this.updatePodcastQuestionUseCase.execute({
      id,
      questionText: payload.question_text,
      questionType: payload.question_type,
      required: payload.required,
      order: payload.order,
      placeholder: payload.placeholder,
      helpText: payload.help_text,
      validationRules: payload.validation_rules,
      isActive: payload.is_active,
    });

    if (result.isSuccess()) {
      const { question } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          id: question.id,
          form_type: question.formType,
          question_text: question.questionText,
          question_type: question.questionType,
          required: question.required,
          order: question.order,
          placeholder: question.placeholder,
          help_text: question.helpText,
          validation_rules: question.validationRules,
          is_active: question.isActive,
          created_at: question.createdAt.toISOString(),
          updated_at: question.updatedAt.toISOString(),
        },
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

