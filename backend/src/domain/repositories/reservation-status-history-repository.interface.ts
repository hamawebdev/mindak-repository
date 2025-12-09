import type { ReservationStatusHistory, ReservationType } from '@/domain/models/reservation-status-history';

export interface IReservationStatusHistoryRepository {
  /**
   * Create a new status history entry
   */
  create(history: ReservationStatusHistory): Promise<ReservationStatusHistory>;

  /**
   * Find all status history for a reservation
   */
  findByReservationId(reservationId: string, reservationType: ReservationType): Promise<ReservationStatusHistory[]>;
}

