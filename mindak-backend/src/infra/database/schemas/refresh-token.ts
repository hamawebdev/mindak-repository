import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

import { userTable } from './user';

export const refreshTokenTable = pgTable('refresh_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  revokedAt: timestamp('revoked_at'),
});

export type RefreshTokenEntity = typeof refreshTokenTable.$inferSelect;
export type NewRefreshTokenEntity = typeof refreshTokenTable.$inferInsert;

export const refreshTokenSchema = {
  refreshTokenTable,
};

