import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastFormQuestionRepository } from '@/domain/repositories/podcast-form-question-repository.interface';

export type DeletePodcastFormQuestionUseCasePayload = {
  id: string;
};

export type DeletePodcastFormQuestionUseCaseSuccess = {
  success: true;
};

export type DeletePodcastFormQuestionUseCaseFailure = {
  reason: 'QuestionNotFound' | 'MandatoryQuestion' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastFormQuestionUseCase implements IUseCase<DeletePodcastFormQuestionUseCasePayload, DeletePodcastFormQuestionUseCaseSuccess, DeletePodcastFormQuestionUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastFormQuestionRepository) private readonly podcastFormQuestionRepository: PodcastFormQuestionRepository,
  ) {}

  async execute(payload: DeletePodcastFormQuestionUseCasePayload) {
    try {
      const existing = await this.podcastFormQuestionRepository.findById(payload.id);
      if (!existing) {
        return new Failure<DeletePodcastFormQuestionUseCaseFailure>({
          reason: 'QuestionNotFound',
          error: new Error('Question not found'),
        });
      }

      const MANDATORY_FIELDS = ['customerName', 'customerEmail', 'customerPhone'];
      if (MANDATORY_FIELDS.includes(existing.fieldName)) {
        return new Failure<DeletePodcastFormQuestionUseCaseFailure>({
          reason: 'MandatoryQuestion',
          error: new Error(`Cannot delete mandatory system question: ${existing.fieldName}`),
        });
      }

      await this.podcastFormQuestionRepository.delete(payload.id);
      return new Success<DeletePodcastFormQuestionUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeletePodcastFormQuestionUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
