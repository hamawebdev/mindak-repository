import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdatePodcastPackOfferUseCaseFailure, UpdatePodcastPackOfferUseCasePayload, UpdatePodcastPackOfferUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/update-podcast-pack-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';
import { updatePayloadSchema } from './schemas';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class UpdatePodcastPackOfferRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdatePodcastPackOfferUseCase) private readonly updatePodcastPackOfferUseCase: IUseCase<UpdatePodcastPackOfferUseCasePayload, UpdatePodcastPackOfferUseCaseSuccess, UpdatePodcastPackOfferUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const input = updatePayloadSchema.parse(req.body);

    const result = await this.updatePodcastPackOfferUseCase.execute({
      id,
      input: {
        ...input,
        description: input.description || undefined,
        metadata: input.metadata || undefined,
      },
    });

    if (result.isSuccess()) {
      res.status(200).send({
        success: true,
        data: result.value.packOffer,
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
