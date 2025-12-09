import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';

export type DeletePodcastSupplementUseCasePayload = {
  id: string;
};

export type DeletePodcastSupplementUseCaseSuccess = {
  success: true;
};

export type DeletePodcastSupplementUseCaseFailure = {
  reason: 'SupplementNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastSupplementUseCase implements IUseCase<DeletePodcastSupplementUseCasePayload, DeletePodcastSupplementUseCaseSuccess, DeletePodcastSupplementUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastSupplementServiceRepository) private readonly podcastSupplementRepository: PodcastSupplementServiceRepository,
  ) {}

  async execute(payload: DeletePodcastSupplementUseCasePayload) {
    try {
      const existing = await this.podcastSupplementRepository.findById(payload.id);
      if (!existing) {
        return new Failure<DeletePodcastSupplementUseCaseFailure>({
          reason: 'SupplementNotFound',
          error: new Error('Supplement not found'),
        });
      }

      await this.podcastSupplementRepository.delete(payload.id);
      return new Success<DeletePodcastSupplementUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeletePodcastSupplementUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
