import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetPodcastThemesUseCaseFailure, GetPodcastThemesUseCasePayload, GetPodcastThemesUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/get-podcast-themes-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class GetPodcastThemesRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetPodcastThemesUseCase) private readonly getPodcastThemesUseCase: IUseCase<GetPodcastThemesUseCasePayload, GetPodcastThemesUseCaseSuccess, GetPodcastThemesUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    // Admin can see all, but maybe we want a filter query param?
    // The repository supports activeOnly.
    // For admin endpoints, we usually want all.

    const result = await this.getPodcastThemesUseCase.execute({});

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: result.value.themes,
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
