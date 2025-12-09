import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastSupplementUseCaseFailure, UpdatePodcastSupplementUseCasePayload, UpdatePodcastSupplementUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/update-podcast-supplement-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class UpdatePodcastSupplementRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastSupplementUseCase) private readonly updatePodcastSupplementUseCase: IUseCase<UpdatePodcastSupplementUseCasePayload, UpdatePodcastSupplementUseCaseSuccess, UpdatePodcastSupplementUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const input = req.body;

    const result = await this.updatePodcastSupplementUseCase.execute({ id, input });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: result.value.supplement,
      });
    } else {
      const failure = result.failure;
      if (failure?.reason === 'SupplementNotFound') {
        throw HttpError.notFound('Supplement not found');
      }
      throw failure?.error || new Error('Unknown error');
    }
  }
}
