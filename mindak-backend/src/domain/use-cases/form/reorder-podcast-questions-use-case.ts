import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';

export type ReorderPodcastQuestionsUseCasePayload = {
  questions: Array<{ id: string; order: number }>;
};

export type ReorderPodcastQuestionsUseCaseSuccess = {
  success: true;
};

export type ReorderPodcastQuestionsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class ReorderPodcastQuestionsUseCase implements IUseCase<ReorderPodcastQuestionsUseCasePayload, ReorderPodcastQuestionsUseCaseSuccess, ReorderPodcastQuestionsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
  ) {}

  async execute(payload: ReorderPodcastQuestionsUseCasePayload) {
    try {
      await this.formQuestionRepository.bulkUpdateOrder(payload.questions);

      return new Success<ReorderPodcastQuestionsUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<ReorderPodcastQuestionsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

