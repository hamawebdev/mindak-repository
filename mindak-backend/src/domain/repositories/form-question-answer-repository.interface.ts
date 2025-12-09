import type { FormQuestionAnswer } from '@/domain/models/form-question-answer';

export interface IFormQuestionAnswerRepository {
  /**
   * Find all answers for a question
   */
  findByQuestionId(questionId: string): Promise<FormQuestionAnswer[]>;

  /**
   * Find a single answer by ID
   */
  findById(id: string): Promise<FormQuestionAnswer | null>;

  /**
   * Create a new answer
   */
  create(answer: FormQuestionAnswer): Promise<FormQuestionAnswer>;

  /**
   * Update an existing answer
   */
  update(id: string, answer: Partial<FormQuestionAnswer>): Promise<FormQuestionAnswer>;

  /**
   * Delete an answer
   */
  delete(id: string): Promise<void>;

  /**
   * Bulk update answer orders
   */
  bulkUpdateOrder(answers: Array<{ id: string; order: number }>): Promise<void>;

  /**
   * Find active answers for a question (for client)
   */
  findActiveByQuestionId(questionId: string): Promise<FormQuestionAnswer[]>;

  /**
   * Find answers by multiple question IDs
   */
  findByQuestionIds(questionIds: string[]): Promise<FormQuestionAnswer[]>;
}

