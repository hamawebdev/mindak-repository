import { inject, injectable } from 'inversify';
import { eq, asc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { PodcastPackOffer, CreatePodcastPackOfferInput, UpdatePodcastPackOfferInput, PodcastPackMetadataItem } from '@/domain/models/podcast-pack-offer';
import type { PodcastPackOfferRepository as IPodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastPackOfferTable, type PodcastPackOfferEntity } from '@/infra/database/schemas/podcast-pack-offer';

@injectable()
export class PodcastPackOfferRepository implements IPodcastPackOfferRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(): Promise<PodcastPackOffer[]> {
    const db = this.database.getInstance();
    const offers = await db.select().from(podcastPackOfferTable).orderBy(asc(podcastPackOfferTable.sortOrder));
    return offers.map(this.toModel);
  }

  async findAllActive(): Promise<PodcastPackOffer[]> {
    const db = this.database.getInstance();
    const offers = await db.select()
      .from(podcastPackOfferTable)
      .where(eq(podcastPackOfferTable.isActive, true))
      .orderBy(asc(podcastPackOfferTable.sortOrder));
    return offers.map(this.toModel);
  }

  async findById(id: string): Promise<PodcastPackOffer | null> {
    const db = this.database.getInstance();
    const [offer] = await db.select().from(podcastPackOfferTable).where(eq(podcastPackOfferTable.id, id));
    return offer ? this.toModel(offer) : null;
  }

  async create(input: CreatePodcastPackOfferInput): Promise<PodcastPackOffer> {
    const db = this.database.getInstance();
    const [created] = await db.insert(podcastPackOfferTable).values({
      ...input,
      basePrice: input.basePrice.toString(),
    }).returning();
    return this.toModel(created);
  }

  async update(id: string, input: UpdatePodcastPackOfferInput): Promise<PodcastPackOffer | null> {
    const db = this.database.getInstance();
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.basePrice !== undefined) {
      updateData.basePrice = input.basePrice.toString();
    }
    const [updated] = await db.update(podcastPackOfferTable)
      .set(updateData)
      .where(eq(podcastPackOfferTable.id, id))
      .returning();
    return updated ? this.toModel(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const db = this.database.getInstance();
    const result = await db.delete(podcastPackOfferTable).where(eq(podcastPackOfferTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  private toModel(entity: PodcastPackOfferEntity): PodcastPackOffer {
    let metadata = entity.metadata as PodcastPackMetadataItem[] | null;

    // Backward compatibility migration on read:
    // If metadata is missing but description exists, create a default metadata item
    if ((!metadata || metadata.length === 0) && entity.description) {
      metadata = [{
        key: 'description',
        label: 'Description',
        value: entity.description,
        type: 'textarea'
      }];
    }

    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      metadata,
      basePrice: entity.basePrice,
      durationMin: entity.durationMin,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
