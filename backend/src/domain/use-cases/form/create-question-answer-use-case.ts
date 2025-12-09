import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { FormQuestionAnswer, type AnswerMetadata } from '@/domain/models/form-question-answer';

export type CreateQuestionAnswerUseCasePayload = {
  questionId: string;
  answerText: string;
  answerValue?: string | null;
  answerMetadata?: AnswerMetadata | null;
  order: number;
  isActive: boolean;
};

export type CreateQuestionAnswerUseCaseSuccess = {
  answer: FormQuestionAnswer;
};

export type CreateQuestionAnswerUseCaseFailure = {
  reason: 'QuestionNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class CreateQuestionAnswerUseCase implements IUseCase<CreateQuestionAnswerUseCasePayload, CreateQuestionAnswerUseCaseSuccess, CreateQuestionAnswerUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: CreateQuestionAnswerUseCasePayload) {
    try {
      // Verify question exists
      const question = await this.formQuestionRepository.findById(payload.questionId);
      if (!question) {
        return new Failure<CreateQuestionAnswerUseCaseFailure>({
          reason: 'QuestionNotFound',
          error: new Error('Question not found'),
        });
      }

      const answer = new FormQuestionAnswer({
        id: this.idGenerator.generate(),
        questionId: payload.questionId,
        answerText: payload.answerText,
        answerValue: payload.answerValue ?? null,
        answerMetadata: payload.answerMetadata ?? null,
        order: payload.order,
        isActive: payload.isActive,
        createdAt: this.time.now(),
        updatedAt: this.time.now(),
      });

      const createdAnswer = await this.formQuestionAnswerRepository.create(answer);

      return new Success({ answer: createdAnswer });
    } catch (error) {
      return new Failure<CreateQuestionAnswerUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

