import type { Id } from '@/core/id/id';

export type PodcastReservationId = Id<'PodcastReservation'>;
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ClientAnswer = {
  questionId: string;
  questionText: string;
  questionType: string;
  value: string;
  answerId?: string | null;
  answerText?: string | null;
  answerMetadata?: Record<string, unknown> | null;
};

export class PodcastReservation {
  id: PodcastReservationId;
  clientId: string;
  confirmationId: string;
  status: ReservationStatus;
  clientAnswers: ClientAnswer[];
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
    status: ReservationStatus;
    clientAnswers: ClientAnswer[];
    clientIp: string | null;
    userAgent: string | null;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    this.id = params.id as PodcastReservationId;
    this.clientId = params.clientId;
    this.confirmationId = params.confirmationId;
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

