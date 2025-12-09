import { adminApiClient } from "../admin-client";
import type { AdminApiResponse } from "@/types/admin-api";

/**
 * Podcast Availability Configuration Admin API
 * Manages business hours and booking constraints
 */

export interface BusinessHours {
    monday: { start: string; end: string } | null;
    tuesday: { start: string; end: string } | null;
    wednesday: { start: string; end: string } | null;
    thursday: { start: string; end: string } | null;
    friday: { start: string; end: string } | null;
    saturday: { start: string; end: string } | null;
    sunday: { start: string; end: string } | null;
}

export interface AvailabilityConfig {
    timezone: string;
    businessHours: BusinessHours;
    slotDurationMin: number;
    advanceBookingDays: number;
    minimumNoticeDays: number;
}

export interface UpdateAvailabilityConfigRequest {
    timezone?: string;
    businessHours?: Partial<BusinessHours>;
    slotDurationMin?: number;
    advanceBookingDays?: number;
    minimumNoticeDays?: number;
}

export interface AvailabilitySlot {
    startTime: string;
    endTime: string;
}

export interface DayAvailability {
    date: string;
    availableSlots: AvailabilitySlot[];
    unavailableSlots: AvailabilitySlot[];
}

/**
 * Backend API response structure (different from frontend interface)
 */
interface AvailabilityApiResponse {
    slotDurationMin: number;
    openingHours: BusinessHours;
    timezone?: string;
    advanceBookingDays?: number;
    minimumNoticeDays?: number;
}

/**
 * Get current availability configuration
 */
export async function getAvailabilityConfig(): Promise<AvailabilityConfig> {
    const response = await adminApiClient.get<AdminApiResponse<AvailabilityApiResponse>>(
        "/api/v1/admin/podcast/configuration/availability"
    );

    // Transform API response to match frontend interface
    const apiData = response.data;
    return {
        timezone: apiData.timezone || "Europe/Paris",
        businessHours: apiData.openingHours,
        slotDurationMin: apiData.slotDurationMin,
        advanceBookingDays: apiData.advanceBookingDays || 90,
        minimumNoticeDays: apiData.minimumNoticeDays || 2,
    };
}

/**
 * Update availability configuration
 */
export async function updateAvailabilityConfig(
    data: UpdateAvailabilityConfigRequest
): Promise<AvailabilityConfig> {
    // Transform frontend format to backend format
    const requestData: any = {
        timezone: data.timezone,
        slotDurationMin: data.slotDurationMin,
        advanceBookingDays: data.advanceBookingDays,
        minimumNoticeDays: data.minimumNoticeDays,
    };

    // Transform businessHours to openingHours if provided
    if (data.businessHours) {
        requestData.openingHours = data.businessHours;
    }

    const response = await adminApiClient.put<AdminApiResponse<AvailabilityApiResponse>>(
        "/api/v1/admin/podcast/configuration/availability",
        requestData
    );

    // Transform response back to frontend format
    const apiData = response.data;
    return {
        timezone: apiData.timezone || "Europe/Paris",
        businessHours: apiData.openingHours,
        slotDurationMin: apiData.slotDurationMin,
        advanceBookingDays: apiData.advanceBookingDays || 90,
        minimumNoticeDays: apiData.minimumNoticeDays || 2,
    };
}

/**
 * Get availability for a specific date and pack
 * This uses the client endpoint but with admin auth for preview purposes
 */
export async function getAvailabilityForDate(
    date: string,
    packOfferId: string
): Promise<DayAvailability> {
    const params = new URLSearchParams({ date, packOfferId });
    const response = await adminApiClient.get<AdminApiResponse<DayAvailability>>(
        `/api/v1/client/podcast/availability?${params.toString()}`
    );
    return response.data;
}
