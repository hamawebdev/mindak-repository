import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

import { userTable } from './user';

// Reuse reservation type enum
export const reservationTypeEnum = ['podcast', 'service'] as const;
export type ReservationType = typeof reservationTypeEnum[number];

export const reservationNoteTable = pgTable('reservation_note', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').notNull(),
  reservationType: varchar('reservation_type', { length: 50 }).notNull().$type<ReservationType>(),
  noteText: text('note_text').notNull(),
  createdBy: uuid('created_by').notNull().references(() => userTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type ReservationNoteEntity = InferSelectModel<typeof reservationNoteTable>;

