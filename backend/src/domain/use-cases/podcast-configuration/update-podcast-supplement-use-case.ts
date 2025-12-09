import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import type { PodcastSupplementService, UpdatePodcastSupplementServiceInput } from '@/domain/models/podcast-supplement-service';

export type UpdatePodcastSupplementUseCasePayload = {
  id: string;
  input: UpdatePodcastSupplementServiceInput;
};

export type UpdatePodcastSupplementUseCaseSuccess = {
  supplement: PodcastSupplementService;
};

export type UpdatePodcastSupplementUseCaseFailure = {
  reason: 'SupplementNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdatePodcastSupplementUseCase implements IUseCase<UpdatePodcastSupplementUseCasePayload, UpdatePodcastSupplementUseCaseSuccess, UpdatePodcastSupplementUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastSupplementServiceRepository) private readonly podcastSupplementRepository: PodcastSupplementServiceRepository,
  ) {}

  async execute(payload: UpdatePodcastSupplementUseCasePayload) {
    try {
      const existing = await this.podcastSupplementRepository.findById(payload.id);
      if (!existing) {
        return new Failure<UpdatePodcastSupplementUseCaseFailure>({
          reason: 'SupplementNotFound',
          error: new Error('Supplement not found'),
        });
      }

      const supplement = await this.podcastSupplementRepository.update(payload.id, payload.input);

      if (!supplement) {
        return new Failure<UpdatePodcastSupplementUseCaseFailure>({
          reason: 'SupplementNotFound',
          error: new Error('Supplement not found after update check'),
        });
      }

      return new Success<UpdatePodcastSupplementUseCaseSuccess>({ supplement });
    } catch (error) {
      return new Failure<UpdatePodcastSupplementUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
