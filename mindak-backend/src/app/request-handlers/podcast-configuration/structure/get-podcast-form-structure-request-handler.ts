import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetPodcastFormStructureUseCaseFailure, GetPodcastFormStructureUseCasePayload, GetPodcastFormStructureUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/get-podcast-form-structure-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class GetPodcastFormStructureRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetPodcastFormStructureUseCase) private readonly getPodcastFormStructureUseCase: IUseCase<GetPodcastFormStructureUseCasePayload, GetPodcastFormStructureUseCaseSuccess, GetPodcastFormStructureUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    // Admin sees everything including inactive
    const includeInactive = true;

    const result = await this.getPodcastFormStructureUseCase.execute({ includeInactive });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: {
          steps: result.value.steps,
          unassignedQuestions: result.value.unassignedQuestions,
        },
      });
    } else {
      res.status(500).send({
        success: false,
        data: null,
        error: result.failure?.error.message || 'Unknown error',
      });
    }
  }
}
