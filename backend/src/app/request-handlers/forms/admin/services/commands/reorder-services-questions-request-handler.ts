import { inject, injectable } from 'inversify';
import { z } from 'zod';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { ReorderServicesQuestionsUseCaseFailure, ReorderServicesQuestionsUseCasePayload, ReorderServicesQuestionsUseCaseSuccess } from '@/domain/use-cases/form/reorder-services-questions-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

const payloadSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    order: z.number().int(),
  })),
});

@injectable()
export class ReorderServicesQuestionsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.ReorderServicesQuestionsUseCase) private readonly reorderServicesQuestionsUseCase: IUseCase<ReorderServicesQuestionsUseCasePayload, ReorderServicesQuestionsUseCaseSuccess, ReorderServicesQuestionsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const payload = payloadSchema.parse(req.body);

    const result = await this.reorderServicesQuestionsUseCase.execute({
      questions: payload.questions,
    });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Questions reordered successfully',
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

