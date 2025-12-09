import { adminApiClient } from "../admin-client";
import type {
  AdminApiResponse,
  AddReservationNoteRequest,
  AddReservationNoteResponse,
  ServiceClientDataResponse,
  ServiceReservationDetailsResponse,
  ServiceReservationListQueryParams,
  ServiceReservationsListResponse,
  UpdateReservationStatusRequest,
  UpdateReservationStatusResponse,
} from "@/types/admin-api";

/**
 * Service Reservations Admin API
 * Based on ADMIN_API_DOCUMENTATION.md
 */

/**
 * List all service reservations with pagination and filtering
 */
export async function listServiceReservations(
  params?: ServiceReservationListQueryParams
): Promise<ServiceReservationsListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.serviceId) queryParams.append("serviceId", params.serviceId);
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.order) queryParams.append("order", params.order);

  const queryString = queryParams.toString();
  const endpoint = `/api/v1/admin/reservations/services${queryString ? `?${queryString}` : ""}`;

  const response = await adminApiClient.get<AdminApiResponse<ServiceReservationsListResponse>>(endpoint);
  return response.data;
}

/**
 * Get all reservations and complete form data for a specific client
 */
export async function getServiceClientData(clientId: string): Promise<ServiceClientDataResponse> {
  const response = await adminApiClient.get<AdminApiResponse<ServiceClientDataResponse>>(
    `/api/v1/admin/reservations/services/client/${clientId}`
  );
  return response.data;
}

/**
 * Get detailed information about a specific service reservation
 */
export async function getServiceReservationDetails(
  reservationId: string
): Promise<ServiceReservationDetailsResponse> {
  const response = await adminApiClient.get<AdminApiResponse<ServiceReservationDetailsResponse>>(
    `/api/v1/admin/reservations/services/${reservationId}`
  );
  return response.data;
}

/**
 * Update the status of a service reservation
 */
export async function updateServiceReservationStatus(
  reservationId: string,
  data: UpdateReservationStatusRequest
): Promise<UpdateReservationStatusResponse> {
  const response = await adminApiClient.patch<AdminApiResponse<UpdateReservationStatusResponse>>(
    `/api/v1/admin/reservations/services/${reservationId}/status`,
    data
  );
  return response.data;
}

/**
 * Add an internal note to a service reservation
 */
export async function addServiceReservationNote(
  reservationId: string,
  data: AddReservationNoteRequest
): Promise<AddReservationNoteResponse> {
  const response = await adminApiClient.post<AdminApiResponse<AddReservationNoteResponse>>(
    `/api/v1/admin/reservations/services/${reservationId}/notes`,
    data
  );
  return response.data;
}

/**
 * Delete a service reservation permanently
 */
export async function deleteServiceReservation(reservationId: string): Promise<{ message: string }> {
  const response = await adminApiClient.delete<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/reservations/services/${reservationId}`
  );
  return response.data;
}
