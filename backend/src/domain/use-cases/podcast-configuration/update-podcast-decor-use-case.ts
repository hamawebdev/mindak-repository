import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastDecorRepository } from '@/domain/repositories/podcast-decor-repository.interface';
import type { PodcastDecor, UpdatePodcastDecorInput } from '@/domain/models/podcast-decor';

export type UpdatePodcastDecorUseCasePayload = {
  id: string;
  input: UpdatePodcastDecorInput;
};

export type UpdatePodcastDecorUseCaseSuccess = {
  decor: PodcastDecor;
};

export type UpdatePodcastDecorUseCaseFailure = {
  reason: 'DecorNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdatePodcastDecorUseCase implements IUseCase<UpdatePodcastDecorUseCasePayload, UpdatePodcastDecorUseCaseSuccess, UpdatePodcastDecorUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastDecorRepository) private readonly podcastDecorRepository: PodcastDecorRepository,
  ) {}

  async execute(payload: UpdatePodcastDecorUseCasePayload) {
    try {
      const existing = await this.podcastDecorRepository.findById(payload.id);
      if (!existing) {
        return new Failure<UpdatePodcastDecorUseCaseFailure>({
          reason: 'DecorNotFound',
          error: new Error('Decor not found'),
        });
      }

      const decor = await this.podcastDecorRepository.update(payload.id, payload.input);

      if (!decor) {
        return new Failure<UpdatePodcastDecorUseCaseFailure>({
          reason: 'DecorNotFound',
          error: new Error('Decor not found after update check'),
        });
      }

      return new Success<UpdatePodcastDecorUseCaseSuccess>({ decor });
    } catch (error) {
      return new Failure<UpdatePodcastDecorUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
