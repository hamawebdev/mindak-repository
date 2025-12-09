import { inject, injectable } from 'inversify';
import { eq, asc, inArray } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { PodcastSupplementService, CreatePodcastSupplementServiceInput, UpdatePodcastSupplementServiceInput } from '@/domain/models/podcast-supplement-service';
import type { PodcastSupplementServiceRepository as IPodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastSupplementServiceTable, type PodcastSupplementServiceEntity } from '@/infra/database/schemas/podcast-supplement-service';

@injectable()
export class PodcastSupplementServiceRepository implements IPodcastSupplementServiceRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(): Promise<PodcastSupplementService[]> {
    const db = this.database.getInstance();
    const services = await db.select().from(podcastSupplementServiceTable).orderBy(asc(podcastSupplementServiceTable.sortOrder));
    return services.map(this.toModel);
  }

  async findAllActive(): Promise<PodcastSupplementService[]> {
    const db = this.database.getInstance();
    const services = await db.select()
      .from(podcastSupplementServiceTable)
      .where(eq(podcastSupplementServiceTable.isActive, true))
      .orderBy(asc(podcastSupplementServiceTable.sortOrder));
    return services.map(this.toModel);
  }

  async findById(id: string): Promise<PodcastSupplementService | null> {
    const db = this.database.getInstance();
    const [service] = await db.select().from(podcastSupplementServiceTable).where(eq(podcastSupplementServiceTable.id, id));
    return service ? this.toModel(service) : null;
  }

  async findByIds(ids: string[]): Promise<PodcastSupplementService[]> {
    if (ids.length === 0) return [];
    const db = this.database.getInstance();
    const services = await db.select()
      .from(podcastSupplementServiceTable)
      .where(inArray(podcastSupplementServiceTable.id, ids));
    return services.map(this.toModel);
  }

  async create(input: CreatePodcastSupplementServiceInput): Promise<PodcastSupplementService> {
    const db = this.database.getInstance();
    const [created] = await db.insert(podcastSupplementServiceTable).values({
      ...input,
      price: input.price.toString(),
    }).returning();
    return this.toModel(created);
  }

  async update(id: string, input: UpdatePodcastSupplementServiceInput): Promise<PodcastSupplementService | null> {
    const db = this.database.getInstance();
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.price !== undefined) {
      updateData.price = input.price.toString();
    }
    const [updated] = await db.update(podcastSupplementServiceTable)
      .set(updateData)
      .where(eq(podcastSupplementServiceTable.id, id))
      .returning();
    return updated ? this.toModel(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.database.getInstance();
    const result = await db.delete(podcastSupplementServiceTable).where(eq(podcastSupplementServiceTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  private toModel(entity: PodcastSupplementServiceEntity): PodcastSupplementService {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
