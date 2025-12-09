import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { FormQuestion } from '@/domain/models/form-question';
import type { FormQuestionAnswer } from '@/domain/models/form-question-answer';

export type GetClientPodcastQuestionsUseCasePayload = Record<string, never>;

export type GetClientPodcastQuestionsUseCaseSuccess = {
  questions: Array<FormQuestion & { answers: FormQuestionAnswer[] }>;
};

export type GetClientPodcastQuestionsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetClientPodcastQuestionsUseCase implements IUseCase<GetClientPodcastQuestionsUseCasePayload, GetClientPodcastQuestionsUseCaseSuccess, GetClientPodcastQuestionsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
  ) {}

  async execute(_payload: GetClientPodcastQuestionsUseCasePayload) {
    try {
      // Get only active questions for clients
      const questions = await this.formQuestionRepository.findActiveByFormType('podcast');

      // Get all active answers for these questions
      const questionIds = questions.map(q => q.id);
      const allAnswers = questionIds.length > 0
        ? await this.formQuestionAnswerRepository.findByQuestionIds(questionIds)
        : [];

      // Filter to only active answers
      const activeAnswers = allAnswers.filter(a => a.isActive);

      // Group answers by question ID
      const answersByQuestionId = activeAnswers.reduce((acc, answer) => {
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
      return new Failure<GetClientPodcastQuestionsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

