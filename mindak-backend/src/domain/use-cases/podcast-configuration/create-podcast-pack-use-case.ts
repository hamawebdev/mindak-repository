import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import type { PodcastPackOffer, CreatePodcastPackOfferInput } from '@/domain/models/podcast-pack-offer';

export type CreatePodcastPackOfferUseCasePayload = CreatePodcastPackOfferInput;

export type CreatePodcastPackOfferUseCaseSuccess = {
  packOffer: PodcastPackOffer;
};

export type CreatePodcastPackOfferUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreatePodcastPackOfferUseCase implements IUseCase<CreatePodcastPackOfferUseCasePayload, CreatePodcastPackOfferUseCaseSuccess, CreatePodcastPackOfferUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastPackOfferRepository) private readonly podcastPackOfferRepository: PodcastPackOfferRepository,
  ) {}

  async execute(payload: CreatePodcastPackOfferUseCasePayload) {
    try {
      const packOffer = await this.podcastPackOfferRepository.create(payload);
      return new Success<CreatePodcastPackOfferUseCaseSuccess>({ packOffer });
    } catch (error) {
      return new Failure<CreatePodcastPackOfferUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
