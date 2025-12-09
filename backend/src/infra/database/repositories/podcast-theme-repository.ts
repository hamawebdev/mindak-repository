import { inject, injectable } from 'inversify';
import { eq, asc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { PodcastTheme, CreatePodcastThemeInput, UpdatePodcastThemeInput } from '@/domain/models/podcast-theme';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastThemeTable, type PodcastThemeEntity } from '@/infra/database/schemas/podcast-theme';

@injectable()
export class PodcastThemeRepository implements IPodcastThemeRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(activeOnly?: boolean): Promise<PodcastTheme[]> {
    const db = this.database.getInstance();
    let query = db.select().from(podcastThemeTable).orderBy(asc(podcastThemeTable.sortOrder)).$dynamic();

    if (activeOnly) {
      query = query.where(eq(podcastThemeTable.isActive, true));
    }

    const themes = await query;
    return themes.map(this.toModel);
  }

  async findById(id: string): Promise<PodcastTheme | null> {
    const db = this.database.getInstance();
    const [theme] = await db.select().from(podcastThemeTable).where(eq(podcastThemeTable.id, id));
    return theme ? this.toModel(theme) : null;
  }

  async create(input: CreatePodcastThemeInput): Promise<PodcastTheme> {
    const db = this.database.getInstance();
    const [created] = await db.insert(podcastThemeTable).values(input).returning();
    return this.toModel(created);
  }

  async update(id: string, input: UpdatePodcastThemeInput): Promise<PodcastTheme | null> {
    const db = this.database.getInstance();
    const [updated] = await db.update(podcastThemeTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(podcastThemeTable.id, id))
      .returning();
    return updated ? this.toModel(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.database.getInstance();
    const result = await db.delete(podcastThemeTable).where(eq(podcastThemeTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  private toModel(entity: PodcastThemeEntity): PodcastTheme {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
