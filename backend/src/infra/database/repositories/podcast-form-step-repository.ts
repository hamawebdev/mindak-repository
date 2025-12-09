import { inject, injectable } from 'inversify';
import { eq, asc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { PodcastFormStep, CreatePodcastFormStepInput, UpdatePodcastFormStepInput } from '@/domain/models/podcast-form-step';
import type { PodcastFormStepRepository as IPodcastFormStepRepository } from '@/domain/repositories/podcast-form-step-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastFormStepTable, type PodcastFormStepEntity } from '@/infra/database/schemas/podcast-form-step';

@injectable()
export class PodcastFormStepRepository implements IPodcastFormStepRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(): Promise<PodcastFormStep[]> {
    const db = this.database.getInstance();
    const steps = await db.select().from(podcastFormStepTable).orderBy(asc(podcastFormStepTable.orderIndex));
    return steps.map(this.toModel);
  }

  async findAllActive(): Promise<PodcastFormStep[]> {
    const db = this.database.getInstance();
    const steps = await db.select()
      .from(podcastFormStepTable)
      .where(eq(podcastFormStepTable.isActive, true))
      .orderBy(asc(podcastFormStepTable.orderIndex));
    return steps.map(this.toModel);
  }

  async findById(id: string): Promise<PodcastFormStep | null> {
    const db = this.database.getInstance();
    const [step] = await db.select().from(podcastFormStepTable).where(eq(podcastFormStepTable.id, id));
    return step ? this.toModel(step) : null;
  }

  async create(input: CreatePodcastFormStepInput): Promise<PodcastFormStep> {
    const db = this.database.getInstance();
    const [created] = await db.insert(podcastFormStepTable).values(input).returning();
    return this.toModel(created);
  }

  async update(id: string, input: UpdatePodcastFormStepInput): Promise<PodcastFormStep | null> {
    const db = this.database.getInstance();
    const [updated] = await db.update(podcastFormStepTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(podcastFormStepTable.id, id))
      .returning();
    return updated ? this.toModel(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.database.getInstance();
    const result = await db.delete(podcastFormStepTable).where(eq(podcastFormStepTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  private toModel(entity: PodcastFormStepEntity): PodcastFormStep {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      orderIndex: entity.orderIndex,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
