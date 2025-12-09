import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const podcastFormStepTable = pgTable('podcast_form_step', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

import { podcastFormQuestionTable } from './podcast-form-question';

export const podcastFormStepRelations = relations(podcastFormStepTable, ({ many }) => ({
  questions: many(podcastFormQuestionTable),
}));

export type PodcastFormStepEntity = InferSelectModel<typeof podcastFormStepTable>;
