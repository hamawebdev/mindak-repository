import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { CreateServicesQuestionUseCaseFailure, CreateServicesQuestionUseCasePayload, CreateServicesQuestionUseCaseSuccess } from '@/domain/use-cases/form/create-services-question-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    id: string;
    form_type: string;
    section_type: string;
    service_id: string | null;
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
  section_type: z.enum(['general', 'service_specific']),
  service_id: z.string().nullable().optional(),
  question_text: z.string().min(1),
  question_type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'number', 'url']),
  required: z.boolean(),
  order: z.number().int(),
  placeholder: z.string().nullable().optional(),
  help_text: z.string().nullable().optional(),
  validation_rules: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.boolean(),
});

@injectable()
export class CreateServicesQuestionRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.CreateServicesQuestionUseCase) private readonly createServicesQuestionUseCase: IUseCase<CreateServicesQuestionUseCasePayload, CreateServicesQuestionUseCaseSuccess, CreateServicesQuestionUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const payload = payloadSchema.parse(req.body);

    const result = await this.createServicesQuestionUseCase.execute({
      sectionType: payload.section_type,
      serviceId: payload.service_id,
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
          section_type: question.sectionType,
          service_id: question.serviceId,
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

      res.status(201).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'InvalidSectionServiceCombination':
          throw HttpError.badRequest(failure.error.message);
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

