import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { FormQuestionAnswer, AnswerMetadata } from '@/domain/models/form-question-answer';

export type UpdateQuestionAnswerUseCasePayload = {
  id: string;
  answerText?: string;
  answerValue?: string | null;
  answerMetadata?: AnswerMetadata | null;
  order?: number;
  isActive?: boolean;
};

export type UpdateQuestionAnswerUseCaseSuccess = {
  answer: FormQuestionAnswer;
};

export type UpdateQuestionAnswerUseCaseFailure = {
  reason: 'AnswerNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class UpdateQuestionAnswerUseCase implements IUseCase<UpdateQuestionAnswerUseCasePayload, UpdateQuestionAnswerUseCaseSuccess, UpdateQuestionAnswerUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
  ) {}

  async execute(payload: UpdateQuestionAnswerUseCasePayload) {
    try {
      const existingAnswer = await this.formQuestionAnswerRepository.findById(payload.id);
      if (!existingAnswer) {
        return new Failure<UpdateQuestionAnswerUseCaseFailure>({
          reason: 'AnswerNotFound',
          error: new Error('Answer not found'),
        });
      }

      const updatedAnswer = await this.formQuestionAnswerRepository.update(payload.id, {
        answerText: payload.answerText,
        answerValue: payload.answerValue,
        answerMetadata: payload.answerMetadata,
        order: payload.order,
        isActive: payload.isActive,
      });

      return new Success({ answer: updatedAnswer });
    } catch (error) {
      return new Failure<UpdateQuestionAnswerUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

