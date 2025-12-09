import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { CreatePodcastPackOfferUseCaseFailure, CreatePodcastPackOfferUseCasePayload, CreatePodcastPackOfferUseCaseSuccess } from '@/domain/use-cases/podcast-configuration/create-podcast-pack-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { createPayloadSchema } from './schemas';

type ResponseBody = {
  success: boolean;
  data: unknown;
  error?: unknown;
};

@injectable()
export class CreatePodcastPackOfferRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.CreatePodcastPackOfferUseCase) private readonly createPodcastPackOfferUseCase: IUseCase<CreatePodcastPackOfferUseCasePayload, CreatePodcastPackOfferUseCaseSuccess, CreatePodcastPackOfferUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const input = createPayloadSchema.parse(req.body);

    const result = await this.createPodcastPackOfferUseCase.execute({
      ...input,
      description: input.description || undefined,
      metadata: input.metadata || undefined,
    });

    if (result.isSuccess()) {
      res.status(201).send({
        success: true,
        data: result.value.packOffer,
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
