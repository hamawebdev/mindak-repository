export type QuestionType = 'text' | 'textarea' | 'select' | 'multi_select' | 'number';

export interface PodcastFormQuestion {
  id: string;
  label: string;
  fieldName: string;
  questionType: QuestionType;
  isRequired: boolean;
  helpText: string | null;
  orderIndex: number;
  isActive: boolean;
  stepId: string | null;
  createdAt: Date;
  updatedAt: Date;
  options?: PodcastFormQuestionOption[];
}

export interface PodcastFormQuestionOption {
  id: string;
  questionId: string;
  value: string;
  label: string;
  orderIndex: number;
  isActive: boolean;
}

export interface CreatePodcastFormQuestionInput {
  label: string;
  fieldName: string;
  questionType: QuestionType;
  isRequired?: boolean;
  helpText?: string;
  orderIndex?: number;
  isActive?: boolean;
  stepId?: string;
}

export interface UpdatePodcastFormQuestionInput {
  label?: string;
  fieldName?: string;
  questionType?: QuestionType;
  isRequired?: boolean;
  helpText?: string;
  orderIndex?: number;
  isActive?: boolean;
  stepId?: string;
}

export interface CreatePodcastFormQuestionOptionInput {
  questionId: string;
  value: string;
  label: string;
  orderIndex?: number;
  isActive?: boolean;
}
