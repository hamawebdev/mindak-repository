import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Enum for reservation status
export const reservationStatusEnum = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type ReservationStatus = typeof reservationStatusEnum[number];

export const podcastReservationTable = pgTable('podcast_reservation', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull(),
  confirmationId: varchar('confirmation_id', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('pending').$type<ReservationStatus>(),
  clientAnswers: jsonb('client_answers').notNull().$type<Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    value: string;
    answerId?: string | null;
    answerText?: string | null;
    answerMetadata?: Record<string, unknown> | null;
  }>>(),
  clientIp: varchar('client_ip', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type PodcastReservationEntity = InferSelectModel<typeof podcastReservationTable>;

