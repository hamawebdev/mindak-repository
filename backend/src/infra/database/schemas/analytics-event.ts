import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Enum for event types
export const eventTypeEnum = [
  'reservation_submitted',
  'reservation_confirmed',
  'form_viewed',
  'service_viewed',
] as const;
export type EventType = typeof eventTypeEnum[number];

export const analyticsEventTable = pgTable('analytics_event', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull().$type<EventType>(),
  eventData: jsonb('event_data').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AnalyticsEventEntity = InferSelectModel<typeof analyticsEventTable>;

