import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeletePodcastPackOfferUseCaseFailure, DeletePodcastPackOfferUseCasePayload, DeletePodcastPackOfferUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/delete-podcast-pack-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message?: string;
  error?: unknown;
};

@injectable()
export class DeletePodcastPackOfferRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeletePodcastPackOfferUseCase) private readonly deletePodcastPackOfferUseCase: IUseCase<DeletePodcastPackOfferUseCasePayload, DeletePodcastPackOfferUseCaseSuccess, DeletePodcastPackOfferUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    const result = await this.deletePodcastPackOfferUseCase.execute({ id });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        message: 'Pack deleted successfully',
      });
    } else {
      const failure = result.failure;
      if (failure?.reason === 'PackNotFound') {
        throw HttpError.notFound('Pack not found');
      }
      throw failure?.error || new Error('Unknown error');
    }
  }
}
