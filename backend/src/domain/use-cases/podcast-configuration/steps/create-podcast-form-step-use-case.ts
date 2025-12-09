import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastFormStepRepository } from '@/domain/repositories/podcast-form-step-repository.interface';
import type { PodcastFormStep, CreatePodcastFormStepInput } from '@/domain/models/podcast-form-step';

export type CreatePodcastFormStepUseCasePayload = CreatePodcastFormStepInput;

export type CreatePodcastFormStepUseCaseSuccess = {
  step: PodcastFormStep;
};

export type CreatePodcastFormStepUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreatePodcastFormStepUseCase implements IUseCase<CreatePodcastFormStepUseCasePayload, CreatePodcastFormStepUseCaseSuccess, CreatePodcastFormStepUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastFormStepRepository) private readonly podcastFormStepRepository: PodcastFormStepRepository,
  ) {}

  async execute(payload: CreatePodcastFormStepUseCasePayload) {
    try {
      const step = await this.podcastFormStepRepository.create(payload);
      return new Success<CreatePodcastFormStepUseCaseSuccess>({ step });
    } catch (error) {
      return new Failure<CreatePodcastFormStepUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
