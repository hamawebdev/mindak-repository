import { inject, injectable } from 'inversify';
import { eq, and, gte, lte, desc, asc, sql, or, like, count } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { PodcastReservation } from '@/domain/models/podcast-reservation';
import type {
  IPodcastReservationRepository,
  PodcastReservationFilters,
  PaginationParams,
  PaginatedResult
} from '@/domain/repositories/podcast-reservation-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastReservationTable, type PodcastReservationEntity } from '@/infra/database/schemas/podcast-reservation';

@injectable()
export class PodcastReservationRepository implements IPodcastReservationRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async create(reservation: PodcastReservation): Promise<PodcastReservation> {
    const db = this.database.getInstance();

    const [result] = await db.insert(podcastReservationTable).values({
      id: reservation.id,
      clientId: reservation.clientId,
      confirmationId: reservation.confirmationId,
      status: reservation.status,
      clientAnswers: reservation.clientAnswers,
      clientIp: reservation.clientIp,
      userAgent: reservation.userAgent,
      submittedAt: reservation.submittedAt,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      deletedAt: reservation.deletedAt,
    }).returning();

    return this.toPodcastReservation(result);
  }

  async findById(id: string): Promise<PodcastReservation | null> {
    const db = this.database.getInstance();
    const reservation = await db.query.podcastReservationTable.findFirst({
      where: eq(podcastReservationTable.id, id),
    });

    if (!reservation) {
      return null;
    }

    return this.toPodcastReservation(reservation);
  }

  async findByConfirmationId(confirmationId: string): Promise<PodcastReservation | null> {
    const db = this.database.getInstance();
    const reservation = await db.query.podcastReservationTable.findFirst({
      where: eq(podcastReservationTable.confirmationId, confirmationId),
    });

    if (!reservation) {
      return null;
    }

    return this.toPodcastReservation(reservation);
  }

  async findByClientId(clientId: string): Promise<PodcastReservation[]> {
    const db = this.database.getInstance();
    const reservations = await db
      .select()
      .from(podcastReservationTable)
      .where(eq(podcastReservationTable.clientId, clientId))
      .orderBy(desc(podcastReservationTable.submittedAt));

    return reservations.map(r => this.toPodcastReservation(r));
  }

  async findAll(
    filters: PodcastReservationFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<PodcastReservation>> {
    const db = this.database.getInstance();

    // Build where conditions
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(podcastReservationTable.status, filters.status as any));
    }

    if (filters.dateFrom) {
      conditions.push(gte(podcastReservationTable.submittedAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(podcastReservationTable.submittedAt, filters.dateTo));
    }

    // For search, we need to search in the JSON clientAnswers field
    if (filters.search) {
      conditions.push(
        sql`${podcastReservationTable.clientAnswers}::text ILIKE ${'%' + filters.search + '%'}`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(podcastReservationTable)
      .where(whereClause);

    // Get paginated data
    const sortBy = pagination.sortBy || 'submittedAt';
    const order = pagination.order || 'desc';
    const orderFn = order === 'asc' ? asc : desc;

    const offset = (pagination.page - 1) * pagination.limit;

    // Determine sort column
    const sortColumn = sortBy === 'status' ? podcastReservationTable.status :
      sortBy === 'confirmationId' ? podcastReservationTable.confirmationId :
        podcastReservationTable.submittedAt;

    const reservations = await db
      .select()
      .from(podcastReservationTable)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(pagination.limit)
      .offset(offset);

    return {
      data: reservations.map(r => this.toPodcastReservation(r)),
      total: Number(total),
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(Number(total) / pagination.limit),
    };
  }

  async updateStatus(id: string, status: string): Promise<PodcastReservation> {
    const db = this.database.getInstance();

    const [result] = await db.update(podcastReservationTable)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(podcastReservationTable.id, id))
      .returning();

    return this.toPodcastReservation(result);
  }

  async delete(id: string): Promise<void> {
    const db = this.database.getInstance();
    await db.delete(podcastReservationTable).where(eq(podcastReservationTable.id, id));
  }

  async generateConfirmationId(): Promise<string> {
    const db = this.database.getInstance();
    const year = new Date().getFullYear();

    // Get the count of reservations this year
    const yearStart = new Date(year, 0, 1);
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(podcastReservationTable)
      .where(gte(podcastReservationTable.createdAt, yearStart));

    const sequence = String(Number(total) + 1).padStart(6, '0');
    return `POD-${year}-${sequence}`;
  }

  private toPodcastReservation(entity: PodcastReservationEntity): PodcastReservation {
    return new PodcastReservation({
      id: entity.id,
      clientId: entity.clientId,
      confirmationId: entity.confirmationId,
      status: entity.status,
      clientAnswers: entity.clientAnswers,
      clientIp: entity.clientIp,
      userAgent: entity.userAgent,
      submittedAt: entity.submittedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}

