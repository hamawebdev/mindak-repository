import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';

export type ReorderQuestionAnswersUseCasePayload = {
  answers: Array<{ id: string; order: number }>;
};

export type ReorderQuestionAnswersUseCaseSuccess = {
  success: true;
};

export type ReorderQuestionAnswersUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class ReorderQuestionAnswersUseCase implements IUseCase<ReorderQuestionAnswersUseCasePayload, ReorderQuestionAnswersUseCaseSuccess, ReorderQuestionAnswersUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
  ) {}

  async execute(payload: ReorderQuestionAnswersUseCasePayload) {
    try {
      await this.formQuestionAnswerRepository.bulkUpdateOrder(payload.answers);

      return new Success<ReorderQuestionAnswersUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<ReorderQuestionAnswersUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

