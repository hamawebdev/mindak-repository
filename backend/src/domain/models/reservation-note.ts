import type { Id } from '@/core/id/id';

export type ReservationNoteId = Id<'ReservationNote'>;
export type ReservationType = 'podcast' | 'service';
export type UserId = Id<'User'>;

export class ReservationNote {
  id: ReservationNoteId;
  reservationId: string;
  reservationType: ReservationType;
  noteText: string;
  createdBy: UserId;
  createdAt: Date;

  constructor(params: {
    id: string;
    reservationId: string;
    reservationType: ReservationType;
    noteText: string;
    createdBy: string;
    createdAt: Date;
  }) {
    this.id = params.id as ReservationNoteId;
    this.reservationId = params.reservationId;
    this.reservationType = params.reservationType;
    this.noteText = params.noteText;
    this.createdBy = params.createdBy as UserId;
    this.createdAt = params.createdAt;
  }
}

