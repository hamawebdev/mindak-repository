import { z } from 'zod';

export const metadataItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  type: z.enum(['text', 'textarea', 'number', 'boolean', 'select', 'list']),
});

export const createPayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  metadata: z.array(metadataItemSchema).optional().nullable(),
  basePrice: z.number().positive(),
  durationMin: z.number().int().positive(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updatePayloadSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  metadata: z.array(metadataItemSchema).optional().nullable(),
  basePrice: z.number().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
