import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Reuse the reservation status enum
export const reservationStatusEnum = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type ReservationStatus = typeof reservationStatusEnum[number];

export const serviceReservationTable = pgTable('service_reservation', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull(),
  confirmationId: varchar('confirmation_id', { length: 50 }).notNull().unique(),
  serviceIds: jsonb('service_ids').notNull().$type<string[]>(),
  status: varchar('status', { length: 50 }).notNull().default('pending').$type<ReservationStatus>(),
  clientAnswers: jsonb('client_answers').notNull().$type<Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    sectionType: string;
    serviceId?: string | null;
    serviceName?: string | null;
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

export type ServiceReservationEntity = InferSelectModel<typeof serviceReservationTable>;

