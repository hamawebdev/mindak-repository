import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { uuid, pgTable, decimal, unique } from 'drizzle-orm/pg-core';

import { podcastReservationNewTable } from './podcast-reservation-new';
import { podcastSupplementServiceTable } from './podcast-supplement-service';

export const podcastReservationSupplementTable = pgTable('podcast_reservation_supplement', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').notNull().references(() => podcastReservationNewTable.id, { onDelete: 'cascade' }),
  supplementId: uuid('supplement_id').notNull().references(() => podcastSupplementServiceTable.id),
  priceAtBooking: decimal('price_at_booking', { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  uniqReservationSupplement: unique().on(table.reservationId, table.supplementId),
}));

export const podcastReservationSupplementRelations = relations(podcastReservationSupplementTable, ({ one }) => ({
  reservation: one(podcastReservationNewTable, {
    fields: [podcastReservationSupplementTable.reservationId],
    references: [podcastReservationNewTable.id],
  }),
  supplement: one(podcastSupplementServiceTable, {
    fields: [podcastReservationSupplementTable.supplementId],
    references: [podcastSupplementServiceTable.id],
  }),
}));

export type PodcastReservationSupplementEntity = InferSelectModel<typeof podcastReservationSupplementTable>;
