import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

import { podcastFormStepTable } from './podcast-form-step';

export const questionTypeEnum = ['text', 'textarea', 'select', 'multi_select', 'number'] as const;
export type QuestionType = typeof questionTypeEnum[number];

export const podcastFormQuestionTable = pgTable('podcast_form_question', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: varchar('label', { length: 255 }).notNull(),
  fieldName: varchar('field_name', { length: 255 }).notNull().unique(),
  questionType: varchar('question_type', { length: 50 }).notNull().$type<QuestionType>(),
  isRequired: boolean('is_required').notNull().default(false),
  helpText: text('help_text'),
  orderIndex: integer('order_index').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  stepId: uuid('step_id').references(() => podcastFormStepTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

import { podcastFormQuestionOptionTable } from './podcast-form-question-option';

export const podcastFormQuestionRelations = relations(podcastFormQuestionTable, ({ many, one }) => ({
  options: many(podcastFormQuestionOptionTable),
  step: one(podcastFormStepTable, {
    fields: [podcastFormQuestionTable.stepId],
    references: [podcastFormStepTable.id],
  }),
}));

export type PodcastFormQuestionEntity = InferSelectModel<typeof podcastFormQuestionTable>;
