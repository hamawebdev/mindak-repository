import { inject, injectable } from 'inversify';
import { eq, and, asc, inArray } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { FormQuestionAnswer } from '@/domain/models/form-question-answer';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { formQuestionAnswerTable, type FormQuestionAnswerEntity } from '@/infra/database/schemas/form-question-answer';

@injectable()
export class FormQuestionAnswerRepository implements IFormQuestionAnswerRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findByQuestionId(questionId: string): Promise<FormQuestionAnswer[]> {
    const db = this.database.getInstance();
    const answers = await db.query.formQuestionAnswerTable.findMany({
      where: eq(formQuestionAnswerTable.questionId, questionId),
      orderBy: [asc(formQuestionAnswerTable.order)],
    });

    return answers.map(a => this.toFormQuestionAnswer(a));
  }

  async findById(id: string): Promise<FormQuestionAnswer | null> {
    const db = this.database.getInstance();
    const answer = await db.query.formQuestionAnswerTable.findFirst({
      where: eq(formQuestionAnswerTable.id, id),
    });

    if (!answer) {
      return null;
    }

    return this.toFormQuestionAnswer(answer);
  }

  async create(answer: FormQuestionAnswer): Promise<FormQuestionAnswer> {
    const db = this.database.getInstance();

    const [result] = await db.insert(formQuestionAnswerTable).values({
      id: answer.id,
      questionId: answer.questionId,
      answerText: answer.answerText,
      answerValue: answer.answerValue,
      answerMetadata: answer.answerMetadata,
      order: answer.order,
      isActive: answer.isActive,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    }).returning();

    return this.toFormQuestionAnswer(result);
  }

  async update(id: string, answer: Partial<FormQuestionAnswer>): Promise<FormQuestionAnswer> {
    const db = this.database.getInstance();

    const updateData: Partial<FormQuestionAnswerEntity> = {
      updatedAt: new Date(),
    };

    if (answer.answerText !== undefined) updateData.answerText = answer.answerText;
    if (answer.answerValue !== undefined) updateData.answerValue = answer.answerValue;
    if (answer.answerMetadata !== undefined) updateData.answerMetadata = answer.answerMetadata;
    if (answer.order !== undefined) updateData.order = answer.order;
    if (answer.isActive !== undefined) updateData.isActive = answer.isActive;

    const [result] = await db.update(formQuestionAnswerTable)
      .set(updateData)
      .where(eq(formQuestionAnswerTable.id, id))
      .returning();

    return this.toFormQuestionAnswer(result);
  }

  async delete(id: string): Promise<void> {
    const db = this.database.getInstance();
    await db.delete(formQuestionAnswerTable).where(eq(formQuestionAnswerTable.id, id));
  }

  async bulkUpdateOrder(answers: Array<{ id: string; order: number }>): Promise<void> {
    const db = this.database.getInstance();

    await db.transaction(async (tx) => {
      for (const answer of answers) {
        await tx.update(formQuestionAnswerTable)
          .set({ order: answer.order, updatedAt: new Date() })
          .where(eq(formQuestionAnswerTable.id, answer.id));
      }
    });
  }

  async findActiveByQuestionId(questionId: string): Promise<FormQuestionAnswer[]> {
    const db = this.database.getInstance();
    const answers = await db.query.formQuestionAnswerTable.findMany({
      where: and(
        eq(formQuestionAnswerTable.questionId, questionId),
        eq(formQuestionAnswerTable.isActive, true)
      ),
      orderBy: [asc(formQuestionAnswerTable.order)],
    });

    return answers.map(a => this.toFormQuestionAnswer(a));
  }

  async findByQuestionIds(questionIds: string[]): Promise<FormQuestionAnswer[]> {
    if (questionIds.length === 0) {
      return [];
    }

    const db = this.database.getInstance();
    const answers = await db.query.formQuestionAnswerTable.findMany({
      where: inArray(formQuestionAnswerTable.questionId, questionIds),
      orderBy: [asc(formQuestionAnswerTable.order)],
    });

    return answers.map(a => this.toFormQuestionAnswer(a));
  }

  private toFormQuestionAnswer(entity: FormQuestionAnswerEntity): FormQuestionAnswer {
    return new FormQuestionAnswer({
      id: entity.id,
      questionId: entity.questionId,
      answerText: entity.answerText,
      answerValue: entity.answerValue,
      answerMetadata: entity.answerMetadata,
      order: entity.order,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

