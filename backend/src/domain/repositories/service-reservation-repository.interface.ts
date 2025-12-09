import type { ServiceReservation } from '@/domain/models/service-reservation';

export type ServiceReservationFilters = {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Search by client name/email/phone in answers
  serviceId?: string; // Filter by specific service
};

export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface IServiceReservationRepository {
  /**
   * Create a new service reservation
   */
  create(reservation: ServiceReservation): Promise<ServiceReservation>;

  /**
   * Find a reservation by ID
   */
  findById(id: string): Promise<ServiceReservation | null>;

  /**
   * Find a reservation by confirmation ID
   */
  findByConfirmationId(confirmationId: string): Promise<ServiceReservation | null>;

  /**
   * Find all reservations by client ID
   */
  findByClientId(clientId: string): Promise<ServiceReservation[]>;

  /**
   * Find all reservations with pagination and filters
   */
  findAll(
    filters: ServiceReservationFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ServiceReservation>>;

  /**
   * Update reservation status
   */
  updateStatus(id: string, status: string): Promise<ServiceReservation>;

  /**
   * Delete a reservation (hard delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Generate unique confirmation ID
   */
  generateConfirmationId(): Promise<string>;
}

