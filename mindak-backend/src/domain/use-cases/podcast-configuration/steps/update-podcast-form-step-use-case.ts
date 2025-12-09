import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastFormStepRepository } from '@/domain/repositories/podcast-form-step-repository.interface';
import type { PodcastFormStep, UpdatePodcastFormStepInput } from '@/domain/models/podcast-form-step';

export type UpdatePodcastFormStepUseCasePayload = {
  id: string;
  input: UpdatePodcastFormStepInput;
};

export type UpdatePodcastFormStepUseCaseSuccess = {
  step: PodcastFormStep;
};

export type UpdatePodcastFormStepUseCaseFailure = {
  reason: 'StepNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdatePodcastFormStepUseCase implements IUseCase<UpdatePodcastFormStepUseCasePayload, UpdatePodcastFormStepUseCaseSuccess, UpdatePodcastFormStepUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastFormStepRepository) private readonly podcastFormStepRepository: PodcastFormStepRepository,
  ) {}

  async execute(payload: UpdatePodcastFormStepUseCasePayload) {
    try {
      const existing = await this.podcastFormStepRepository.findById(payload.id);
      if (!existing) {
        return new Failure<UpdatePodcastFormStepUseCaseFailure>({
          reason: 'StepNotFound',
          error: new Error('Step not found'),
        });
      }

      const step = await this.podcastFormStepRepository.update(payload.id, payload.input);

      if (!step) {
        return new Failure<UpdatePodcastFormStepUseCaseFailure>({
          reason: 'StepNotFound',
          error: new Error('Step not found after update check'),
        });
      }

      return new Success<UpdatePodcastFormStepUseCaseSuccess>({ step });
    } catch (error) {
      return new Failure<UpdatePodcastFormStepUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
