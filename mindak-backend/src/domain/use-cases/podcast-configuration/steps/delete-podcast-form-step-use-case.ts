import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastFormStepRepository } from '@/domain/repositories/podcast-form-step-repository.interface';

export type DeletePodcastFormStepUseCasePayload = {
  id: string;
};

export type DeletePodcastFormStepUseCaseSuccess = {
  success: true;
};

export type DeletePodcastFormStepUseCaseFailure = {
  reason: 'StepNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastFormStepUseCase implements IUseCase<DeletePodcastFormStepUseCasePayload, DeletePodcastFormStepUseCaseSuccess, DeletePodcastFormStepUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastFormStepRepository) private readonly podcastFormStepRepository: PodcastFormStepRepository,
  ) {}

  async execute(payload: DeletePodcastFormStepUseCasePayload) {
    try {
      const existing = await this.podcastFormStepRepository.findById(payload.id);
      if (!existing) {
        return new Failure<DeletePodcastFormStepUseCaseFailure>({
          reason: 'StepNotFound',
          error: new Error('Step not found'),
        });
      }

      await this.podcastFormStepRepository.delete(payload.id);
      return new Success<DeletePodcastFormStepUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeletePodcastFormStepUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
