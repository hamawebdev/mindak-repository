import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastDecorUseCaseFailure, UpdatePodcastDecorUseCasePayload, UpdatePodcastDecorUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/update-podcast-decor-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class UpdatePodcastDecorRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastDecorUseCase) private readonly updatePodcastDecorUseCase: IUseCase<UpdatePodcastDecorUseCasePayload, UpdatePodcastDecorUseCaseSuccess, UpdatePodcastDecorUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const input = req.body;

    const result = await this.updatePodcastDecorUseCase.execute({ id, input });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: result.value.decor,
      });
    } else {
      const failure = result.failure;
      if (failure?.reason === 'DecorNotFound') {
        throw HttpError.notFound('Decor not found');
      }
      throw failure?.error || new Error('Unknown error');
    }
  }
}
