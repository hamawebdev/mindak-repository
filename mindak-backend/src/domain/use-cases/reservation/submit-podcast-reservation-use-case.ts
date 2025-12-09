import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IPodcastReservationRepository } from '@/domain/repositories/podcast-reservation-repository.interface';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { IReservationStatusHistoryRepository } from '@/domain/repositories/reservation-status-history-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { PodcastReservation, type ClientAnswer } from '@/domain/models/podcast-reservation';
import { ReservationStatusHistory } from '@/domain/models/reservation-status-history';

export type SubmitPodcastReservationAnswer = {
  questionId: string;
  value: string;
  answerId?: string | null;
};

export type SubmitPodcastReservationUseCasePayload = {
  answers: SubmitPodcastReservationAnswer[];
  clientIp?: string | null;
  userAgent?: string | null;
};

export type SubmitPodcastReservationUseCaseSuccess = {
  reservation: PodcastReservation;
};

export type SubmitPodcastReservationUseCaseFailure = {
  reason: 'ValidationError' | 'UnknownError';
  error: Error;
  details?: Record<string, string>;
};

@injectable()
export class SubmitPodcastReservationUseCase implements IUseCase<SubmitPodcastReservationUseCasePayload, SubmitPodcastReservationUseCaseSuccess, SubmitPodcastReservationUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.PodcastReservationRepository) private readonly podcastReservationRepository: IPodcastReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationStatusHistoryRepository) private readonly statusHistoryRepository: IReservationStatusHistoryRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: SubmitPodcastReservationUseCasePayload) {
    try {
      // 1. Get all active podcast questions
      const questions = await this.formQuestionRepository.findByFormType('podcast');

      // 2. Validate required questions are answered
      const validationErrors: Record<string, string> = {};
      const answeredQuestionIds = new Set(payload.answers.map(a => a.questionId));

      for (const question of questions) {
        if (question.required && !answeredQuestionIds.has(question.id)) {
          validationErrors[question.id] = `Question "${question.questionText}" is required`;
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        return new Failure<SubmitPodcastReservationUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Validation failed'),
          details: validationErrors,
        });
      }

      // 3. Build client answers with full question details
      const clientAnswers: ClientAnswer[] = [];

      for (const answer of payload.answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question) {
          validationErrors[answer.questionId] = 'Invalid question ID';
          continue;
        }

        // Validate answer format based on question type
        const answerValidation = await this.validateAnswer(answer, question);
        if (!answerValidation.valid) {
          validationErrors[answer.questionId] = answerValidation.error!;
          continue;
        }

        // Get answer details if answerId is provided
        let answerText: string | null = null;
        let answerMetadata: Record<string, unknown> | null = null;

        if (answer.answerId) {
          const answerEntity = await this.formQuestionAnswerRepository.findById(answer.answerId);
          if (answerEntity) {
            answerText = answerEntity.answerValue;
            answerMetadata = answerEntity.answerMetadata;
          }
        }

        clientAnswers.push({
          questionId: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          value: answer.value,
          answerId: answer.answerId || null,
          answerText,
          answerMetadata,
        });
      }

      if (Object.keys(validationErrors).length > 0) {
        return new Failure<SubmitPodcastReservationUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Validation failed'),
          details: validationErrors,
        });
      }

      // 4. Generate confirmation ID and client ID
      const confirmationId = await this.podcastReservationRepository.generateConfirmationId();
      const clientId = this.idGenerator.generate();

      // 5. Create reservation
      const now = this.time.now();
      const reservation = new PodcastReservation({
        id: this.idGenerator.generate(),
        clientId,
        confirmationId,
        status: 'pending',
        clientAnswers,
        clientIp: payload.clientIp || null,
        userAgent: payload.userAgent || null,
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      const createdReservation = await this.podcastReservationRepository.create(reservation);

      // 6. Create initial status history
      const statusHistory = new ReservationStatusHistory({
        id: this.idGenerator.generate(),
        reservationId: createdReservation.id,
        reservationType: 'podcast',
        oldStatus: null,
        newStatus: 'pending',
        notes: 'Reservation submitted',
        changedBy: null,
        changedAt: now,
      });
      await this.statusHistoryRepository.create(statusHistory);

      return new Success({ reservation: createdReservation });
    } catch (error) {
      return new Failure<SubmitPodcastReservationUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }

  private async validateAnswer(answer: SubmitPodcastReservationAnswer, question: any): Promise<{ valid: boolean; error?: string }> {
    // For selection types, answerId must be provided
    if (['select', 'radio', 'checkbox'].includes(question.questionType)) {
      if (!answer.answerId) {
        return { valid: false, error: 'Answer ID is required for selection questions' };
      }

      // Verify answerId belongs to this question
      const answerEntity = await this.formQuestionAnswerRepository.findById(answer.answerId);
      if (!answerEntity || answerEntity.questionId !== question.id) {
        return { valid: false, error: 'Invalid answer ID for this question' };
      }
    }

    // For text types, answerId should be null
    if (['text', 'email', 'phone', 'textarea', 'url', 'number', 'date', 'file'].includes(question.questionType)) {
      if (answer.answerId) {
        return { valid: false, error: 'Answer ID should not be provided for text-based questions' };
      }
    }

    // Basic validation for specific types
    if (question.questionType === 'email' && answer.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer.value)) {
        return { valid: false, error: 'Invalid email format' };
      }
    }

    if (question.questionType === 'number' && answer.value) {
      if (isNaN(Number(answer.value))) {
        return { valid: false, error: 'Invalid number format' };
      }
    }

    return { valid: true };
  }
}

