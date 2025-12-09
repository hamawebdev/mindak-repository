// Services API endpoints

import { apiClient } from "./client";
import type {
  ApiResponse,
  Service,
  ServicesFormQuestionsResponse,
  ServiceReservationRequest,
  ServiceReservationResponse,
  ReservationConfirmation,
} from "@/types/api";

/**
 * Fetch all active services
 */
export async function getServices(): Promise<Service[]> {
  const response = await apiClient.get<ApiResponse<Service[]>>(
    "/api/v1/client/services"
  );
  return response.data;
}

/**
 * Fetch services form questions (general and service-specific)
 */
export async function getServicesFormQuestions(): Promise<ServicesFormQuestionsResponse> {
  const response = await apiClient.get<
    ApiResponse<ServicesFormQuestionsResponse>
  >("/api/v1/client/forms/services/questions");
  return response.data;
}

/**
 * Submit a service reservation
 */
export async function submitServiceReservation(
  data: ServiceReservationRequest
): Promise<ServiceReservationResponse> {
  const response = await apiClient.post<
    ApiResponse<ServiceReservationResponse>
  >("/api/v1/client/reservations/services", data);
  return response.data;
}

/**
 * Get reservation confirmation details
 */
export async function getReservationConfirmation(
  confirmationId: string
): Promise<ReservationConfirmation> {
  const response = await apiClient.get<ApiResponse<ReservationConfirmation>>(
    `/api/v1/client/reservations/${confirmationId}/confirmation`
  );
  return response.data;
}
