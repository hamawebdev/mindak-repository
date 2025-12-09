import type { Id } from '@/core/id/id';

export type ReservationStatusHistoryId = Id<'ReservationStatusHistory'>;
export type ReservationType = 'podcast' | 'service';
export type UserId = Id<'User'>;

export class ReservationStatusHistory {
  id: ReservationStatusHistoryId;
  reservationId: string;
  reservationType: ReservationType;
  oldStatus: string | null;
  newStatus: string;
  notes: string | null;
  changedBy: UserId | null;
  changedAt: Date;

  constructor(params: {
    id: string;
    reservationId: string;
    reservationType: ReservationType;
    oldStatus: string | null;
    newStatus: string;
    notes: string | null;
    changedBy: string | null;
    changedAt: Date;
  }) {
    this.id = params.id as ReservationStatusHistoryId;
    this.reservationId = params.reservationId;
    this.reservationType = params.reservationType;
    this.oldStatus = params.oldStatus;
    this.newStatus = params.newStatus;
    this.notes = params.notes;
    this.changedBy = params.changedBy as UserId | null;
    this.changedAt = params.changedAt;
  }
}

