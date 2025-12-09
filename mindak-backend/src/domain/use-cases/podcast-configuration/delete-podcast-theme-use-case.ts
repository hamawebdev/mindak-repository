import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';

export type DeletePodcastThemeUseCasePayload = {
  id: string;
};

export type DeletePodcastThemeUseCaseSuccess = {
  deleted: boolean;
};

export type DeletePodcastThemeUseCaseFailure = {
  reason: 'NotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastThemeUseCase implements IUseCase<DeletePodcastThemeUseCasePayload, DeletePodcastThemeUseCaseSuccess, DeletePodcastThemeUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastThemeRepository) private readonly podcastThemeRepository: IPodcastThemeRepository,
  ) {}

  async execute(payload: DeletePodcastThemeUseCasePayload) {
    try {
      const deleted = await this.podcastThemeRepository.delete(payload.id);

      if (!deleted) {
        return new Failure<DeletePodcastThemeUseCaseFailure>({
          reason: 'NotFound',
          error: new Error(`Theme with id ${payload.id} not found`),
        });
      }

      return new Success<DeletePodcastThemeUseCaseSuccess>({ deleted });
    } catch (error) {
      return new Failure<DeletePodcastThemeUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
