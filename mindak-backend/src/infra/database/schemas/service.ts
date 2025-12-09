import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, varchar, text, decimal, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

import { serviceCategoryTable } from './service-category';

export const serviceTable = pgTable('service', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  categoryId: uuid('category_id').references(() => serviceCategoryTable.id),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ServiceEntity = InferSelectModel<typeof serviceTable>;

