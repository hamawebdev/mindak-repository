import { adminApiClient } from "../admin-client";
import type {
  AdminApiResponse,
  BulkReorderAnswersRequest,
  BulkReorderRequest,
  CreateAnswerRequest,
  CreateServicesQuestionRequest,
  QuestionAnswer,
  ServicesFormQuestion,
  ServicesQuestionsQueryParams,
  UpdateAnswerRequest,
  UpdateQuestionRequest,
  UploadImageResponse,
} from "@/types/admin-api";

/**
 * Services Form Questions Admin API
 * Based on ADMIN_API_DOCUMENTATION.md
 */

/**
 * Get services form questions with optional filtering
 */
export async function getServicesQuestions(
  params?: ServicesQuestionsQueryParams
): Promise<ServicesFormQuestion[]> {
  const queryParams = new URLSearchParams();

  if (params?.section) queryParams.append("section", params.section);
  if (params?.serviceId) queryParams.append("serviceId", params.serviceId);

  const queryString = queryParams.toString();
  const endpoint = `/api/v1/admin/forms/services/questions${queryString ? `?${queryString}` : ""}`;

  const response = await adminApiClient.get<AdminApiResponse<ServicesFormQuestion[]>>(endpoint);
  return response.data;
}

/**
 * Create a new services form question
 */
export async function createServicesQuestion(
  data: CreateServicesQuestionRequest
): Promise<ServicesFormQuestion> {
  const response = await adminApiClient.post<AdminApiResponse<ServicesFormQuestion>>(
    "/api/v1/admin/forms/services/questions",
    data
  );
  return response.data;
}

/**
 * Update an existing services form question
 */
export async function updateServicesQuestion(
  questionId: string,
  data: UpdateQuestionRequest
): Promise<ServicesFormQuestion> {
  const response = await adminApiClient.put<AdminApiResponse<ServicesFormQuestion>>(
    `/api/v1/admin/forms/services/questions/${questionId}`,
    data
  );
  return response.data;
}

/**
 * Delete a services form question
 */
export async function deleteServicesQuestion(questionId: string): Promise<{ message: string }> {
  const response = await adminApiClient.delete<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/forms/services/questions/${questionId}`
  );
  return response.data;
}

/**
 * Bulk reorder services questions
 */
export async function bulkReorderServicesQuestions(data: BulkReorderRequest): Promise<{ message: string }> {
  const response = await adminApiClient.patch<AdminApiResponse<{ message: string }>>(
    "/api/v1/admin/forms/services/questions/bulk-reorder",
    data
  );
  return response.data;
}

/**
 * Services Question Answers API
 */

/**
 * Get all answers for a specific services question
 */
export async function getServicesQuestionAnswers(questionId: string): Promise<QuestionAnswer[]> {
  const response = await adminApiClient.get<AdminApiResponse<QuestionAnswer[]>>(
    `/api/v1/admin/forms/services/questions/${questionId}/answers`
  );
  return response.data;
}

/**
 * Create a new answer for a services question
 */
export async function createServicesQuestionAnswer(
  questionId: string,
  data: CreateAnswerRequest
): Promise<QuestionAnswer> {
  const response = await adminApiClient.post<AdminApiResponse<QuestionAnswer>>(
    `/api/v1/admin/forms/services/questions/${questionId}/answers`,
    data
  );
  return response.data;
}

/**
 * Update an existing answer for a services question
 */
export async function updateServicesQuestionAnswer(
  questionId: string,
  answerId: string,
  data: UpdateAnswerRequest
): Promise<QuestionAnswer> {
  const response = await adminApiClient.put<AdminApiResponse<QuestionAnswer>>(
    `/api/v1/admin/forms/services/questions/${questionId}/answers/${answerId}`,
    data
  );
  return response.data;
}

/**
 * Delete an answer from a services question
 */
export async function deleteServicesQuestionAnswer(
  questionId: string,
  answerId: string
): Promise<{ message: string }> {
  const response = await adminApiClient.delete<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/forms/services/questions/${questionId}/answers/${answerId}`
  );
  return response.data;
}

/**
 * Bulk reorder answers for a services question
 */
export async function bulkReorderServicesQuestionAnswers(
  questionId: string,
  data: BulkReorderAnswersRequest
): Promise<{ message: string }> {
  const response = await adminApiClient.patch<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/forms/services/questions/${questionId}/answers/bulk-reorder`,
    data
  );
  return response.data;
}

/**
 * Upload an image for a services answer
 */
export async function uploadServicesAnswerImage(imageFile: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await adminApiClient.postFormData<AdminApiResponse<UploadImageResponse>>(
    "/api/v1/admin/forms/services/answers/upload-image",
    formData
  );
  return response.data.image_url;
}
