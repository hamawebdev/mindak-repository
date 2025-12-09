import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { uuid, pgTable, varchar, integer, boolean } from 'drizzle-orm/pg-core';

import { podcastFormQuestionTable } from './podcast-form-question';

export const podcastFormQuestionOptionTable = pgTable('podcast_form_question_option', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => podcastFormQuestionTable.id, { onDelete: 'cascade' }),
  value: varchar('value', { length: 255 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

export const podcastFormQuestionOptionRelations = relations(podcastFormQuestionOptionTable, ({ one }) => ({
  question: one(podcastFormQuestionTable, {
    fields: [podcastFormQuestionOptionTable.questionId],
    references: [podcastFormQuestionTable.id],
  }),
}));

export type PodcastFormQuestionOptionEntity = InferSelectModel<typeof podcastFormQuestionOptionTable>;
