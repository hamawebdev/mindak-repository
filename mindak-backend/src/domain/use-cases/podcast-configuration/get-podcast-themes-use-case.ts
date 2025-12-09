import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';
import type { PodcastTheme } from '@/domain/models/podcast-theme';

export type GetPodcastThemesUseCasePayload = {
  activeOnly?: boolean;
};

export type GetPodcastThemesUseCaseSuccess = {
  themes: PodcastTheme[];
};

export type GetPodcastThemesUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetPodcastThemesUseCase implements IUseCase<GetPodcastThemesUseCasePayload, GetPodcastThemesUseCaseSuccess, GetPodcastThemesUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastThemeRepository) private readonly podcastThemeRepository: IPodcastThemeRepository,
  ) {}

  async execute(payload: GetPodcastThemesUseCasePayload) {
    try {
      const themes = await this.podcastThemeRepository.findAll(payload.activeOnly);
      return new Success<GetPodcastThemesUseCaseSuccess>({ themes });
    } catch (error) {
      return new Failure<GetPodcastThemesUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
