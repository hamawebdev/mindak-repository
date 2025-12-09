import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetClientServicesQuestionsUseCaseFailure, GetClientServicesQuestionsUseCasePayload, GetClientServicesQuestionsUseCaseSuccess } from '@/domain/use-cases/form/get-client-services-questions-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type QuestionResponse = {
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
};

type ResponseBody = {
  success: boolean;
  data: {
    general: QuestionResponse[];
    services: Array<{
      service_id: string;
      service_name: string | null;
      questions: QuestionResponse[];
    }>;
  };
};

@injectable()
export class GetClientServicesQuestionsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetClientServicesQuestionsUseCase) private readonly getClientServicesQuestionsUseCase: IUseCase<GetClientServicesQuestionsUseCasePayload, GetClientServicesQuestionsUseCaseSuccess, GetClientServicesQuestionsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const result = await this.getClientServicesQuestionsUseCase.execute({});

    if (result.isSuccess()) {
      const { general, services } = result.value;

      const mapQuestion = (q: any): QuestionResponse => ({
        id: q.id,
        question_text: q.questionText,
        question_type: q.questionType,
        required: q.required,
        order: q.order,
        placeholder: q.placeholder,
        help_text: q.helpText,
        validation_rules: q.validationRules,
        answers: q.answers.map((a: any) => ({
          id: a.id,
          answer_text: a.answerText,
          answer_value: a.answerValue,
          answer_metadata: a.answerMetadata,
          order: a.order,
        })),
      });

      const response: ResponseBody = {
        success: true,
        data: {
          general: general.map(mapQuestion),
          services: services.map(s => ({
            service_id: s.serviceId,
            service_name: s.serviceName,
            questions: s.questions.map(mapQuestion),
          })),
        },
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

