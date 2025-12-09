import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';
import type { PodcastTheme, UpdatePodcastThemeInput } from '@/domain/models/podcast-theme';

export type UpdatePodcastThemeUseCasePayload = {
  id: string;
  input: UpdatePodcastThemeInput;
};

export type UpdatePodcastThemeUseCaseSuccess = {
  theme: PodcastTheme;
};

export type UpdatePodcastThemeUseCaseFailure = {
  reason: 'NotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdatePodcastThemeUseCase implements IUseCase<UpdatePodcastThemeUseCasePayload, UpdatePodcastThemeUseCaseSuccess, UpdatePodcastThemeUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastThemeRepository) private readonly podcastThemeRepository: IPodcastThemeRepository,
  ) {}

  async execute(payload: UpdatePodcastThemeUseCasePayload) {
    try {
      const theme = await this.podcastThemeRepository.update(payload.id, payload.input);

      if (!theme) {
        return new Failure<UpdatePodcastThemeUseCaseFailure>({
          reason: 'NotFound',
          error: new Error(`Theme with id ${payload.id} not found`),
        });
      }

      return new Success<UpdatePodcastThemeUseCaseSuccess>({ theme });
    } catch (error) {
      return new Failure<UpdatePodcastThemeUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
