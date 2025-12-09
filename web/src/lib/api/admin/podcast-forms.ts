import { adminApiClient } from "../admin-client";
import type {
  AdminApiResponse,
  BulkReorderAnswersRequest,
  BulkReorderRequest,
  CreateAnswerRequest,
  CreateQuestionRequest,
  FormQuestion,
  QuestionAnswer,
  UpdateAnswerRequest,
  UpdateQuestionRequest,
  UploadImageResponse,
} from "@/types/admin-api";

/**
 * Podcast Form Questions Admin API
 * Based on ADMIN_API_DOCUMENTATION.md
 */

/**
 * Get all podcast form questions (including inactive ones)
 */
export async function getPodcastQuestions(): Promise<FormQuestion[]> {
  const response = await adminApiClient.get<AdminApiResponse<FormQuestion[]>>(
    "/api/v1/admin/forms/podcast/questions"
  );
  return response.data;
}

/**
 * Create a new podcast form question
 */
export async function createPodcastQuestion(data: CreateQuestionRequest): Promise<FormQuestion> {
  const response = await adminApiClient.post<AdminApiResponse<FormQuestion>>(
    "/api/v1/admin/forms/podcast/questions",
    data
  );
  return response.data;
}

/**
 * Update an existing podcast form question
 */
export async function updatePodcastQuestion(
  questionId: string,
  data: UpdateQuestionRequest
): Promise<FormQuestion> {
  const response = await adminApiClient.put<AdminApiResponse<FormQuestion>>(
    `/api/v1/admin/forms/podcast/questions/${questionId}`,
    data
  );
  return response.data;
}

/**
 * Delete a podcast form question
 */
export async function deletePodcastQuestion(questionId: string): Promise<{ message: string }> {
  const response = await adminApiClient.delete<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/forms/podcast/questions/${questionId}`
  );
  return response.data;
}

/**
 * Bulk reorder podcast questions
 */
export async function bulkReorderPodcastQuestions(data: BulkReorderRequest): Promise<{ message: string }> {
  const response = await adminApiClient.patch<AdminApiResponse<{ message: string }>>(
    "/api/v1/admin/forms/podcast/questions/bulk-reorder",
    data
  );
  return response.data;
}

/**
 * Podcast Question Answers API
 */

/**
 * Get all answers for a specific podcast question
 */
export async function getPodcastQuestionAnswers(questionId: string): Promise<QuestionAnswer[]> {
  const response = await adminApiClient.get<AdminApiResponse<QuestionAnswer[]>>(
    `/api/v1/admin/forms/podcast/questions/${questionId}/answers`
  );
  return response.data;
}

/**
 * Create a new answer for a podcast question
 */
export async function createPodcastQuestionAnswer(
  questionId: string,
  data: CreateAnswerRequest
): Promise<QuestionAnswer> {
  const response = await adminApiClient.post<AdminApiResponse<QuestionAnswer>>(
    `/api/v1/admin/forms/podcast/questions/${questionId}/answers`,
    data
  );
  return response.data;
}

/**
 * Update an existing answer for a podcast question
 */
export async function updatePodcastQuestionAnswer(
  questionId: string,
  answerId: string,
  data: UpdateAnswerRequest
): Promise<QuestionAnswer> {
  const response = await adminApiClient.put<AdminApiResponse<QuestionAnswer>>(
    `/api/v1/admin/forms/podcast/questions/${questionId}/answers/${answerId}`,
    data
  );
  return response.data;
}

/**
 * Delete an answer from a podcast question
 */
export async function deletePodcastQuestionAnswer(
  questionId: string,
  answerId: string
): Promise<{ message: string }> {
  const response = await adminApiClient.delete<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/forms/podcast/questions/${questionId}/answers/${answerId}`
  );
  return response.data;
}

/**
 * Bulk reorder answers for a podcast question
 */
export async function bulkReorderPodcastQuestionAnswers(
  questionId: string,
  data: BulkReorderAnswersRequest
): Promise<{ message: string }> {
  const response = await adminApiClient.patch<AdminApiResponse<{ message: string }>>(
    `/api/v1/admin/forms/podcast/questions/${questionId}/answers/bulk-reorder`,
    data
  );
  return response.data;
}

/**
 * Upload an image for a podcast answer
 */
export async function uploadPodcastAnswerImage(imageFile: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await adminApiClient.postFormData<AdminApiResponse<UploadImageResponse>>(
    "/api/v1/admin/forms/podcast/answers/upload-image",
    formData
  );
  return response.data.image_url;
}
