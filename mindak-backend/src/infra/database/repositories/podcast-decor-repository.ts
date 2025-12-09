import { inject, injectable } from 'inversify';
import { eq, asc, count } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { PodcastDecor, CreatePodcastDecorInput, UpdatePodcastDecorInput } from '@/domain/models/podcast-decor';
import type { PodcastDecorRepository as IPodcastDecorRepository } from '@/domain/repositories/podcast-decor-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastDecorTable, type PodcastDecorEntity } from '@/infra/database/schemas/podcast-decor';
import { podcastReservationNewTable } from '@/infra/database/schemas/podcast-reservation-new';

@injectable()
export class PodcastDecorRepository implements IPodcastDecorRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(): Promise<PodcastDecor[]> {
    const db = this.database.getInstance();
    const decors = await db.select().from(podcastDecorTable).orderBy(asc(podcastDecorTable.sortOrder));
    return decors.map(this.toModel);
  }

  async findAllActive(): Promise<PodcastDecor[]> {
    const db = this.database.getInstance();
    const decors = await db.select()
      .from(podcastDecorTable)
      .where(eq(podcastDecorTable.isActive, true))
      .orderBy(asc(podcastDecorTable.sortOrder));
    return decors.map(this.toModel);
  }

  async findById(id: string): Promise<PodcastDecor | null> {
    const db = this.database.getInstance();
    const [decor] = await db.select().from(podcastDecorTable).where(eq(podcastDecorTable.id, id));
    return decor ? this.toModel(decor) : null;
  }

  async create(input: CreatePodcastDecorInput): Promise<PodcastDecor> {
    const db = this.database.getInstance();
    const [created] = await db.insert(podcastDecorTable).values(input).returning();
    return this.toModel(created);
  }

  async update(id: string, input: UpdatePodcastDecorInput): Promise<PodcastDecor | null> {
    const db = this.database.getInstance();
    const [updated] = await db.update(podcastDecorTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(podcastDecorTable.id, id))
      .returning();
    return updated ? this.toModel(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.database.getInstance();
    
    // First, set decor_id to NULL for any reservations using this decor
    await db.update(podcastReservationNewTable)
      .set({ decorId: null })
      .where(eq(podcastReservationNewTable.decorId, id));
    
    const result = await db.delete(podcastDecorTable).where(eq(podcastDecorTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async isInUse(id: string): Promise<boolean> {
    const db = this.database.getInstance();
    const [result] = await db.select({ count: count() })
      .from(podcastReservationNewTable)
      .where(eq(podcastReservationNewTable.decorId, id));
    return result.count > 0;
  }

  private toModel(entity: PodcastDecorEntity): PodcastDecor {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      imageUrl: entity.imageUrl,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
