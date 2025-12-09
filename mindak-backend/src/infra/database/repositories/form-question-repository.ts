import { inject, injectable } from 'inversify';
import { eq, and, asc, inArray } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { FormQuestion, type FormType, type SectionType } from '@/domain/models/form-question';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { formQuestionTable, type FormQuestionEntity } from '@/infra/database/schemas/form-question';

@injectable()
export class FormQuestionRepository implements IFormQuestionRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findByFormType(formType: FormType): Promise<FormQuestion[]> {
    const db = this.database.getInstance();
    const questions = await db.query.formQuestionTable.findMany({
      where: eq(formQuestionTable.formType, formType),
      orderBy: [asc(formQuestionTable.order)],
    });

    return questions.map(q => this.toFormQuestion(q));
  }

  async findByFormTypeAndSection(formType: FormType, sectionType: SectionType, serviceId?: string): Promise<FormQuestion[]> {
    const db = this.database.getInstance();

    const conditions = [
      eq(formQuestionTable.formType, formType),
      eq(formQuestionTable.sectionType, sectionType),
    ];

    if (serviceId) {
      conditions.push(eq(formQuestionTable.serviceId, serviceId));
    }

    const questions = await db.query.formQuestionTable.findMany({
      where: and(...conditions),
      orderBy: [asc(formQuestionTable.order)],
    });

    return questions.map(q => this.toFormQuestion(q));
  }

  async findById(id: string): Promise<FormQuestion | null> {
    const db = this.database.getInstance();
    const question = await db.query.formQuestionTable.findFirst({
      where: eq(formQuestionTable.id, id),
    });

    if (!question) {
      return null;
    }

    return this.toFormQuestion(question);
  }

  async create(question: FormQuestion): Promise<FormQuestion> {
    const db = this.database.getInstance();

    const [result] = await db.insert(formQuestionTable).values({
      id: question.id,
      formType: question.formType,
      sectionType: question.sectionType,
      serviceId: question.serviceId,
      questionText: question.questionText,
      questionType: question.questionType,
      required: question.required,
      order: question.order,
      placeholder: question.placeholder,
      helpText: question.helpText,
      validationRules: question.validationRules,
      isActive: question.isActive,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }).returning();

    return this.toFormQuestion(result);
  }

  async update(id: string, question: Partial<FormQuestion>): Promise<FormQuestion> {
    const db = this.database.getInstance();

    const updateData: Partial<FormQuestionEntity> = {
      updatedAt: new Date(),
    };

    if (question.questionText !== undefined) updateData.questionText = question.questionText;
    if (question.questionType !== undefined) updateData.questionType = question.questionType;
    if (question.required !== undefined) updateData.required = question.required;
    if (question.order !== undefined) updateData.order = question.order;
    if (question.placeholder !== undefined) updateData.placeholder = question.placeholder;
    if (question.helpText !== undefined) updateData.helpText = question.helpText;
    if (question.validationRules !== undefined) updateData.validationRules = question.validationRules;
    if (question.isActive !== undefined) updateData.isActive = question.isActive;

    const [result] = await db.update(formQuestionTable)
      .set(updateData)
      .where(eq(formQuestionTable.id, id))
      .returning();

    return this.toFormQuestion(result);
  }

  async delete(id: string): Promise<void> {
    const db = this.database.getInstance();
    await db.delete(formQuestionTable).where(eq(formQuestionTable.id, id));
  }

  async bulkUpdateOrder(questions: Array<{ id: string; order: number }>): Promise<void> {
    const db = this.database.getInstance();

    await db.transaction(async (tx) => {
      for (const question of questions) {
        await tx.update(formQuestionTable)
          .set({ order: question.order, updatedAt: new Date() })
          .where(eq(formQuestionTable.id, question.id));
      }
    });
  }

  async findActiveByFormType(formType: FormType): Promise<FormQuestion[]> {
    const db = this.database.getInstance();
    const questions = await db.query.formQuestionTable.findMany({
      where: and(
        eq(formQuestionTable.formType, formType),
        eq(formQuestionTable.isActive, true)
      ),
      orderBy: [asc(formQuestionTable.order)],
    });

    return questions.map(q => this.toFormQuestion(q));
  }

  async findActiveByFormTypeAndSection(formType: FormType, sectionType: SectionType, serviceId?: string): Promise<FormQuestion[]> {
    const db = this.database.getInstance();

    const conditions = [
      eq(formQuestionTable.formType, formType),
      eq(formQuestionTable.sectionType, sectionType),
      eq(formQuestionTable.isActive, true),
    ];

    if (serviceId) {
      conditions.push(eq(formQuestionTable.serviceId, serviceId));
    }

    const questions = await db.query.formQuestionTable.findMany({
      where: and(...conditions),
      orderBy: [asc(formQuestionTable.order)],
    });

    return questions.map(q => this.toFormQuestion(q));
  }

  private toFormQuestion(entity: FormQuestionEntity): FormQuestion {
    return new FormQuestion({
      id: entity.id,
      formType: entity.formType,
      sectionType: entity.sectionType,
      serviceId: entity.serviceId,
      questionText: entity.questionText,
      questionType: entity.questionType,
      required: entity.required,
      order: entity.order,
      placeholder: entity.placeholder,
      helpText: entity.helpText,
      validationRules: entity.validationRules,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

