import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const serviceCategoryTable = pgTable('service_category', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ServiceCategoryEntity = InferSelectModel<typeof serviceCategoryTable>;

