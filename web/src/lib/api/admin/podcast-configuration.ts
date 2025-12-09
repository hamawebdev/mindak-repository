import { adminApiClient } from "../admin-client";
import type {
  AdminApiResponse,
  Theme,
  CreateThemeRequest,
  UpdateThemeRequest,
  Decor,
  CreateDecorRequest,
  UpdateDecorRequest,
  PackOffer,
  CreatePackRequest,
  UpdatePackRequest,
  Supplement,
  CreateSupplementRequest,
  UpdateSupplementRequest,
  FormStep,
  CreateStepRequest,
  UpdateStepRequest,
  FormStructureResponse,
} from "@/types/admin-api";

/**
 * Podcast Configuration Admin API
 * Based on ADMIN_PODCAST_CONFIGURATION_API.md
 */

// --- Themes Management ---

export async function getThemes(): Promise<Theme[]> {
  const response = await adminApiClient.get<AdminApiResponse<Theme[]>>(
    "/api/v1/admin/podcast/configuration/themes"
  );
  return response.data;
}

export async function createTheme(data: CreateThemeRequest): Promise<Theme> {
  const response = await adminApiClient.post<AdminApiResponse<Theme>>(
    "/api/v1/admin/podcast/configuration/themes",
    data
  );
  return response.data;
}

export async function updateTheme(id: string, data: UpdateThemeRequest): Promise<Theme> {
  const response = await adminApiClient.put<AdminApiResponse<Theme>>(
    `/api/v1/admin/podcast/configuration/themes/${id}`,
    data
  );
  return response.data;
}

export async function deleteTheme(id: string): Promise<void> {
  await adminApiClient.delete<AdminApiResponse<null>>(
    `/api/v1/admin/podcast/configuration/themes/${id}`
  );
}

// --- Decors Management ---

export async function getDecors(): Promise<Decor[]> {
  const response = await adminApiClient.get<AdminApiResponse<Decor[]>>(
    "/api/v1/admin/podcast/configuration/decors"
  );
  return response.data;
}

export async function createDecor(data: CreateDecorRequest): Promise<Decor> {
  const response = await adminApiClient.post<AdminApiResponse<Decor>>(
    "/api/v1/admin/podcast/configuration/decors",
    data
  );
  return response.data;
}

export async function updateDecor(id: string, data: UpdateDecorRequest): Promise<Decor> {
  const response = await adminApiClient.put<AdminApiResponse<Decor>>(
    `/api/v1/admin/podcast/configuration/decors/${id}`,
    data
  );
  return response.data;
}

export async function deleteDecor(id: string): Promise<void> {
  await adminApiClient.delete<AdminApiResponse<null>>(
    `/api/v1/admin/podcast/configuration/decors/${id}`
  );
}

export async function uploadDecorImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await adminApiClient.postFormData<AdminApiResponse<{ imageUrl: string }>>(
    "/api/v1/admin/podcast/configuration/decors/upload-image",
    formData
  );
  return response.data;
}

// --- Packs Management ---

export async function getPacks(): Promise<PackOffer[]> {
  const response = await adminApiClient.get<AdminApiResponse<PackOffer[]>>(
    "/api/v1/admin/podcast/configuration/packs"
  );
  return response.data;
}

export async function createPack(data: CreatePackRequest): Promise<PackOffer> {
  const response = await adminApiClient.post<AdminApiResponse<PackOffer>>(
    "/api/v1/admin/podcast/configuration/packs",
    data
  );
  return response.data;
}

export async function updatePack(id: string, data: UpdatePackRequest): Promise<PackOffer> {
  const response = await adminApiClient.put<AdminApiResponse<PackOffer>>(
    `/api/v1/admin/podcast/configuration/packs/${id}`,
    data
  );
  return response.data;
}

export async function deletePack(id: string): Promise<void> {
  await adminApiClient.delete<AdminApiResponse<null>>(
    `/api/v1/admin/podcast/configuration/packs/${id}`
  );
}

// --- Supplements Management ---

export async function getSupplements(): Promise<Supplement[]> {
  const response = await adminApiClient.get<AdminApiResponse<Supplement[]>>(
    "/api/v1/admin/podcast/configuration/supplements"
  );
  return response.data;
}

export async function createSupplement(data: CreateSupplementRequest): Promise<Supplement> {
  const response = await adminApiClient.post<AdminApiResponse<Supplement>>(
    "/api/v1/admin/podcast/configuration/supplements",
    data
  );
  return response.data;
}

export async function updateSupplement(id: string, data: UpdateSupplementRequest): Promise<Supplement> {
  const response = await adminApiClient.put<AdminApiResponse<Supplement>>(
    `/api/v1/admin/podcast/configuration/supplements/${id}`,
    data
  );
  return response.data;
}

export async function deleteSupplement(id: string): Promise<void> {
  await adminApiClient.delete<AdminApiResponse<null>>(
    `/api/v1/admin/podcast/configuration/supplements/${id}`
  );
}

// --- Steps Management ---

export async function getSteps(): Promise<FormStep[]> {
  const response = await adminApiClient.get<AdminApiResponse<FormStep[]>>(
    "/api/v1/admin/podcast/configuration/steps"
  );
  return response.data;
}

export async function createStep(data: CreateStepRequest): Promise<FormStep> {
  const response = await adminApiClient.post<AdminApiResponse<FormStep>>(
    "/api/v1/admin/podcast/configuration/steps",
    data
  );
  return response.data;
}

export async function updateStep(id: string, data: UpdateStepRequest): Promise<FormStep> {
  const response = await adminApiClient.put<AdminApiResponse<FormStep>>(
    `/api/v1/admin/podcast/configuration/steps/${id}`,
    data
  );
  return response.data;
}

export async function deleteStep(id: string): Promise<void> {
  await adminApiClient.delete<AdminApiResponse<null>>(
    `/api/v1/admin/podcast/configuration/steps/${id}`
  );
}

// --- Structure Management ---

export async function getFormStructure(): Promise<FormStructureResponse> {
  const response = await adminApiClient.get<AdminApiResponse<FormStructureResponse>>(
    "/api/v1/admin/podcast/configuration/structure"
  );
  return response.data;
}
