import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastThemeUseCaseFailure, UpdatePodcastThemeUseCasePayload, UpdatePodcastThemeUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/update-podcast-theme-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class UpdatePodcastThemeRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastThemeUseCase) private readonly updatePodcastThemeUseCase: IUseCase<UpdatePodcastThemeUseCasePayload, UpdatePodcastThemeUseCaseSuccess, UpdatePodcastThemeUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const input = req.body;

    const result = await this.updatePodcastThemeUseCase.execute({ id, input });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: result.value.theme,
      });
    } else {
      const error = result.failure;
      if (error?.reason === 'NotFound') {
        res.status(404).send({
          success: false,
          data: null,
          error: error.error.message,
        });
      } else {
        res.status(500).send({
          success: false,
          data: null,
          error: error?.error.message || 'Unknown error',
        });
      }
    }
  }
}
