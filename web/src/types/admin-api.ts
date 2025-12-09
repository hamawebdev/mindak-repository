// Admin API Types based on ADMIN_API_DOCUMENTATION.md

export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AdminApiError {
  success: false;
  error: string;
}

export interface UploadImageResponse {
  image_url: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Form Question Types
export type QuestionType =
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

export interface QuestionAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  answer_value: string | null;
  answer_metadata: Record<string, any> | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormQuestion {
  id: string;
  form_type: "podcast" | "services";
  question_text: string;
  question_type: QuestionType;
  required: boolean;
  stepId?: string;
  order: number;
  placeholder: string | null;
  help_text: string | null;
  validation_rules: Record<string, any> | null;
  is_active: boolean;
  answers: QuestionAnswer[];
  fieldName?: string; // Field key for backend mapping
  created_at: string;
  updated_at: string;
}

export interface ServicesFormQuestion extends FormQuestion {
  section_type: "general" | "service_specific";
  service_id: string | null;
}

// Question Create/Update Types
export interface CreateQuestionRequest {
  question_text: string;
  question_type: QuestionType;
  required: boolean;
  stepId?: string;
  order: number;
  placeholder?: string | null;
  help_text?: string | null;
  validation_rules?: Record<string, any> | null;
  fieldName?: string;
  is_active: boolean;
}

export interface CreateServicesQuestionRequest extends CreateQuestionRequest {
  section_type: "general" | "service_specific";
  service_id?: string | null;
}

export interface UpdateQuestionRequest {
  question_text?: string;
  question_type?: QuestionType;
  required?: boolean;
  stepId?: string;
  order?: number;
  placeholder?: string | null;
  help_text?: string | null;
  validation_rules?: Record<string, any> | null;
  fieldName?: string;
  is_active?: boolean;
}

export interface BulkReorderRequest {
  questions: Array<{
    id: string;
    order: number;
  }>;
}

// Answer Create/Update Types
export interface CreateAnswerRequest {
  answer_text: string;
  answer_value?: string | null;
  answer_metadata?: Record<string, any> | null;
  order: number;
  is_active: boolean;
}

export interface UpdateAnswerRequest {
  answer_text?: string;
  answer_value?: string | null;
  answer_metadata?: Record<string, any> | null;
  order?: number;
  is_active?: boolean;
}

export interface BulkReorderAnswersRequest {
  answers: Array<{
    id: string;
    order: number;
  }>;
}

// Reservation Types
export type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface ClientAnswer {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  value: string;
  answerId: string | null;
  answerText: string | null;
  answerMetadata: Record<string, any> | null;
}

export interface ServiceClientAnswer extends ClientAnswer {
  sectionType: "general" | "service_specific";
  serviceId: string | null;
  serviceName: string | null;
}

export interface PodcastReservationListItem {
  id: string;
  clientId: string;
  confirmationId: string;
  status: ReservationStatus;
  submittedAt: string;
}

export interface ServiceReservationListItem {
  id: string;
  clientId: string;
  confirmationId: string;
  serviceIds: string[];
  status: ReservationStatus;
  submittedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PodcastReservationsListResponse {
  reservations: PodcastReservationListItem[];
  pagination: PaginationMeta;
}

export interface ServiceReservationsListResponse {
  reservations: ServiceReservationListItem[];
  pagination: PaginationMeta;
}

// Reservation Details Types
export interface StatusHistoryItem {
  id: string;
  oldStatus: ReservationStatus | null;
  newStatus: ReservationStatus;
  notes: string | null;
  changedBy: string | null;
  changedAt: string;
}

export interface ReservationNote {
  id: string;
  noteText: string;
  createdBy: string;
  createdAt: string;
}

export interface PodcastReservationDetails {
  id: string;
  confirmationId: string;
  status: ReservationStatus;
  startAt: string;
  endAt: string;
  calendarStart: string;
  calendarEnd: string;
  durationHours: number;
  timezone: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  decor?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  theme?: {
    id: string;
    name: string;
    description?: string;
  };
  customTheme?: string;
  podcastDescription?: string;
  packOffer?: {
    id: string;
    name: string;
    basePrice: number;
  };
  supplements?: Array<{
    id: string;
    name: string;
    priceAtBooking: number;
  }>;
  totalPrice: number;
  assignedAdminId?: string;
  confirmedByAdminId?: string;
  confirmedAt?: string;
  clientAnswers: ClientAnswer[];
  clientIp: string | null;
  userAgent: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReservationDetails {
  id: string;
  confirmationId: string;
  serviceIds: string[];
  status: ReservationStatus;
  clientAnswers: ServiceClientAnswer[];
  clientIp: string | null;
  userAgent: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastReservationDetailsResponse {
  reservation: PodcastReservationDetails;
  statusHistory: StatusHistoryItem[];
  notes: ReservationNote[];
}

export interface ServiceReservationDetailsResponse {
  reservation: ServiceReservationDetails;
  statusHistory: StatusHistoryItem[];
  notes: ReservationNote[];
}

// Client Data Types
export interface PodcastClientReservation {
  reservationId: string;
  confirmationId: string;
  status: ReservationStatus;
  submittedAt: string;
  clientAnswers: ClientAnswer[];
}

export interface ServiceClientReservation {
  reservationId: string;
  confirmationId: string;
  serviceIds: string[];
  status: ReservationStatus;
  submittedAt: string;
  clientAnswers: ServiceClientAnswer[];
}

export interface ServiceClientDataResponse {
  client: {
    id: string;
    reservations: ServiceClientReservation[];
  };
}

export interface PodcastClientDataResponse {
  client: {
    id: string;
    reservations: PodcastClientReservation[];
  };
}

export interface PodcastReservation {
  id: string;
  confirmationId: string;
  status: ReservationStatus;
  startAt: string;
  endAt: string;
  calendarStart: string;
  calendarEnd: string;
  durationHours: number;
  timezone: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalPrice?: number;
  assignedAdminId?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface CreatePodcastReservationRequest {
  startAt: string;
  endAt: string;
  timezone?: string;
  status?: ReservationStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  decorId?: string;
  themeId?: string;
  customTheme?: string;
  podcastDescription?: string;
  packOfferId?: string;
  supplementIds?: string[];
  assignedAdminId?: string;
  notes?: string;
  answers?: Array<{
    questionId: string;
    answerText: string;
    // The spec mentions fieldName/label/value in RESPONSE, but for REQUEST usually only ID and text are needed.
    // However, to align with the spec's "answers" object in response, we might just send what's needed.
    // Keeping it simple for request.
  }>;
}

export interface UpdateScheduleRequest {
  startAt: string;
  endAt: string;
  timezone?: string;
  keepStatus?: boolean;
  status?: ReservationStatus;
  reason?: string;
}

export interface CalendarFeedResponse {
  reservations: PodcastReservation[];
  start: string;
  end: string;
}

// Update Status Types
export interface UpdateReservationStatusRequest {
  status: ReservationStatus;
  notes?: string;
}

export interface UpdateReservationStatusResponse {
  reservation: {
    id: string;
    confirmationId: string;
    status: ReservationStatus;
    updatedAt: string;
  };
}

// Add Note Types
export interface AddReservationNoteRequest {
  noteText: string;
}

export interface AddReservationNoteResponse {
  note: ReservationNote;
}

// Query Parameters
export interface ReservationListQueryParams {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface ServiceReservationListQueryParams extends ReservationListQueryParams {
  serviceId?: string;
}

export interface ServicesQuestionsQueryParams {
  section?: "general" | "service_specific";
  serviceId?: string;
}

// Image Upload Types
export interface Decor {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PackOffer {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  sortOrder: number;
  isActive: boolean;
  metadata?: PackMetadataItem[];
}

export interface Supplement {
  id: string;
  name: string;
  description?: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateThemeRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateThemeRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Pack Management
export interface PackMetadataItem {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select" | "list";
  value?: any;
}

export interface CreatePackRequest {
  name: string;
  basePrice: number;
  durationMin: number;
  metadata?: PackMetadataItem[];
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePackRequest {
  name?: string;
  basePrice?: number;
  durationMin?: number;
  metadata?: PackMetadataItem[];
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Decor Management
export interface CreateDecorRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateDecorRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Supplement Management
export interface CreateSupplementRequest {
  name: string;
  price: number;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateSupplementRequest {
  name?: string;
  price?: number;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Form Step Management
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
  questions?: FormQuestion[];
}

export interface CreateStepRequest {
  title: string;
  description?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdateStepRequest {
  title?: string;
  description?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface FormStructureResponse {
  steps: FormStep[];
  unassignedQuestions: FormQuestion[];
}
