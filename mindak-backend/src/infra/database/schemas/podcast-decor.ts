import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const podcastDecorTable = pgTable('podcast_decor', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 1024 }),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type PodcastDecorEntity = InferSelectModel<typeof podcastDecorTable>;
