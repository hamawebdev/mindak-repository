import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';

export type DeletePodcastPackOfferUseCasePayload = {
  id: string;
};

export type DeletePodcastPackOfferUseCaseSuccess = {
  success: true;
};

export type DeletePodcastPackOfferUseCaseFailure = {
  reason: 'PackNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastPackOfferUseCase implements IUseCase<DeletePodcastPackOfferUseCasePayload, DeletePodcastPackOfferUseCaseSuccess, DeletePodcastPackOfferUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastPackOfferRepository) private readonly podcastPackOfferRepository: PodcastPackOfferRepository,
  ) {}

  async execute(payload: DeletePodcastPackOfferUseCasePayload) {
    try {
      const existing = await this.podcastPackOfferRepository.findById(payload.id);
      if (!existing) {
        return new Failure<DeletePodcastPackOfferUseCaseFailure>({
          reason: 'PackNotFound',
          error: new Error('Pack offer not found'),
        });
      }

      await this.podcastPackOfferRepository.delete(payload.id);
      return new Success<DeletePodcastPackOfferUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeletePodcastPackOfferUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
