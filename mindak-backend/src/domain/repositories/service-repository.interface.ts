import type { Service } from '@/domain/models/service';

export interface IServiceRepository {
  /**
   * Find all services
   */
  findAll(): Promise<Service[]>;

  /**
   * Find all active services (for client)
   */
  findAllActive(): Promise<Service[]>;

  /**
   * Find a single service by ID
   */
  findById(id: string): Promise<Service | null>;

  /**
   * Create a new service
   */
  create(service: Service): Promise<Service>;

  /**
   * Update an existing service
   */
  update(id: string, service: Partial<Service>): Promise<Service>;

  /**
   * Delete a service
   */
  delete(id: string): Promise<void>;

  /**
   * Toggle service active status
   */
  toggleStatus(id: string): Promise<Service>;

  /**
   * Bulk update service status
   */
  bulkUpdateStatus(ids: string[], isActive: boolean): Promise<void>;

  /**
   * Check if services exist and are active
   */
  checkServicesExistAndActive(ids: string[]): Promise<{ valid: boolean; invalidIds: string[] }>;
}

