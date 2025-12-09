import type { Id } from '@/core/id/id';

export type ServiceId = Id<'Service'>;
export type ServiceCategoryId = Id<'ServiceCategory'>;

export class Service {
  id: ServiceId;
  name: string;
  description: string | null;
  price: string | null; // Stored as string (decimal) from database
  categoryId: ServiceCategoryId | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    name: string;
    description: string | null;
    price: string | null;
    categoryId: string | null;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id as ServiceId;
    this.name = params.name;
    this.description = params.description;
    this.price = params.price;
    this.categoryId = params.categoryId as ServiceCategoryId | null;
    this.isActive = params.isActive;
    this.displayOrder = params.displayOrder;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

