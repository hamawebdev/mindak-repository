import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastDecorRepository } from '@/domain/repositories/podcast-decor-repository.interface';
import type { PodcastDecor, CreatePodcastDecorInput } from '@/domain/models/podcast-decor';

export type CreatePodcastDecorUseCasePayload = CreatePodcastDecorInput;

export type CreatePodcastDecorUseCaseSuccess = {
  decor: PodcastDecor;
};

export type CreatePodcastDecorUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreatePodcastDecorUseCase implements IUseCase<CreatePodcastDecorUseCasePayload, CreatePodcastDecorUseCaseSuccess, CreatePodcastDecorUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastDecorRepository) private readonly podcastDecorRepository: PodcastDecorRepository,
  ) {}

  async execute(payload: CreatePodcastDecorUseCasePayload) {
    try {
      const decor = await this.podcastDecorRepository.create(payload);
      return new Success<CreatePodcastDecorUseCaseSuccess>({ decor });
    } catch (error) {
      return new Failure<CreatePodcastDecorUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
