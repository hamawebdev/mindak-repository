import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import type { PodcastSupplementService, CreatePodcastSupplementServiceInput } from '@/domain/models/podcast-supplement-service';

export type CreatePodcastSupplementUseCasePayload = CreatePodcastSupplementServiceInput;

export type CreatePodcastSupplementUseCaseSuccess = {
  supplement: PodcastSupplementService;
};

export type CreatePodcastSupplementUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreatePodcastSupplementUseCase implements IUseCase<CreatePodcastSupplementUseCasePayload, CreatePodcastSupplementUseCaseSuccess, CreatePodcastSupplementUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastSupplementServiceRepository) private readonly podcastSupplementRepository: PodcastSupplementServiceRepository,
  ) {}

  async execute(payload: CreatePodcastSupplementUseCasePayload) {
    try {
      const supplement = await this.podcastSupplementRepository.create(payload);
      return new Success<CreatePodcastSupplementUseCaseSuccess>({ supplement });
    } catch (error) {
      return new Failure<CreatePodcastSupplementUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
