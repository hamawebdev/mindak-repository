import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { FormQuestion } from '@/domain/models/form-question';
import type { FormQuestionAnswer } from '@/domain/models/form-question-answer';

export type GetClientServicesQuestionsUseCasePayload = Record<string, never>;

export type ServiceQuestions = {
  serviceId: string;
  serviceName: string | null;
  questions: Array<FormQuestion & { answers: FormQuestionAnswer[] }>;
};

export type GetClientServicesQuestionsUseCaseSuccess = {
  general: Array<FormQuestion & { answers: FormQuestionAnswer[] }>;
  services: ServiceQuestions[];
};

export type GetClientServicesQuestionsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetClientServicesQuestionsUseCase implements IUseCase<GetClientServicesQuestionsUseCasePayload, GetClientServicesQuestionsUseCaseSuccess, GetClientServicesQuestionsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
  ) {}

  async execute(_payload: GetClientServicesQuestionsUseCasePayload) {
    try {
      // Get all active services questions
      const allQuestions = await this.formQuestionRepository.findActiveByFormType('services');

      // Separate general and service-specific questions
      const generalQuestions = allQuestions.filter(q => q.sectionType === 'general');
      const serviceSpecificQuestions = allQuestions.filter(q => q.sectionType === 'service_specific');

      // Get all active answers for these questions
      const questionIds = allQuestions.map(q => q.id);
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

      // Combine general questions with their answers
      const generalWithAnswers = generalQuestions.map(question => ({
        ...question,
        answers: answersByQuestionId[question.id] || [],
      }));

      // Group service-specific questions by serviceId
      const questionsByServiceId = serviceSpecificQuestions.reduce((acc, question) => {
        const serviceId = question.serviceId!;
        if (!acc[serviceId]) {
          acc[serviceId] = [];
        }
        acc[serviceId].push(question);
        return acc;
      }, {} as Record<string, FormQuestion[]>);

      // Combine service-specific questions with their answers
      const servicesWithQuestions: ServiceQuestions[] = Object.entries(questionsByServiceId).map(([serviceId, questions]) => ({
        serviceId,
        serviceName: null, // TODO: Fetch service name from service repository if needed
        questions: questions.map(question => ({
          ...question,
          answers: answersByQuestionId[question.id] || [],
        })),
      }));

      return new Success({
        general: generalWithAnswers,
        services: servicesWithQuestions,
      });
    } catch (error) {
      return new Failure<GetClientServicesQuestionsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

