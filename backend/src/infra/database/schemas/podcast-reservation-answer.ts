import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { uuid, pgTable, text, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';

import { podcastReservationNewTable } from './podcast-reservation-new';
import { podcastFormQuestionTable } from './podcast-form-question';

export const podcastReservationAnswerTable = pgTable('podcast_reservation_answer', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').notNull().references(() => podcastReservationNewTable.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => podcastFormQuestionTable.id),
  answerText: text('answer_text'),
  answerOptionIds: jsonb('answer_option_ids').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqReservationQuestion: unique().on(table.reservationId, table.questionId),
}));

export const podcastReservationAnswerRelations = relations(podcastReservationAnswerTable, ({ one }) => ({
  reservation: one(podcastReservationNewTable, {
    fields: [podcastReservationAnswerTable.reservationId],
    references: [podcastReservationNewTable.id],
  }),
  question: one(podcastFormQuestionTable, {
    fields: [podcastReservationAnswerTable.questionId],
    references: [podcastFormQuestionTable.id],
  }),
}));

export type PodcastReservationAnswerEntity = InferSelectModel<typeof podcastReservationAnswerTable>;
