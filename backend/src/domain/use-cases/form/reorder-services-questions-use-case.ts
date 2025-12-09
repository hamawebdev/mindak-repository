import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';

export type ReorderServicesQuestionsUseCasePayload = {
  questions: Array<{ id: string; order: number }>;
};

export type ReorderServicesQuestionsUseCaseSuccess = {
  success: true;
};

export type ReorderServicesQuestionsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class ReorderServicesQuestionsUseCase implements IUseCase<ReorderServicesQuestionsUseCasePayload, ReorderServicesQuestionsUseCaseSuccess, ReorderServicesQuestionsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
  ) {}

  async execute(payload: ReorderServicesQuestionsUseCasePayload) {
    try {
      await this.formQuestionRepository.bulkUpdateOrder(payload.questions);

      return new Success<ReorderServicesQuestionsUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<ReorderServicesQuestionsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

