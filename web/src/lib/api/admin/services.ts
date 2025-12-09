import { adminApiClient } from "../admin-client";
import type { AdminApiResponse } from "@/types/admin-api";
import type { Service } from "@/types/api";

/**
 * Services Admin API
 * Based on SERVICES_API.md
 */

export interface CreateServiceRequest {
    name: string;
    description: string;
    price: string | number;
    category_id?: string | null;
    is_active?: boolean;
    display_order?: number;
}

export interface UpdateServiceRequest {
    name?: string;
    description?: string;
    price?: string | number;
    category_id?: string | null;
    is_active?: boolean;
    display_order?: number;
}

export interface GetAllServicesParams {
    page?: number;
    limit?: number;
    search?: string;
}

/**
 * Get all services (admin - includes inactive)
 */
export async function getAllServices(params?: GetAllServicesParams): Promise<Service[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/services${queryString ? `?${queryString}` : ""}`;

    const response = await adminApiClient.get<AdminApiResponse<Service[]>>(endpoint);
    return response.data;
}

/**
 * Get service by ID
 */
export async function getServiceById(serviceId: string): Promise<Service> {
    const response = await adminApiClient.get<AdminApiResponse<Service>>(`/api/v1/admin/services/${serviceId}`);
    return response.data;
}

/**
 * Create a new service
 */
export async function createService(data: CreateServiceRequest): Promise<Service> {
    const response = await adminApiClient.post<AdminApiResponse<Service>>("/api/v1/admin/services", data);
    return response.data;
}

/**
 * Update an existing service
 */
export async function updateService(serviceId: string, data: UpdateServiceRequest): Promise<Service> {
    const response = await adminApiClient.put<AdminApiResponse<Service>>(
        `/api/v1/admin/services/${serviceId}`,
        data
    );
    return response.data;
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string): Promise<{ message: string }> {
    const response = await adminApiClient.delete<AdminApiResponse<{ message: string }>>(
        `/api/v1/admin/services/${serviceId}`
    );
    return response.data;
}

/**
 * Toggle service status (active/inactive)
 */
export async function toggleServiceStatus(serviceId: string): Promise<Service> {
    const response = await adminApiClient.patch<AdminApiResponse<Service>>(
        `/api/v1/admin/services/${serviceId}/toggle-status`
    );
    return response.data;
}

/**
 * Bulk update service status
 */
export async function bulkUpdateServiceStatus(
    serviceIds: string[],
    isActive: boolean
): Promise<{ updatedCount: number; services: Array<{ id: string; isActive: boolean }> }> {
    const response = await adminApiClient.patch<
        AdminApiResponse<{ updatedCount: number; services: Array<{ id: string; isActive: boolean }> }>
    >("/api/v1/admin/services/bulk-status", {
        serviceIds,
        isActive,
    });
    return response.data;
}
