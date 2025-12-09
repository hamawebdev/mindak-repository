import { inject, injectable } from 'inversify';
import { eq, and, gte, lte, desc, asc, sql, count } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { ServiceReservation } from '@/domain/models/service-reservation';
import type {
  IServiceReservationRepository,
  ServiceReservationFilters,
  PaginationParams,
  PaginatedResult
} from '@/domain/repositories/service-reservation-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { serviceReservationTable, type ServiceReservationEntity } from '@/infra/database/schemas/service-reservation';

@injectable()
export class ServiceReservationRepository implements IServiceReservationRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async create(reservation: ServiceReservation): Promise<ServiceReservation> {
    const db = this.database.getInstance();

    const [result] = await db.insert(serviceReservationTable).values({
      id: reservation.id,
      clientId: reservation.clientId,
      confirmationId: reservation.confirmationId,
      serviceIds: reservation.serviceIds,
      status: reservation.status,
      clientAnswers: reservation.clientAnswers,
      clientIp: reservation.clientIp,
      userAgent: reservation.userAgent,
      submittedAt: reservation.submittedAt,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      deletedAt: reservation.deletedAt,
    }).returning();

    return this.toServiceReservation(result);
  }

  async findById(id: string): Promise<ServiceReservation | null> {
    const db = this.database.getInstance();
    const reservation = await db.query.serviceReservationTable.findFirst({
      where: eq(serviceReservationTable.id, id),
    });

    if (!reservation) {
      return null;
    }

    return this.toServiceReservation(reservation);
  }

  async findByConfirmationId(confirmationId: string): Promise<ServiceReservation | null> {
    const db = this.database.getInstance();
    const reservation = await db.query.serviceReservationTable.findFirst({
      where: eq(serviceReservationTable.confirmationId, confirmationId),
    });

    if (!reservation) {
      return null;
    }

    return this.toServiceReservation(reservation);
  }

  async findByClientId(clientId: string): Promise<ServiceReservation[]> {
    const db = this.database.getInstance();
    const reservations = await db
      .select()
      .from(serviceReservationTable)
      .where(eq(serviceReservationTable.clientId, clientId))
      .orderBy(desc(serviceReservationTable.submittedAt));

    return reservations.map(r => this.toServiceReservation(r));
  }

  async findAll(
    filters: ServiceReservationFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ServiceReservation>> {
    const db = this.database.getInstance();

    // Build where conditions
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(serviceReservationTable.status, filters.status as any));
    }

    if (filters.dateFrom) {
      conditions.push(gte(serviceReservationTable.submittedAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(serviceReservationTable.submittedAt, filters.dateTo));
    }

    // Filter by service ID
    if (filters.serviceId) {
      conditions.push(
        sql`${serviceReservationTable.serviceIds}::jsonb @> ${JSON.stringify([filters.serviceId])}::jsonb`
      );
    }

    // For search, we need to search in the JSON clientAnswers field
    if (filters.search) {
      conditions.push(
        sql`${serviceReservationTable.clientAnswers}::text ILIKE ${'%' + filters.search + '%'}`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(serviceReservationTable)
      .where(whereClause);

    // Get paginated data
    const sortBy = pagination.sortBy || 'submittedAt';
    const order = pagination.order || 'desc';
    const orderFn = order === 'asc' ? asc : desc;

    const offset = (pagination.page - 1) * pagination.limit;

    // Determine sort column
    const sortColumn = sortBy === 'status' ? serviceReservationTable.status :
      sortBy === 'confirmationId' ? serviceReservationTable.confirmationId :
        serviceReservationTable.submittedAt;

    const reservations = await db
      .select()
      .from(serviceReservationTable)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(pagination.limit)
      .offset(offset);

    return {
      data: reservations.map(r => this.toServiceReservation(r)),
      total: Number(total),
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(Number(total) / pagination.limit),
    };
  }

  async updateStatus(id: string, status: string): Promise<ServiceReservation> {
    const db = this.database.getInstance();

    const [result] = await db.update(serviceReservationTable)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(serviceReservationTable.id, id))
      .returning();

    return this.toServiceReservation(result);
  }

  async delete(id: string): Promise<void> {
    const db = this.database.getInstance();
    await db.delete(serviceReservationTable).where(eq(serviceReservationTable.id, id));
  }

  async generateConfirmationId(): Promise<string> {
    const db = this.database.getInstance();
    const year = new Date().getFullYear();

    // Get the count of reservations this year
    const yearStart = new Date(year, 0, 1);
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(serviceReservationTable)
      .where(gte(serviceReservationTable.createdAt, yearStart));

    const sequence = String(Number(total) + 1).padStart(6, '0');
    return `SRV-${year}-${sequence}`;
  }

  private toServiceReservation(entity: ServiceReservationEntity): ServiceReservation {
    return new ServiceReservation({
      id: entity.id,
      clientId: entity.clientId,
      confirmationId: entity.confirmationId,
      serviceIds: entity.serviceIds,
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

