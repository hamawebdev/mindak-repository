import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { FormQuestion, QuestionType } from '@/domain/models/form-question';

export type UpdatePodcastQuestionUseCasePayload = {
  id: string;
  questionText?: string;
  questionType?: QuestionType;
  required?: boolean;
  order?: number;
  placeholder?: string | null;
  helpText?: string | null;
  validationRules?: Record<string, unknown> | null;
  isActive?: boolean;
};

export type UpdatePodcastQuestionUseCaseSuccess = {
  question: FormQuestion;
};

export type UpdatePodcastQuestionUseCaseFailure = {
  reason: 'QuestionNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdatePodcastQuestionUseCase implements IUseCase<UpdatePodcastQuestionUseCasePayload, UpdatePodcastQuestionUseCaseSuccess, UpdatePodcastQuestionUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
  ) {}

  async execute(payload: UpdatePodcastQuestionUseCasePayload) {
    try {
      const existingQuestion = await this.formQuestionRepository.findById(payload.id);
      if (!existingQuestion) {
        return new Failure<UpdatePodcastQuestionUseCaseFailure>({
          reason: 'QuestionNotFound',
          error: new Error('Question not found'),
        });
      }

      const updatedQuestion = await this.formQuestionRepository.update(payload.id, {
        questionText: payload.questionText,
        questionType: payload.questionType,
        required: payload.required,
        order: payload.order,
        placeholder: payload.placeholder,
        helpText: payload.helpText,
        validationRules: payload.validationRules,
        isActive: payload.isActive,
      });

      return new Success({ question: updatedQuestion });
    } catch (error) {
      return new Failure<UpdatePodcastQuestionUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

