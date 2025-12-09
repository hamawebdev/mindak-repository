import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';

export type DeletePodcastQuestionUseCasePayload = {
  id: string;
};

export type DeletePodcastQuestionUseCaseSuccess = {
  success: true;
};

export type DeletePodcastQuestionUseCaseFailure = {
  reason: 'QuestionNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeletePodcastQuestionUseCase implements IUseCase<DeletePodcastQuestionUseCasePayload, DeletePodcastQuestionUseCaseSuccess, DeletePodcastQuestionUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
  ) {}

  async execute(payload: DeletePodcastQuestionUseCasePayload) {
    try {
      const existingQuestion = await this.formQuestionRepository.findById(payload.id);
      if (!existingQuestion) {
        return new Failure<DeletePodcastQuestionUseCaseFailure>({
          reason: 'QuestionNotFound',
          error: new Error('Question not found'),
        });
      }

      await this.formQuestionRepository.delete(payload.id);

      return new Success<DeletePodcastQuestionUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeletePodcastQuestionUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

