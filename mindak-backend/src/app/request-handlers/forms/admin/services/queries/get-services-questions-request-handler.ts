import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetServicesQuestionsUseCaseFailure, GetServicesQuestionsUseCasePayload, GetServicesQuestionsUseCaseSuccess } from '@/domain/use-cases/form/get-services-questions-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: Array<{
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
    answers: Array<{
      id: string;
      answer_text: string;
      answer_value: string | null;
      answer_metadata: Record<string, unknown> | null;
      order: number;
      is_active: boolean;
    }>;
    created_at: string;
    updated_at: string;
  }>;
};

@injectable()
export class GetServicesQuestionsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetServicesQuestionsUseCase) private readonly getServicesQuestionsUseCase: IUseCase<GetServicesQuestionsUseCasePayload, GetServicesQuestionsUseCaseSuccess, GetServicesQuestionsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const section = req.query.section as 'general' | 'service_specific' | undefined;
    const serviceId = req.query.serviceId as string | undefined;

    const result = await this.getServicesQuestionsUseCase.execute({
      section,
      serviceId,
      includeInactive: true, // Admin sees all questions
    });

    if (result.isSuccess()) {
      const { questions } = result.value;

      const response: ResponseBody = {
        success: true,
        data: questions.map(q => ({
          id: q.id,
          form_type: q.formType,
          section_type: q.sectionType,
          service_id: q.serviceId,
          question_text: q.questionText,
          question_type: q.questionType,
          required: q.required,
          order: q.order,
          placeholder: q.placeholder,
          help_text: q.helpText,
          validation_rules: q.validationRules,
          is_active: q.isActive,
          answers: q.answers.map(a => ({
            id: a.id,
            answer_text: a.answerText,
            answer_value: a.answerValue,
            answer_metadata: a.answerMetadata,
            order: a.order,
            is_active: a.isActive,
          })),
          created_at: q.createdAt.toISOString(),
          updated_at: q.updatedAt.toISOString(),
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

