import type { Id } from '@/core/id/id';
import type { FormQuestionId } from './form-question';

export type FormQuestionAnswerId = Id<'FormQuestionAnswer'>;

export interface AnswerMetadata extends Record<string, unknown> {
  image?: string;
  description?: string;
  price?: number;
  icon?: string;
  color?: string;
}

export class FormQuestionAnswer {
  id: FormQuestionAnswerId;
  questionId: FormQuestionId;
  answerText: string;
  answerValue: string | null;
  answerMetadata: AnswerMetadata | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    questionId: string;
    answerText: string;
    answerValue: string | null;
    answerMetadata: AnswerMetadata | null;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id as FormQuestionAnswerId;
    this.questionId = params.questionId as FormQuestionId;
    this.answerText = params.answerText;
    this.answerValue = params.answerValue;
    this.answerMetadata = params.answerMetadata;
    this.order = params.order;
    this.isActive = params.isActive;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

