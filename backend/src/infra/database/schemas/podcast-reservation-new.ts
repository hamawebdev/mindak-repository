import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { uuid, pgTable, varchar, integer, text, jsonb, decimal, timestamp } from 'drizzle-orm/pg-core';

import { podcastDecorTable } from './podcast-decor';
import { podcastPackOfferTable } from './podcast-pack-offer';
import { podcastThemeTable } from './podcast-theme';
import { userTable } from './user';

export const podcastReservationStatusEnum = ['pending', 'confirmed', 'cancelled', 'rejected', 'completed'] as const;
export type PodcastReservationStatus = typeof podcastReservationStatusEnum[number];

export const podcastReservationNewTable = pgTable('podcast_reservation_new', {
  id: uuid('id').primaryKey().defaultRandom(),
  confirmationId: varchar('confirmation_id', { length: 50 }).unique(),
  status: varchar('status', { length: 50 }).notNull().default('pending').$type<PodcastReservationStatus>(),

  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  durationHours: integer('duration_hours').notNull(),
  timezone: varchar('timezone', { length: 100 }).notNull().default('Europe/Paris'),

  decorId: uuid('decor_id').references(() => podcastDecorTable.id),
  packOfferId: uuid('pack_offer_id').references(() => podcastPackOfferTable.id),
  themeId: uuid('theme_id').references(() => podcastThemeTable.id),

  customTheme: varchar('custom_theme', { length: 255 }),
  podcastDescription: text('podcast_description'),

  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }),

  notes: text('notes'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),

  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),

  assignedAdminId: uuid('assigned_admin_id').references(() => userTable.id),
  confirmedByAdminId: uuid('confirmed_by_admin_id').references(() => userTable.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
});

import { podcastReservationSupplementTable } from './podcast-reservation-supplement';
import { podcastReservationAnswerTable } from './podcast-reservation-answer';

export const podcastReservationNewRelations = relations(podcastReservationNewTable, ({ one, many }) => ({
  decor: one(podcastDecorTable, {
    fields: [podcastReservationNewTable.decorId],
    references: [podcastDecorTable.id],
  }),
  packOffer: one(podcastPackOfferTable, {
    fields: [podcastReservationNewTable.packOfferId],
    references: [podcastPackOfferTable.id],
  }),
  theme: one(podcastThemeTable, {
    fields: [podcastReservationNewTable.themeId],
    references: [podcastThemeTable.id],
  }),
  confirmedBy: one(userTable, {
    fields: [podcastReservationNewTable.confirmedByAdminId],
    references: [userTable.id],
  }),
  supplements: many(podcastReservationSupplementTable),
  answers: many(podcastReservationAnswerTable),
}));

export type PodcastReservationNewEntity = InferSelectModel<typeof podcastReservationNewTable>;
