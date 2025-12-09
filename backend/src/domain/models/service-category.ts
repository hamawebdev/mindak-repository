import type { Id } from '@/core/id/id';

export type ServiceCategoryId = Id<'ServiceCategory'>;

export class ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id as ServiceCategoryId;
    this.name = params.name;
    this.description = params.description;
    this.isActive = params.isActive;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

