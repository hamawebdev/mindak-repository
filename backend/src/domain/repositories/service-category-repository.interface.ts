import type { ServiceCategory } from '@/domain/models/service-category';

export interface IServiceCategoryRepository {
  /**
   * Find all service categories
   */
  findAll(): Promise<ServiceCategory[]>;

  /**
   * Find all active service categories
   */
  findAllActive(): Promise<ServiceCategory[]>;

  /**
   * Find a single service category by ID
   */
  findById(id: string): Promise<ServiceCategory | null>;

  /**
   * Create a new service category
   */
  create(category: ServiceCategory): Promise<ServiceCategory>;

  /**
   * Update an existing service category
   */
  update(id: string, category: Partial<ServiceCategory>): Promise<ServiceCategory>;

  /**
   * Delete a service category
   */
  delete(id: string): Promise<void>;
}

