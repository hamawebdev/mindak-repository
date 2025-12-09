import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { FormQuestionAnswer } from '@/domain/models/form-question-answer';

export type GetQuestionAnswersUseCasePayload = {
  questionId: string;
  includeInactive?: boolean;
};

export type GetQuestionAnswersUseCaseSuccess = {
  answers: FormQuestionAnswer[];
};

export type GetQuestionAnswersUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetQuestionAnswersUseCase implements IUseCase<GetQuestionAnswersUseCasePayload, GetQuestionAnswersUseCaseSuccess, GetQuestionAnswersUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
  ) {}

  async execute(payload: GetQuestionAnswersUseCasePayload) {
    try {
      const answers = payload.includeInactive
        ? await this.formQuestionAnswerRepository.findByQuestionId(payload.questionId)
        : await this.formQuestionAnswerRepository.findActiveByQuestionId(payload.questionId);

      return new Success({ answers });
    } catch (error) {
      return new Failure<GetQuestionAnswersUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

