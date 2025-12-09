import type { ReservationNote, ReservationType } from '@/domain/models/reservation-note';

export interface IReservationNoteRepository {
  /**
   * Create a new note
   */
  create(note: ReservationNote): Promise<ReservationNote>;

  /**
   * Find all notes for a reservation
   */
  findByReservationId(reservationId: string, reservationType: ReservationType): Promise<ReservationNote[]>;
}

