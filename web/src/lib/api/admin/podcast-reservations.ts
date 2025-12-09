import { adminApiClient } from "../admin-client";
import type {
  AdminApiResponse,
  AddReservationNoteRequest,
  AddReservationNoteResponse,
  PodcastClientDataResponse,
  PodcastReservationDetailsResponse,
  PodcastReservationsListResponse,
  ReservationListQueryParams,
  UpdateReservationStatusRequest,
  UpdateReservationStatusResponse,
  CreatePodcastReservationRequest,
  UpdateScheduleRequest,
  PodcastReservation,
  Decor,
  PackOffer,
  Supplement
} from "@/types/admin-api";

/**
 * Podcast Reservations Admin API
 * Based on ADMIN_API_DOCUMENTATION.md
 */

/**
 * Create a new podcast reservation
 */
export async function createPodcastReservation(
  data: CreatePodcastReservationRequest
): Promise<{ reservation: PodcastReservation }> {
  const response = await adminApiClient.post<AdminApiResponse<{ reservation: PodcastReservation }>>(
    "/api/v1/admin/reservations/podcast",
    data
  );
  return response.data;
}

/**
 * Update the schedule of a reservation (Drag & Drop)
 */
export async function updatePodcastReservationSchedule(
  reservationId: string,
  data: UpdateScheduleRequest
): Promise<{ reservation: PodcastReservation }> {
  const response = await adminApiClient.patch<AdminApiResponse<{ reservation: PodcastReservation }>>(
    `/api/v1/admin/reservations/podcast/${reservationId}/schedule`,
    data
  );
  return response.data;
}

/**
 * Get confirmed reservations for calendar
 */
/**
 * Get confirmed reservations for calendar
 */
export async function getConfirmedPodcastCalendar(
  date?: string
): Promise<PodcastReservation[]> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);

  const response = await adminApiClient.get<AdminApiResponse<PodcastReservation[]>>(
    `/api/v1/admin/reservations/podcast/calendar/confirmed?${params.toString()}`
  );
  return response.data;
}

/**
 * Get pending reservations for calendar
 */
export async function getPendingPodcastCalendar(
  date?: string
): Promise<PodcastReservation[]> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);

  const response = await adminApiClient.get<AdminApiResponse<PodcastReservation[]>>(
    `/api/v1/admin/reservations/podcast/calendar/pending?${params.toString()}`
  );
  return response.data;
}

/**
 * List all podcast reservations with pagination and filtering
 */
export async function listPodcastReservations(
  params?: ReservationListQueryParams
): Promise<PodcastReservationsListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.order) queryParams.append("order", params.order);

  const queryString = queryParams.toString();
  const endpoint = `/api/v1/admin/reservations/podcast${queryString ? `?${queryString}` : ""}`;

  const response = await adminApiClient.get<AdminApiResponse<PodcastReservationsListResponse>>(endpoint);
  return response.data;
}

/**
 * Get all reservations and complete form data for a specific client
 */
export async function getPodcastClientData(clientId: string): Promise<PodcastClientDataResponse> {
  const response = await adminApiClient.get<AdminApiResponse<PodcastClientDataResponse>>(
    `/api/v1/admin/reservations/podcast/client/${clientId}`
  );
  return response.data;
}

/**
 * Get detailed information about a specific podcast reservation
 */
export async function getPodcastReservationDetails(
  reservationId: string
): Promise<PodcastReservationDetailsResponse> {
  const response = await adminApiClient.get<AdminApiResponse<PodcastReservationDetailsResponse>>(
    `/api/v1/admin/reservations/podcast/${reservationId}`
  );
  return response.data;
}

/**
 * Update the status of a podcast reservation
 */
export async function updatePodcastReservationStatus(
  reservationId: string,
  data: UpdateReservationStatusRequest
): Promise<UpdateReservationStatusResponse> {
  const response = await adminApiClient.patch<AdminApiResponse<UpdateReservationStatusResponse>>(
    `/api/v1/admin/reservations/podcast/${reservationId}/status`,
    data
  );
  return response.data;
}

/**
 * Add an internal note to a podcast reservation
 */
export async function addPodcastReservationNote(
  reservationId: string,
  data: AddReservationNoteRequest
): Promise<AddReservationNoteResponse> {
  const response = await adminApiClient.post<AdminApiResponse<AddReservationNoteResponse>>(
    `/api/v1/admin/reservations/podcast/${reservationId}/notes`,
    data
  );
  return response.data;
}

/**
 * Get available decors
 */
export async function getAvailableDecors(): Promise<Decor[]> {
  const response = await adminApiClient.get<AdminApiResponse<Decor[]>>(
    "/api/v1/admin/reservations/podcast/decors"
  );
  return response.data;
}

/**
 * Get available packs
 */
export async function getAvailablePacks(): Promise<PackOffer[]> {
  const response = await adminApiClient.get<AdminApiResponse<PackOffer[]>>(
    "/api/v1/admin/reservations/podcast/packs"
  );
  return response.data;
}

/**
 * Get available supplements
 */
export async function getAvailableSupplements(): Promise<Supplement[]> {
  const response = await adminApiClient.get<AdminApiResponse<Supplement[]>>(
    "/api/v1/admin/reservations/podcast/supplements"
  );
  return response.data;
}

/**
 * Delete a podcast reservation permanently
 */
export async function deletePodcastReservation(reservationId: string): Promise<{ message: string }> {
  const response = await adminApiClient.delete<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/reservations/podcast/${reservationId}`
  );
  return response.data;
}
