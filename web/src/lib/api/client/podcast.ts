/**
 * Client-facing Podcast Reservation API
 * Based on CLIENT_FRONTEND_API_SPEC.md v1.0
 */

import { apiClient } from "../client";
import type { ApiResponse } from "@/types/api";

// ============================================================================
// Type Definitions (Based on API Spec)
// ============================================================================

export interface DecorOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface PackOffer {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMin: number;
}

export interface SupplementService {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
}

export interface QuestionOption {
  id: string;
  value: string;
  label: string;
}

export type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "select"
  | "multi_select"
  | "radio"
  | "date"
  | "time";

export interface FormQuestion {
  id: string;
  label: string;
  fieldName: string;
  questionType: QuestionType;
  isRequired: boolean;
  helpText: string | null;
  options: QuestionOption[];
}

export interface BusinessHours {
  start: string;
  end: string;
}

export interface AvailabilityConfig {
  timezone: string;
  businessHours: {
    monday: BusinessHours | null;
    tuesday: BusinessHours | null;
    wednesday: BusinessHours | null;
    thursday: BusinessHours | null;
    friday: BusinessHours | null;
    saturday: BusinessHours | null;
    sunday: BusinessHours | null;
  };
  slotDurationMin: number;
  advanceBookingDays: number;
  minimumNoticeDays: number;
}

export interface FormConfig {
  decorOptions: DecorOption[];
  packOffers: PackOffer[];
  supplementServices: SupplementService[];
  themes: Theme[];
  questions: FormQuestion[];
  availabilityConfig: AvailabilityConfig;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface Availability {
  date: string;
  availableSlots: TimeSlot[];
  unavailableSlots: TimeSlot[];
}

export interface ReservationAnswer {
  questionId: string;
  answerText?: string;
  answerOptionIds?: string[];
}

export interface CreateReservationRequest {
  decorId?: string;
  packOfferId: string;
  supplementIds?: string[];
  themeId?: string;
  customTheme?: string;
  podcastDescription: string;
  requestedDate: string;
  requestedStartTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  metadata?: Record<string, any>;
  answers: ReservationAnswer[];
}

export interface CreateReservationResponse {
  id: string;
  status: string;
  message: string;
}

export interface ClientAnswer {
  questionText: string;
  questionType: QuestionType;
  value: string;
  answerText: string | null;
}

export interface ReservationConfirmation {
  confirmationId: string;
  type: "podcast" | "service";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  submittedAt: string;
  clientAnswers: ClientAnswer[];
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export class PodcastApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "PodcastApiError";
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get Form Configuration
 * Endpoint: GET /api/v1/client/podcast/form-config
 * 
 * Retrieve all configuration data needed to render the podcast reservation form
 */
export async function getFormConfig(): Promise<FormConfig> {
  try {
    const response = await apiClient.get<ApiResponse<FormConfig>>(
      "/api/v1/client/podcast/form-config"
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      throw new PodcastApiError(
        apiError.code,
        apiError.message,
        apiError.details
      );
    }
    throw error;
  }
}

/**
 * Get Availability
 * Endpoint: GET /api/v1/client/podcast/availability
 * 
 * Check available time slots for a specific date and pack offer
 */
export async function getAvailability(
  date: string,
  packOfferId: string
): Promise<Availability> {
  try {
    const response = await apiClient.get<ApiResponse<Availability>>(
      "/api/v1/client/podcast/availability",
      {
        params: {
          date,
          packOfferId,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      throw new PodcastApiError(
        apiError.code,
        apiError.message,
        apiError.details
      );
    }
    throw error;
  }
}

/**
 * Create Reservation
 * Endpoint: POST /api/v1/client/podcast/reservations
 * 
 * Submit a new podcast reservation request
 */
export async function createReservation(
  data: CreateReservationRequest
): Promise<CreateReservationResponse> {
  try {
    const response = await apiClient.post<ApiResponse<CreateReservationResponse>>(
      "/api/v1/client/podcast/reservations",
      data
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      throw new PodcastApiError(
        apiError.code,
        apiError.message,
        apiError.details
      );
    }
    throw error;
  }
}

/**
 * Get Reservation Confirmation
 * Endpoint: GET /api/v1/client/reservations/:confirmationId/confirmation
 * 
 * Retrieve confirmation details for a submitted reservation
 */
export async function getReservationConfirmation(
  confirmationId: string
): Promise<ReservationConfirmation> {
  try {
    const response = await apiClient.get<ApiResponse<ReservationConfirmation>>(
      `/api/v1/client/reservations/${confirmationId}/confirmation`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      throw new PodcastApiError(
        apiError.code,
        apiError.message,
        apiError.details
      );
    }
    throw error;
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

/**
 * Validate time format (HH:mm)
 */
export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^\d{2}:\d{2}$/;
  return timeRegex.test(time);
}

/**
 * Client-side validation for reservation data
 */
export function validateReservation(
  data: CreateReservationRequest,
  requiredQuestions: FormQuestion[]
): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate required fields
  if (!data.customerName || data.customerName.trim().length < 1) {
    errors.push({ field: "customerName", message: "Name is required" });
  }

  if (data.customerName && data.customerName.length > 255) {
    errors.push({
      field: "customerName",
      message: "Name must be less than 255 characters",
    });
  }

  if (!data.customerEmail || !validateEmail(data.customerEmail)) {
    errors.push({ field: "customerEmail", message: "Valid email is required" });
  }

  if (data.customerPhone && data.customerPhone.length > 50) {
    errors.push({
      field: "customerPhone",
      message: "Phone number must be less than 50 characters",
    });
  }

  if (!data.packOfferId) {
    errors.push({ field: "packOfferId", message: "Please select a package" });
  }

  if (!data.themeId && !data.customTheme) {
    errors.push({
      field: "themeId",
      message: "Either a theme or custom theme must be provided"
    });
  }

  if (!data.podcastDescription || data.podcastDescription.trim().length < 1) {
    errors.push({
      field: "podcastDescription",
      message: "Podcast description is required"
    });
  }

  if (!data.requestedDate || !validateDateFormat(data.requestedDate)) {
    errors.push({
      field: "requestedDate",
      message: "Valid date is required (YYYY-MM-DD)",
    });
  }

  if (!data.requestedStartTime || !validateTimeFormat(data.requestedStartTime)) {
    errors.push({
      field: "requestedStartTime",
      message: "Valid time is required (HH:mm)",
    });
  }

  // Validate required questions
  requiredQuestions.forEach((question) => {
    const answer = data.answers.find((a) => a.questionId === question.id);
    if (
      !answer ||
      (!answer.answerText?.trim() && !answer.answerOptionIds?.length)
    ) {
      errors.push({
        field: `answers.${question.id}`,
        message: `${question.label} is required`,
      });
    }
  });

  return errors;
}
