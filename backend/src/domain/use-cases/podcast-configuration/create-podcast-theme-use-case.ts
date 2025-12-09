import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';
import type { PodcastTheme, CreatePodcastThemeInput } from '@/domain/models/podcast-theme';

export type CreatePodcastThemeUseCasePayload = CreatePodcastThemeInput;

export type CreatePodcastThemeUseCaseSuccess = {
  theme: PodcastTheme;
};

export type CreatePodcastThemeUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreatePodcastThemeUseCase implements IUseCase<CreatePodcastThemeUseCasePayload, CreatePodcastThemeUseCaseSuccess, CreatePodcastThemeUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastThemeRepository) private readonly podcastThemeRepository: IPodcastThemeRepository,
  ) {}

  async execute(payload: CreatePodcastThemeUseCasePayload) {
    try {
      const theme = await this.podcastThemeRepository.create(payload);
      return new Success<CreatePodcastThemeUseCaseSuccess>({ theme });
    } catch (error) {
      return new Failure<CreatePodcastThemeUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
