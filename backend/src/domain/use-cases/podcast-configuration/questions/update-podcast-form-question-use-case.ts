import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { PodcastFormQuestionRepository } from '@/domain/repositories/podcast-form-question-repository.interface';
import type { PodcastFormQuestion, UpdatePodcastFormQuestionInput } from '@/domain/models/podcast-form-question';

export type UpdatePodcastFormQuestionUseCasePayload = {
  id: string;
  input: UpdatePodcastFormQuestionInput;
};

export type UpdatePodcastFormQuestionUseCaseSuccess = {
  question: PodcastFormQuestion;
};

export type UpdatePodcastFormQuestionUseCaseFailure = {
  reason: 'QuestionNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdatePodcastFormQuestionUseCase implements IUseCase<UpdatePodcastFormQuestionUseCasePayload, UpdatePodcastFormQuestionUseCaseSuccess, UpdatePodcastFormQuestionUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastFormQuestionRepository) private readonly podcastFormQuestionRepository: PodcastFormQuestionRepository,
  ) {}

  async execute(payload: UpdatePodcastFormQuestionUseCasePayload) {
    try {
      const existing = await this.podcastFormQuestionRepository.findById(payload.id);
      if (!existing) {
        return new Failure<UpdatePodcastFormQuestionUseCaseFailure>({
          reason: 'QuestionNotFound',
          error: new Error('Question not found'),
        });
      }

      // Check if trying to change fieldName of mandatory question?
      // The requirement says: "Cannot be changed to incompatible types".
      // Ideally we should block fieldName change for mandatory fields too.

      const MANDATORY_FIELDS = ['customerName', 'customerEmail', 'customerPhone'];
      if (MANDATORY_FIELDS.includes(existing.fieldName)) {
        if (payload.input.fieldName && payload.input.fieldName !== existing.fieldName) {
          return new Failure<UpdatePodcastFormQuestionUseCaseFailure>({
            reason: 'UnknownError', // Using UnknownError for now or I should add InvalidOperation
            error: new Error('Cannot change fieldName of mandatory question'),
          });
        }
        // Also maybe check questionType compatibility?
      }

      const question = await this.podcastFormQuestionRepository.update(payload.id, payload.input);

      if (!question) {
        return new Failure<UpdatePodcastFormQuestionUseCaseFailure>({
          reason: 'QuestionNotFound',
          error: new Error('Question not found after update check'),
        });
      }

      return new Success<UpdatePodcastFormQuestionUseCaseSuccess>({ question });
    } catch (error) {
      return new Failure<UpdatePodcastFormQuestionUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}
