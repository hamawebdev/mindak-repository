import { inject, injectable } from 'inversify';
import { eq, and, desc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { ReservationNote, type ReservationType } from '@/domain/models/reservation-note';
import type { IReservationNoteRepository } from '@/domain/repositories/reservation-note-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { reservationNoteTable, type ReservationNoteEntity } from '@/infra/database/schemas/reservation-note';

@injectable()
export class ReservationNoteRepository implements IReservationNoteRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async create(note: ReservationNote): Promise<ReservationNote> {
    const db = this.database.getInstance();

    const [result] = await db.insert(reservationNoteTable).values({
      id: note.id,
      reservationId: note.reservationId,
      reservationType: note.reservationType,
      noteText: note.noteText,
      createdBy: note.createdBy,
      createdAt: note.createdAt,
    }).returning();

    return this.toReservationNote(result);
  }

  async findByReservationId(reservationId: string, reservationType: ReservationType): Promise<ReservationNote[]> {
    const db = this.database.getInstance();

    const notes = await db.query.reservationNoteTable.findMany({
      where: and(
        eq(reservationNoteTable.reservationId, reservationId),
        eq(reservationNoteTable.reservationType, reservationType)
      ),
      orderBy: [desc(reservationNoteTable.createdAt)],
    });

    return notes.map(n => this.toReservationNote(n));
  }

  private toReservationNote(entity: ReservationNoteEntity): ReservationNote {
    return new ReservationNote({
      id: entity.id,
      reservationId: entity.reservationId,
      reservationType: entity.reservationType,
      noteText: entity.noteText,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
    });
  }
}

