import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';

export type DeleteQuestionAnswerUseCasePayload = {
  id: string;
};

export type DeleteQuestionAnswerUseCaseSuccess = {
  success: true;
};

export type DeleteQuestionAnswerUseCaseFailure = {
  reason: 'AnswerNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeleteQuestionAnswerUseCase implements IUseCase<DeleteQuestionAnswerUseCasePayload, DeleteQuestionAnswerUseCaseSuccess, DeleteQuestionAnswerUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
  ) {}

  async execute(payload: DeleteQuestionAnswerUseCasePayload) {
    try {
      const existingAnswer = await this.formQuestionAnswerRepository.findById(payload.id);
      if (!existingAnswer) {
        return new Failure<DeleteQuestionAnswerUseCaseFailure>({
          reason: 'AnswerNotFound',
          error: new Error('Answer not found'),
        });
      }

      await this.formQuestionAnswerRepository.delete(payload.id);

      return new Success<DeleteQuestionAnswerUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeleteQuestionAnswerUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

