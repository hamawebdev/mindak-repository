import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastFormQuestionRepository } from '@/domain/repositories/podcast-form-question-repository.interface';
import type { PodcastFormQuestion, CreatePodcastFormQuestionInput } from '@/domain/models/podcast-form-question';

export type CreatePodcastFormQuestionUseCasePayload = CreatePodcastFormQuestionInput;

export type CreatePodcastFormQuestionUseCaseSuccess = {
  question: PodcastFormQuestion;
};

export type CreatePodcastFormQuestionUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreatePodcastFormQuestionUseCase implements IUseCase<CreatePodcastFormQuestionUseCasePayload, CreatePodcastFormQuestionUseCaseSuccess, CreatePodcastFormQuestionUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastFormQuestionRepository) private readonly podcastFormQuestionRepository: PodcastFormQuestionRepository,
  ) {}

  async execute(payload: CreatePodcastFormQuestionUseCasePayload) {
    try {
      const question = await this.podcastFormQuestionRepository.create(payload);
      return new Success<CreatePodcastFormQuestionUseCaseSuccess>({ question });
    } catch (error) {
      return new Failure<CreatePodcastFormQuestionUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
