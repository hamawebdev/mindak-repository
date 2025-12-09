import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastDecorRepository } from '@/domain/repositories/podcast-decor-repository.interface';

export type DeletePodcastDecorUseCasePayload = {
  id: string;
};

export type DeletePodcastDecorUseCaseSuccess = {
  success: true;
};

export type DeletePodcastDecorUseCaseFailure = {
  reason: 'DecorNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastDecorUseCase implements IUseCase<DeletePodcastDecorUseCasePayload, DeletePodcastDecorUseCaseSuccess, DeletePodcastDecorUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastDecorRepository) private readonly podcastDecorRepository: PodcastDecorRepository,
  ) {}

  async execute(payload: DeletePodcastDecorUseCasePayload) {
    try {
      const existing = await this.podcastDecorRepository.findById(payload.id);
      if (!existing) {
        return new Failure<DeletePodcastDecorUseCaseFailure>({
          reason: 'DecorNotFound',
          error: new Error('Decor not found'),
        });
      }

      await this.podcastDecorRepository.delete(payload.id);
      return new Success<DeletePodcastDecorUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeletePodcastDecorUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
