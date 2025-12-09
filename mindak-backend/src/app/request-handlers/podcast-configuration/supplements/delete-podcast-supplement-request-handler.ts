import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeletePodcastSupplementUseCaseFailure, DeletePodcastSupplementUseCasePayload, DeletePodcastSupplementUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/delete-podcast-supplement-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message?: string;
  error?: unknown;
};

@injectable()
export class DeletePodcastSupplementRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeletePodcastSupplementUseCase) private readonly deletePodcastSupplementUseCase: IUseCase<DeletePodcastSupplementUseCasePayload, DeletePodcastSupplementUseCaseSuccess, DeletePodcastSupplementUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    const result = await this.deletePodcastSupplementUseCase.execute({ id });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        message: 'Supplement deleted successfully',
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
