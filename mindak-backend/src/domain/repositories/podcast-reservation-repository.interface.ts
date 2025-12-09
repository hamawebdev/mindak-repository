import type { PodcastReservation } from '@/domain/models/podcast-reservation';

export type PodcastReservationFilters = {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Search by client name/email/phone in answers
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

export interface IPodcastReservationRepository {
  /**
   * Create a new podcast reservation
   */
  create(reservation: PodcastReservation): Promise<PodcastReservation>;

  /**
   * Find a reservation by ID
   */
  findById(id: string): Promise<PodcastReservation | null>;

  /**
   * Find a reservation by confirmation ID
   */
  findByConfirmationId(confirmationId: string): Promise<PodcastReservation | null>;

  /**
   * Find all reservations by client ID
   */
  findByClientId(clientId: string): Promise<PodcastReservation[]>;

  /**
   * Find all reservations with pagination and filters
   */
  findAll(
    filters: PodcastReservationFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<PodcastReservation>>;

  /**
   * Update reservation status
   */
  updateStatus(id: string, status: string): Promise<PodcastReservation>;

  /**
   * Delete a reservation (hard delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Generate unique confirmation ID
   */
  generateConfirmationId(): Promise<string>;
}

