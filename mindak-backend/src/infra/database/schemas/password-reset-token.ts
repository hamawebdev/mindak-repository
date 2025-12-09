import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

import { userTable } from './user';

export const passwordResetTokenTable = pgTable('password_reset_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  usedAt: timestamp('used_at'),
});

export type PasswordResetTokenEntity = typeof passwordResetTokenTable.$inferSelect;
export type NewPasswordResetTokenEntity = typeof passwordResetTokenTable.$inferInsert;

export const passwordResetTokenSchema = {
  passwordResetTokenTable,
};

