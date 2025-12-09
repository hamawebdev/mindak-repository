import { inject, injectable } from 'inversify';
import { eq, and, desc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { ReservationStatusHistory, type ReservationType } from '@/domain/models/reservation-status-history';
import type { IReservationStatusHistoryRepository } from '@/domain/repositories/reservation-status-history-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { reservationStatusHistoryTable, type ReservationStatusHistoryEntity } from '@/infra/database/schemas/reservation-status-history';

@injectable()
export class ReservationStatusHistoryRepository implements IReservationStatusHistoryRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async create(history: ReservationStatusHistory): Promise<ReservationStatusHistory> {
    const db = this.database.getInstance();

    const [result] = await db.insert(reservationStatusHistoryTable).values({
      id: history.id,
      reservationId: history.reservationId,
      reservationType: history.reservationType,
      oldStatus: history.oldStatus,
      newStatus: history.newStatus,
      notes: history.notes,
      changedBy: history.changedBy,
      changedAt: history.changedAt,
    }).returning();

    return this.toReservationStatusHistory(result);
  }

  async findByReservationId(reservationId: string, reservationType: ReservationType): Promise<ReservationStatusHistory[]> {
    const db = this.database.getInstance();

    const histories = await db.query.reservationStatusHistoryTable.findMany({
      where: and(
        eq(reservationStatusHistoryTable.reservationId, reservationId),
        eq(reservationStatusHistoryTable.reservationType, reservationType)
      ),
      orderBy: [desc(reservationStatusHistoryTable.changedAt)],
    });

    return histories.map(h => this.toReservationStatusHistory(h));
  }

  private toReservationStatusHistory(entity: ReservationStatusHistoryEntity): ReservationStatusHistory {
    return new ReservationStatusHistory({
      id: entity.id,
      reservationId: entity.reservationId,
      reservationType: entity.reservationType,
      oldStatus: entity.oldStatus,
      newStatus: entity.newStatus,
      notes: entity.notes,
      changedBy: entity.changedBy,
      changedAt: entity.changedAt,
    });
  }
}

