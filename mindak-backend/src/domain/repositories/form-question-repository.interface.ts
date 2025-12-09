import type { FormQuestion, FormType, SectionType } from '@/domain/models/form-question';

export interface IFormQuestionRepository {
  /**
   * Find all questions by form type
   */
  findByFormType(formType: FormType): Promise<FormQuestion[]>;

  /**
   * Find questions by form type and section type
   */
  findByFormTypeAndSection(formType: FormType, sectionType: SectionType, serviceId?: string): Promise<FormQuestion[]>;

  /**
   * Find a single question by ID
   */
  findById(id: string): Promise<FormQuestion | null>;

  /**
   * Create a new question
   */
  create(question: FormQuestion): Promise<FormQuestion>;

  /**
   * Update an existing question
   */
  update(id: string, question: Partial<FormQuestion>): Promise<FormQuestion>;

  /**
   * Delete a question
   */
  delete(id: string): Promise<void>;

  /**
   * Bulk update question orders
   */
  bulkUpdateOrder(questions: Array<{ id: string; order: number }>): Promise<void>;

  /**
   * Find active questions by form type (for client)
   */
  findActiveByFormType(formType: FormType): Promise<FormQuestion[]>;

  /**
   * Find active questions by form type and section (for client)
   */
  findActiveByFormTypeAndSection(formType: FormType, sectionType: SectionType, serviceId?: string): Promise<FormQuestion[]>;
}

