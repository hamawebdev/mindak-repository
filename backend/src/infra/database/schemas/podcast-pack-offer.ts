import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const podcastPackOfferTable = pgTable('podcast_pack_offer', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'), // Deprecated: use metadata instead
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  durationMin: integer('duration_min').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type PodcastPackOfferEntity = InferSelectModel<typeof podcastPackOfferTable>;
