import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { FormQuestion, type QuestionType } from '@/domain/models/form-question';

export type CreatePodcastQuestionUseCasePayload = {
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  order: number;
  placeholder?: string | null;
  helpText?: string | null;
  validationRules?: Record<string, unknown> | null;
  isActive: boolean;
};

export type CreatePodcastQuestionUseCaseSuccess = {
  question: FormQuestion;
};

export type CreatePodcastQuestionUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class CreatePodcastQuestionUseCase implements IUseCase<CreatePodcastQuestionUseCasePayload, CreatePodcastQuestionUseCaseSuccess, CreatePodcastQuestionUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: CreatePodcastQuestionUseCasePayload) {
    try {
      const question = new FormQuestion({
        id: this.idGenerator.generate(),
        formType: 'podcast',
        sectionType: 'general',
        serviceId: null,
        questionText: payload.questionText,
        questionType: payload.questionType,
        required: payload.required,
        order: payload.order,
        placeholder: payload.placeholder ?? null,
        helpText: payload.helpText ?? null,
        validationRules: payload.validationRules ?? null,
        isActive: payload.isActive,
        createdAt: this.time.now(),
        updatedAt: this.time.now(),
      });

      const createdQuestion = await this.formQuestionRepository.create(question);

      return new Success({ question: createdQuestion });
    } catch (error) {
      return new Failure<CreatePodcastQuestionUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

