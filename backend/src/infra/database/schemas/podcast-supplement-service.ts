import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, decimal, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const podcastSupplementServiceTable = pgTable('podcast_supplement_service', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type PodcastSupplementServiceEntity = InferSelectModel<typeof podcastSupplementServiceTable>;
