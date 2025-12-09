import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { IReservationStatusHistoryRepository } from '@/domain/repositories/reservation-status-history-repository.interface';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import { ServiceReservation, type ServiceClientAnswer } from '@/domain/models/service-reservation';
import { ReservationStatusHistory } from '@/domain/models/reservation-status-history';

export type SubmitServiceReservationAnswer = {
  questionId: string;
  value: string;
  answerId?: string | null;
};

export type SubmitServiceReservationUseCasePayload = {
  serviceIds: string[];
  answers: SubmitServiceReservationAnswer[];
  clientIp?: string | null;
  userAgent?: string | null;
};

export type SubmitServiceReservationUseCaseSuccess = {
  reservation: ServiceReservation;
  services: Array<{ id: string; name: string }>;
};

export type SubmitServiceReservationUseCaseFailure = {
  reason: 'ValidationError' | 'ServicesNotFound' | 'UnknownError';
  error: Error;
  details?: Record<string, string>;
};

@injectable()
export class SubmitServiceReservationUseCase implements IUseCase<SubmitServiceReservationUseCasePayload, SubmitServiceReservationUseCaseSuccess, SubmitServiceReservationUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.ServiceReservationRepository) private readonly serviceReservationRepository: IServiceReservationRepository,
    @inject(REPOSITORIES_DI_TYPES.ServiceRepository) private readonly serviceRepository: IServiceRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionRepository) private readonly formQuestionRepository: IFormQuestionRepository,
    @inject(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository) private readonly formQuestionAnswerRepository: IFormQuestionAnswerRepository,
    @inject(REPOSITORIES_DI_TYPES.ReservationStatusHistoryRepository) private readonly statusHistoryRepository: IReservationStatusHistoryRepository,
    @inject(CORE_DI_TYPES.IDGenerator) private readonly idGenerator: IIDGenerator,
    @inject(CORE_DI_TYPES.Time) private readonly time: ITime,
  ) {}

  async execute(payload: SubmitServiceReservationUseCasePayload) {
    try {
      const validationErrors: Record<string, string> = {};

      // 1. Validate at least one service is selected
      if (!payload.serviceIds || payload.serviceIds.length === 0) {
        return new Failure<SubmitServiceReservationUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('At least one service must be selected'),
          details: { serviceIds: 'At least one service must be selected' },
        });
      }

      // 2. Validate all services exist and are active
      const services = await Promise.all(
        payload.serviceIds.map(id => this.serviceRepository.findById(id))
      );

      const servicesData: Array<{ id: string; name: string }> = [];
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        if (!service) {
          validationErrors[`service_${payload.serviceIds[i]}`] = 'Service not found';
        } else if (!service.isActive) {
          validationErrors[`service_${payload.serviceIds[i]}`] = 'Service is not active';
        } else {
          servicesData.push({ id: service.id, name: service.name });
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        return new Failure<SubmitServiceReservationUseCaseFailure>({
          reason: 'ServicesNotFound',
          error: new Error('Invalid services'),
          details: validationErrors,
        });
      }

      // 3. Get all active service questions (both general and service-specific)
      const allQuestions = await this.formQuestionRepository.findByFormType('services');

      // Separate general and service-specific questions
      const generalQuestions = allQuestions.filter(q => q.sectionType === 'general');
      const serviceSpecificQuestions = allQuestions.filter(
        q => q.sectionType === 'service_specific' && payload.serviceIds.includes(q.serviceId!)
      );

      // 4. Validate required general questions are answered
      const answeredQuestionIds = new Set(payload.answers.map(a => a.questionId));

      for (const question of generalQuestions) {
        if (question.required && !answeredQuestionIds.has(question.id)) {
          validationErrors[question.id] = `Question "${question.questionText}" is required`;
        }
      }

      // 5. Validate required service-specific questions are answered
      for (const question of serviceSpecificQuestions) {
        if (question.required && !answeredQuestionIds.has(question.id)) {
          validationErrors[question.id] = `Question "${question.questionText}" is required for selected service`;
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        return new Failure<SubmitServiceReservationUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Validation failed'),
          details: validationErrors,
        });
      }

      // 6. Build client answers with full question details
      const clientAnswers: ServiceClientAnswer[] = [];
      const allValidQuestions = [...generalQuestions, ...serviceSpecificQuestions];

      for (const answer of payload.answers) {
        const question = allValidQuestions.find(q => q.id === answer.questionId);
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

        // Get service name if this is a service-specific question
        let serviceName: string | null = null;
        if (question.sectionType === 'service_specific' && question.serviceId) {
          const service = servicesData.find(s => s.id === question.serviceId);
          serviceName = service?.name || null;
        }

        clientAnswers.push({
          questionId: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          sectionType: question.sectionType,
          serviceId: question.serviceId || null,
          serviceName,
          value: answer.value,
          answerId: answer.answerId || null,
          answerText,
          answerMetadata,
        });
      }

      if (Object.keys(validationErrors).length > 0) {
        return new Failure<SubmitServiceReservationUseCaseFailure>({
          reason: 'ValidationError',
          error: new Error('Validation failed'),
          details: validationErrors,
        });
      }

      // 7. Generate confirmation ID and client ID
      const confirmationId = await this.serviceReservationRepository.generateConfirmationId();
      const clientId = this.idGenerator.generate();

      // 8. Create reservation
      const now = this.time.now();
      const reservation = new ServiceReservation({
        id: this.idGenerator.generate(),
        clientId,
        confirmationId,
        serviceIds: payload.serviceIds,
        status: 'pending',
        clientAnswers,
        clientIp: payload.clientIp || null,
        userAgent: payload.userAgent || null,
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      const createdReservation = await this.serviceReservationRepository.create(reservation);

      // 9. Create initial status history
      const statusHistory = new ReservationStatusHistory({
        id: this.idGenerator.generate(),
        reservationId: createdReservation.id,
        reservationType: 'service',
        oldStatus: null,
        newStatus: 'pending',
        notes: 'Reservation submitted',
        changedBy: null,
        changedAt: now,
      });
      await this.statusHistoryRepository.create(statusHistory);

      return new Success({ reservation: createdReservation, services: servicesData });
    } catch (error) {
      return new Failure<SubmitServiceReservationUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }

  private async validateAnswer(answer: SubmitServiceReservationAnswer, question: any): Promise<{ valid: boolean; error?: string }> {
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

