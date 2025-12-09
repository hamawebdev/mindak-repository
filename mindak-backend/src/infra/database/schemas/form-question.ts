import type { InferSelectModel } from 'drizzle-orm';
import { uuid, pgTable, text, varchar, integer, boolean, timestamp, jsonb, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { serviceTable } from './service';

// Enum types for form questions
export const formTypeEnum = ['podcast', 'services'] as const;
export const sectionTypeEnum = ['general', 'service_specific'] as const;
export const questionTypeEnum = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'date',
  'file',
  'number',
  'url',
] as const;

export type FormType = typeof formTypeEnum[number];
export type SectionType = typeof sectionTypeEnum[number];
export type QuestionType = typeof questionTypeEnum[number];

export const formQuestionTable = pgTable('form_question', {
  id: uuid('id').primaryKey().defaultRandom(),
  formType: varchar('form_type', { length: 50 }).notNull().$type<FormType>(),
  sectionType: varchar('section_type', { length: 50 }).notNull().default('general').$type<SectionType>(),
  serviceId: uuid('service_id').references(() => serviceTable.id),
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull().$type<QuestionType>(),
  required: boolean('required').notNull().default(false),
  order: integer('order').notNull().default(0),
  placeholder: text('placeholder'),
  helpText: text('help_text'),
  validationRules: jsonb('validation_rules').$type<Record<string, unknown>>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Check constraint: service_specific questions must have service_id, general questions must not
  serviceSpecificCheck: check(
    'check_service_specific',
    sql`(${table.sectionType} = 'service_specific' AND ${table.serviceId} IS NOT NULL) OR (${table.sectionType} = 'general' AND ${table.serviceId} IS NULL)`
  ),
}));

export type FormQuestionEntity = InferSelectModel<typeof formQuestionTable>;

