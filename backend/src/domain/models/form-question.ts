import type { Id } from '@/core/id/id';

export type FormQuestionId = Id<'FormQuestion'>;
export type ServiceId = Id<'Service'>;

export type FormType = 'podcast' | 'services';
export type SectionType = 'general' | 'service_specific';
export type QuestionType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'number'
  | 'url';

export class FormQuestion {
  id: FormQuestionId;
  formType: FormType;
  sectionType: SectionType;
  serviceId: ServiceId | null;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  order: number;
  placeholder: string | null;
  helpText: string | null;
  validationRules: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    formType: FormType;
    sectionType: SectionType;
    serviceId: string | null;
    questionText: string;
    questionType: QuestionType;
    required: boolean;
    order: number;
    placeholder: string | null;
    helpText: string | null;
    validationRules: Record<string, unknown> | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id as FormQuestionId;
    this.formType = params.formType;
    this.sectionType = params.sectionType;
    this.serviceId = params.serviceId as ServiceId | null;
    this.questionText = params.questionText;
    this.questionType = params.questionType;
    this.required = params.required;
    this.order = params.order;
    this.placeholder = params.placeholder;
    this.helpText = params.helpText;
    this.validationRules = params.validationRules;
    this.isActive = params.isActive;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

