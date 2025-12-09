import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';

export type DeleteServicesQuestionUseCasePayload = {
  id: string;
};

export type DeleteServicesQuestionUseCaseSuccess = {
  success: true;
};

export type DeleteServicesQuestionUseCaseFailure = {
  reason: 'QuestionNotFound' | 'UnknownError';
  error: Error;
};

@injectable()
export class DeleteServicesQuestionUseCase implements IUseCase<DeleteServicesQuestionUseCasePayload, DeleteServicesQuestionUseCaseSuccess, DeleteServicesQuestionUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
  ) {}

  async execute(payload: DeleteServicesQuestionUseCasePayload) {
    try {
      const existingQuestion = await this.formQuestionRepository.findById(payload.id);
      if (!existingQuestion) {
        return new Failure<DeleteServicesQuestionUseCaseFailure>({
          reason: 'QuestionNotFound',
          error: new Error('Question not found'),
        });
      }

      await this.formQuestionRepository.delete(payload.id);

      return new Success<DeleteServicesQuestionUseCaseSuccess>({ success: true });
    } catch (error) {
      return new Failure<DeleteServicesQuestionUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

