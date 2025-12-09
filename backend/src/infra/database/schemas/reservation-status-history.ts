import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

import { userTable } from './user';

// Enum for reservation type
export const reservationTypeEnum = ['podcast', 'service'] as const;
export type ReservationType = typeof reservationTypeEnum[number];

export const reservationStatusHistoryTable = pgTable('reservation_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').notNull(),
  reservationType: varchar('reservation_type', { length: 50 }).notNull().$type<ReservationType>(),
  oldStatus: varchar('old_status', { length: 50 }),
  newStatus: varchar('new_status', { length: 50 }).notNull(),
  notes: text('notes'),
  changedBy: uuid('changed_by').references(() => userTable.id),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
});

export type ReservationStatusHistoryEntity = InferSelectModel<typeof reservationStatusHistoryTable>;

