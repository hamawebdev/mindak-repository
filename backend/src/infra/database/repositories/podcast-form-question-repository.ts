import { inject, injectable } from 'inversify';
import { eq, asc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type {
  PodcastFormQuestion,
  PodcastFormQuestionOption,
  CreatePodcastFormQuestionInput,
  UpdatePodcastFormQuestionInput,
  CreatePodcastFormQuestionOptionInput
} from '@/domain/models/podcast-form-question';
import type { PodcastFormQuestionRepository as IPodcastFormQuestionRepository } from '@/domain/repositories/podcast-form-question-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastFormQuestionTable, type PodcastFormQuestionEntity } from '@/infra/database/schemas/podcast-form-question';
import { podcastFormQuestionOptionTable, type PodcastFormQuestionOptionEntity } from '@/infra/database/schemas/podcast-form-question-option';

@injectable()
export class PodcastFormQuestionRepository implements IPodcastFormQuestionRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(): Promise<PodcastFormQuestion[]> {
    const db = this.database.getInstance();
    const questions = await db.select().from(podcastFormQuestionTable).orderBy(asc(podcastFormQuestionTable.orderIndex));
    return questions.map(this.toModel);
  }

  async findAllActive(): Promise<PodcastFormQuestion[]> {
    const db = this.database.getInstance();
    const questions = await db.select()
      .from(podcastFormQuestionTable)
      .where(eq(podcastFormQuestionTable.isActive, true))
      .orderBy(asc(podcastFormQuestionTable.orderIndex));
    return questions.map(this.toModel);
  }

  async findAllActiveWithOptions(): Promise<PodcastFormQuestion[]> {
    const db = this.database.getInstance();
    const questions = await db.query.podcastFormQuestionTable.findMany({
      where: (q, { eq }) => eq(q.isActive, true),
      with: {
        options: {
          where: (opt, { eq }) => eq(opt.isActive, true),
          orderBy: (opt, { asc }) => [asc(opt.orderIndex)],
        },
      },
      orderBy: (q, { asc }) => [asc(q.orderIndex)],
    });

    return questions.map(q => ({
      ...this.toModel(q),
      options: q.options?.map(this.toOptionModel) || [],
    }));
  }

  async findById(id: string): Promise<PodcastFormQuestion | null> {
    const db = this.database.getInstance();
    const [question] = await db.select().from(podcastFormQuestionTable).where(eq(podcastFormQuestionTable.id, id));
    return question ? this.toModel(question) : null;
  }

  async create(input: CreatePodcastFormQuestionInput): Promise<PodcastFormQuestion> {
    const db = this.database.getInstance();
    const [created] = await db.insert(podcastFormQuestionTable).values(input).returning();
    return this.toModel(created);
  }

  async update(id: string, input: UpdatePodcastFormQuestionInput): Promise<PodcastFormQuestion | null> {
    const db = this.database.getInstance();
    const [updated] = await db.update(podcastFormQuestionTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(podcastFormQuestionTable.id, id))
      .returning();
    return updated ? this.toModel(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.database.getInstance();
    const result = await db.delete(podcastFormQuestionTable).where(eq(podcastFormQuestionTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async createOption(input: CreatePodcastFormQuestionOptionInput): Promise<PodcastFormQuestionOption> {
    const db = this.database.getInstance();
    const [created] = await db.insert(podcastFormQuestionOptionTable).values(input).returning();
    return this.toOptionModel(created);
  }

  async findOptionsByQuestionId(questionId: string): Promise<PodcastFormQuestionOption[]> {
    const db = this.database.getInstance();
    const options = await db.select()
      .from(podcastFormQuestionOptionTable)
      .where(eq(podcastFormQuestionOptionTable.questionId, questionId))
      .orderBy(asc(podcastFormQuestionOptionTable.orderIndex));
    return options.map(this.toOptionModel);
  }

  async deleteOption(optionId: string): Promise<boolean> {
    const db = this.database.getInstance();
    const result = await db.delete(podcastFormQuestionOptionTable).where(eq(podcastFormQuestionOptionTable.id, optionId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  private toModel(entity: PodcastFormQuestionEntity): PodcastFormQuestion {
    return {
      id: entity.id,
      label: entity.label,
      fieldName: entity.fieldName,
      questionType: entity.questionType,
      isRequired: entity.isRequired,
      helpText: entity.helpText,
      orderIndex: entity.orderIndex,
      isActive: entity.isActive,
      stepId: entity.stepId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toOptionModel(entity: PodcastFormQuestionOptionEntity): PodcastFormQuestionOption {
    return {
      id: entity.id,
      questionId: entity.questionId,
      value: entity.value,
      label: entity.label,
      orderIndex: entity.orderIndex,
      isActive: entity.isActive,
    };
  }
}
