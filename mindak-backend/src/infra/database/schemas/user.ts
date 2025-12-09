import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

// Enum for user roles
export const userRoleEnum = ['admin', 'user'] as const;
export type UserRole = typeof userRoleEnum[number];

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 20 }).notNull().unique(),
  hashPassword: varchar('hash_password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user').$type<UserRole>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type UserEntity = InferSelectModel<typeof userTable>;