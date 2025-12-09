// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    statusCode: number;
  };
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Question Types
export interface AnswerMetadata {
  image?: string;
  description?: string;
  [key: string]: any;
}

export interface QuestionAnswer {
  id: string;
  answer_text: string;
  answer_value: string | null;
  answer_metadata: AnswerMetadata | null;
  order: number;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "file"
    | "number"
    | "url";
  required: boolean;
  order: number;
  placeholder: string | null;
  help_text: string | null;
  validation_rules: Record<string, any> | null;
  answers: QuestionAnswer[];
}

export interface ServiceQuestions {
  service_id: string;
  service_name: string | null;
  questions: Question[];
}

export interface ServicesFormQuestionsResponse {
  general: Question[];
  services: ServiceQuestions[];
}

// Submission Types
export interface AnswerSubmission {
  questionId: string;
  value: string;
  answerId?: string | null;
}

export interface ServiceReservationRequest {
  serviceIds: string[];
  answers: AnswerSubmission[];
}

export interface ServiceReservationResponse {
  confirmationId: string;
  status: string;
  services: Array<{
    id: string;
    name: string;
  }>;
  submittedAt: string;
  message: string;
}

export interface ReservationConfirmation {
  confirmationId: string;
  status: string;
  type: string;
  services?: Array<{
    id: string;
    name: string;
  }>;
  answers: Array<{
    questionId: string;
    questionText: string;
    value: string;
  }>;
  submittedAt: string;
  clientIp: string;
  userAgent: string;
}
