import type { Id } from '@/core/id/id';

export type ServiceReservationId = Id<'ServiceReservation'>;
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ServiceClientAnswer = {
  questionId: string;
  questionText: string;
  questionType: string;
  sectionType: string;
  serviceId?: string | null;
  serviceName?: string | null;
  value: string;
  answerId?: string | null;
  answerText?: string | null;
  answerMetadata?: Record<string, unknown> | null;
};

export class ServiceReservation {
  id: ServiceReservationId;
  clientId: string;
  confirmationId: string;
  serviceIds: string[];
  status: ReservationStatus;
  clientAnswers: ServiceClientAnswer[];
  clientIp: string | null;
  userAgent: string | null;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(params: {
    id: string;
    clientId: string;
    confirmationId: string;
    serviceIds: string[];
    status: ReservationStatus;
    clientAnswers: ServiceClientAnswer[];
    clientIp: string | null;
    userAgent: string | null;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    this.id = params.id as ServiceReservationId;
    this.clientId = params.clientId;
    this.confirmationId = params.confirmationId;
    this.serviceIds = params.serviceIds;
    this.status = params.status;
    this.clientAnswers = params.clientAnswers;
    this.clientIp = params.clientIp;
    this.userAgent = params.userAgent;
    this.submittedAt = params.submittedAt;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
  }
}

