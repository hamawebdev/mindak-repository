import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import type { PodcastPackOffer, UpdatePodcastPackOfferInput } from '@/domain/models/podcast-pack-offer';

export type UpdatePodcastPackOfferUseCasePayload = {
  id: string;
  input: UpdatePodcastPackOfferInput;
};

export type UpdatePodcastPackOfferUseCaseSuccess = {
  packOffer: PodcastPackOffer;
};

export type UpdatePodcastPackOfferUseCaseFailure = {
  reason: 'PackNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdatePodcastPackOfferUseCase implements IUseCase<UpdatePodcastPackOfferUseCasePayload, UpdatePodcastPackOfferUseCaseSuccess, UpdatePodcastPackOfferUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastPackOfferRepository) private readonly podcastPackOfferRepository: PodcastPackOfferRepository,
  ) {}

  async execute(payload: UpdatePodcastPackOfferUseCasePayload) {
    try {
      const existing = await this.podcastPackOfferRepository.findById(payload.id);
      if (!existing) {
        return new Failure<UpdatePodcastPackOfferUseCaseFailure>({
          reason: 'PackNotFound',
          error: new Error('Pack offer not found'),
        });
      }

      const packOffer = await this.podcastPackOfferRepository.update(payload.id, payload.input);

      if (!packOffer) {
        return new Failure<UpdatePodcastPackOfferUseCaseFailure>({
          reason: 'PackNotFound',
          error: new Error('Pack offer not found after update check'),
        });
      }

      return new Success<UpdatePodcastPackOfferUseCaseSuccess>({ packOffer });
    } catch (error) {
      return new Failure<UpdatePodcastPackOfferUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
