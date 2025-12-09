import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, text, varchar, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

import { formQuestionTable } from './form-question';

export const formQuestionAnswerTable = pgTable('form_question_answer', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => formQuestionTable.id, { onDelete: 'cascade' }),
  answerText: text('answer_text').notNull(),
  answerValue: varchar('answer_value', { length: 255 }),
  answerMetadata: jsonb('answer_metadata').$type<{
    image?: string;
    description?: string;
    price?: number;
    icon?: string;
    color?: string;
  }>(),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type FormQuestionAnswerEntity = InferSelectModel<typeof formQuestionAnswerTable>;

