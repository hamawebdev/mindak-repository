import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { FormQuestion, SectionType } from '@/domain/models/form-question';
import type { FormQuestionAnswer } from '@/domain/models/form-question-answer';

export type GetServicesQuestionsUseCasePayload = {
  section?: SectionType;
  serviceId?: string;
  includeInactive?: boolean;
};

export type GetServicesQuestionsUseCaseSuccess = {
  questions: Array<FormQuestion & { answers: FormQuestionAnswer[] }>;
};

export type GetServicesQuestionsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetServicesQuestionsUseCase implements IUseCase<GetServicesQuestionsUseCasePayload, GetServicesQuestionsUseCaseSuccess, GetServicesQuestionsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
  ) {}

  async execute(payload: GetServicesQuestionsUseCasePayload) {
    try {
      let questions: FormQuestion[];

      if (payload.section) {
        // Get questions for specific section
        questions = payload.includeInactive
          ? await this.formQuestionRepository.findByFormTypeAndSection('services', payload.section, payload.serviceId)
          : await this.formQuestionRepository.findActiveByFormTypeAndSection('services', payload.section, payload.serviceId);
      } else {
        // Get all services questions
        questions = payload.includeInactive
          ? await this.formQuestionRepository.findByFormType('services')
          : await this.formQuestionRepository.findActiveByFormType('services');
      }

      // Get all answers for these questions
      const questionIds = questions.map(q => q.id);
      const allAnswers = await this.formQuestionAnswerRepository.findByQuestionIds(questionIds);

      // Group answers by question ID
      const answersByQuestionId = allAnswers.reduce((acc, answer) => {
        if (!acc[answer.questionId]) {
          acc[answer.questionId] = [];
        }
        acc[answer.questionId].push(answer);
        return acc;
      }, {} as Record<string, FormQuestionAnswer[]>);

      // Combine questions with their answers
      const questionsWithAnswers = questions.map(question => ({
        ...question,
        answers: answersByQuestionId[question.id] || [],
      }));

      return new Success({ questions: questionsWithAnswers });
    } catch (error) {
      return new Failure<GetServicesQuestionsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

