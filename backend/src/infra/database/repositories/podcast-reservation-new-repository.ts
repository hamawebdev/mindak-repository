import { inject, injectable } from 'inversify';
import { eq, and, gte, lte, or, ilike, sql } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type {
  PodcastReservationNew,
  CreatePodcastReservationInput,
  PodcastReservationStatus
} from '@/domain/models/podcast-reservation-new';
import type { PodcastReservationNewRepository as IPodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { podcastReservationNewTable } from '@/infra/database/schemas/podcast-reservation-new';
import { podcastReservationSupplementTable } from '@/infra/database/schemas/podcast-reservation-supplement';
import { podcastReservationAnswerTable } from '@/infra/database/schemas/podcast-reservation-answer';

@injectable()
export class PodcastReservationNewRepository implements IPodcastReservationNewRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) { }

  async findAll(filters?: {
    status?: PodcastReservationStatus;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PodcastReservationNew[]> {
    const db = this.database.getInstance();
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(podcastReservationNewTable.status, filters.status));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(podcastReservationNewTable.startAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      conditions.push(lte(podcastReservationNewTable.startAt, new Date(filters.dateTo)));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(podcastReservationNewTable.customerName, `%${filters.search}%`),
          ilike(podcastReservationNewTable.customerEmail, `%${filters.search}%`),
        ),
      );
    }

    const query = conditions.length > 0
      ? db.select().from(podcastReservationNewTable).where(and(...conditions))
      : db.select().from(podcastReservationNewTable);

    const reservations = await query;
    return reservations.map(r => this.toModel(r));
  }

  async findById(id: string): Promise<PodcastReservationNew | null> {
    const db = this.database.getInstance();
    const [reservation] = await db.select().from(podcastReservationNewTable).where(eq(podcastReservationNewTable.id, id));
    return reservation ? this.toModel(reservation) : null;
  }

  async findByIdWithDetails(id: string): Promise<PodcastReservationNew | null> {
    const db = this.database.getInstance();
    const reservation = await db.query.podcastReservationNewTable.findFirst({
      where: (r, { eq }) => eq(r.id, id),
      with: {
        decor: true,
        packOffer: true,
        theme: true,
        supplements: {
          with: {
            supplement: true,
          },
        },
        answers: {
          with: {
            question: {
              with: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) return null;

    return {
      ...this.toModel(reservation),
      decor: reservation.decor,
      packOffer: reservation.packOffer,
      theme: reservation.theme,
      supplements: reservation.supplements?.map(s => ({
        id: s.id,
        reservationId: s.reservationId,
        supplementId: s.supplementId,
        priceAtBooking: s.priceAtBooking,
        supplement: s.supplement,
      })),
      answers: reservation.answers?.map(a => ({
        id: a.id,
        reservationId: a.reservationId,
        questionId: a.questionId,
        answerText: a.answerText,
        answerOptionIds: a.answerOptionIds,
        createdAt: a.createdAt,
        question: a.question,
      })),
    };
  }

  async findConfirmedByDate(date: string): Promise<PodcastReservationNew[]> {
    const db = this.database.getInstance();

    // Parse date and create date range for the day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const reservations = await db.select()
      .from(podcastReservationNewTable)
      .where(
        and(
          eq(podcastReservationNewTable.status, 'confirmed'),
          gte(podcastReservationNewTable.startAt, startOfDay),
          lte(podcastReservationNewTable.startAt, endOfDay),
        ),
      );
    return reservations.map(r => this.toModel(r));
  }

  async findConfirmedByDateRange(startDate: Date, endDate: Date): Promise<PodcastReservationNew[]> {
    const db = this.database.getInstance();
    const reservations = await db.select()
      .from(podcastReservationNewTable)
      .where(
        and(
          eq(podcastReservationNewTable.status, 'confirmed'),
          gte(podcastReservationNewTable.startAt, startDate),
          lte(podcastReservationNewTable.startAt, endDate),
        ),
      );
    return reservations.map(r => this.toModel(r));
  }

  async findPendingByDateRange(startDate: Date, endDate: Date): Promise<PodcastReservationNew[]> {
    const db = this.database.getInstance();
    const reservations = await db.select()
      .from(podcastReservationNewTable)
      .where(
        and(
          eq(podcastReservationNewTable.status, 'pending'),
          gte(podcastReservationNewTable.startAt, startDate),
          lte(podcastReservationNewTable.startAt, endDate),
        ),
      );
    return reservations.map(r => this.toModel(r));
  }

  async getConfirmationSequence(year: number): Promise<number> {
    const db = this.database.getInstance();

    // Get the highest confirmation sequence for the given year
    const [result] = await db.select({
      maxId: sql<string>`MAX(CAST(SUBSTRING(${podcastReservationNewTable.confirmationId} FROM 11) AS INTEGER))`,
    })
      .from(podcastReservationNewTable)
      .where(sql`${podcastReservationNewTable.confirmationId} LIKE ${'CONF-' + year + '-%'}`);

    const maxSequence = result?.maxId ? parseInt(result.maxId, 10) : 0;
    return maxSequence + 1;
  }

  async create(input: CreatePodcastReservationInput & {
    startAt: Date;
    endAt: Date;
    durationHours: number;
    totalPrice: number;
  }): Promise<PodcastReservationNew> {
    const db = this.database.getInstance();

    return await db.transaction(async (tx) => {
      const [reservation] = await tx.insert(podcastReservationNewTable).values({
        status: 'pending',
        startAt: input.startAt,
        endAt: input.endAt,
        durationHours: input.durationHours,
        timezone: input.timezone || 'Europe/Paris',
        decorId: input.decorId,
        packOfferId: input.packOfferId,
        themeId: input.themeId,
        customTheme: input.customTheme,
        podcastDescription: input.podcastDescription,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        notes: input.notes,
        metadata: input.metadata,
        totalPrice: input.totalPrice.toFixed(2),
      }).returning();

      if (input.supplementIds && input.supplementIds.length > 0) {
        const supplements = await tx.query.podcastSupplementServiceTable.findMany({
          where: (s, { inArray }) => inArray(s.id, input.supplementIds!),
        });

        await tx.insert(podcastReservationSupplementTable).values(
          supplements.map(s => ({
            reservationId: reservation.id,
            supplementId: s.id,
            priceAtBooking: s.price,
          })),
        );
      }

      if (input.answers && input.answers.length > 0) {
        await tx.insert(podcastReservationAnswerTable).values(
          input.answers.map(a => ({
            reservationId: reservation.id,
            questionId: a.questionId,
            answerText: a.answerText || null,
            ...(Array.isArray(a.answerOptionIds) && a.answerOptionIds.length > 0
              ? { answerOptionIds: a.answerOptionIds }
              : { answerOptionIds: null }),
          })),
        );
      }

      return this.toModel(reservation);
    });
  }

  async adminCreate(input: any): Promise<PodcastReservationNew> {
    const db = this.database.getInstance();

    return await db.transaction(async (tx) => {
      const [reservation] = await tx.insert(podcastReservationNewTable).values({
        confirmationId: input.confirmationId || null,
        status: input.status || 'confirmed',
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        durationHours: input.durationHours,
        timezone: input.timezone || 'Europe/Paris',
        decorId: input.decorId,
        packOfferId: input.packOfferId,
        themeId: input.themeId,
        customTheme: input.customTheme,
        podcastDescription: input.podcastDescription,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        notes: input.notes,
        metadata: input.metadata,
        totalPrice: input.totalPrice.toFixed(2),
        assignedAdminId: input.assignedAdminId,
        confirmedAt: input.status === 'confirmed' ? new Date() : null,
      }).returning();

      if (input.supplementIds && input.supplementIds.length > 0) {
        const supplements = await tx.query.podcastSupplementServiceTable.findMany({
          where: (s, { inArray }) => inArray(s.id, input.supplementIds!),
        });

        await tx.insert(podcastReservationSupplementTable).values(
          supplements.map(s => ({
            reservationId: reservation.id,
            supplementId: s.id,
            priceAtBooking: s.price,
          })),
        );
      }

      if (input.answers && input.answers.length > 0) {
        await tx.insert(podcastReservationAnswerTable).values(
          input.answers.map((a: any) => ({
            reservationId: reservation.id,
            questionId: a.questionId,
            answerText: a.answerText || null,
            ...(Array.isArray(a.answerOptionIds) && a.answerOptionIds.length > 0
              ? { answerOptionIds: a.answerOptionIds }
              : { answerOptionIds: null }),
          })),
        );
      }

      return this.toModel(reservation);
    });
  }

  async updateSchedule(id: string, data: any): Promise<PodcastReservationNew | null> {
    const db = this.database.getInstance();

    const updateData: any = {
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      durationHours: data.durationHours,
      updatedAt: new Date(),
    };

    if (data.timezone) {
      updateData.timezone = data.timezone;
    }

    if (!data.keepStatus && data.status) {
      updateData.status = data.status;
    }

    const [updated] = await db.update(podcastReservationNewTable)
      .set(updateData)
      .where(eq(podcastReservationNewTable.id, id))
      .returning();

    return updated ? this.toModel(updated) : null;
  }

  async updateStatus(id: string, data: any): Promise<PodcastReservationNew | null> {
    const db = this.database.getInstance();

    const updateData: any = {
      status: data.status,
      updatedAt: new Date(),
    };

    // Set confirmedAt if confirming
    if (data.status === 'confirmed') {
      updateData.confirmedAt = new Date();
    }

    const [updated] = await db.update(podcastReservationNewTable)
      .set(updateData)
      .where(eq(podcastReservationNewTable.id, id))
      .returning();

    return updated ? this.toModel(updated) : null;
  }

  async confirm(id: string, data: {
    finalDate: string;
    finalStartTime: string;
    finalEndTime: string;
    confirmedByAdminId: string;
  }): Promise<PodcastReservationNew | null> {
    const db = this.database.getInstance();

    const [updated] = await db.update(podcastReservationNewTable)
      .set({
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedByAdminId: data.confirmedByAdminId,
        updatedAt: new Date(),
      })
      .where(eq(podcastReservationNewTable.id, id))
      .returning();

    return updated ? this.toModel(updated) : null;
  }

  async cancel(id: string): Promise<PodcastReservationNew | null> {
    const db = this.database.getInstance();

    const [updated] = await db.update(podcastReservationNewTable)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(podcastReservationNewTable.id, id))
      .returning();

    return updated ? this.toModel(updated) : null;
  }

  async checkSlotAvailability(
    startAt: Date,
    endAt: Date,
    excludeReservationId?: string,
  ): Promise<boolean> {
    const db = this.database.getInstance();

    const conditions = [
      eq(podcastReservationNewTable.status, 'confirmed'),
      or(
        and(
          sql`${podcastReservationNewTable.startAt} < ${endAt}`,
          sql`${podcastReservationNewTable.endAt} > ${startAt}`,
        ),
      ),
    ];

    if (excludeReservationId) {
      conditions.push(sql`${podcastReservationNewTable.id} != ${excludeReservationId}`);
    }

    const overlapping = await db.select()
      .from(podcastReservationNewTable)
      .where(and(...conditions));

    return overlapping.length === 0;
  }

  private toModel(entity: any): PodcastReservationNew {
    // Calculate calendar times in UTC for display
    const calendarStart = entity && entity.startAt ? new Date(entity.startAt).toISOString() : undefined;
    const calendarEnd = entity && entity.endAt ? new Date(entity.endAt).toISOString() : undefined;

    return {
      id: entity.id,
      confirmationId: entity.confirmationId || null,
      status: entity.status,
      startAt: entity.startAt,
      endAt: entity.endAt,
      durationHours: entity.durationHours,
      timezone: entity.timezone,
      calendarStart,
      calendarEnd,
      decorId: entity.decorId,
      packOfferId: entity.packOfferId,
      themeId: entity.themeId,
      customTheme: entity.customTheme,
      podcastDescription: entity.podcastDescription,
      customerName: entity.customerName,
      customerEmail: entity.customerEmail,
      customerPhone: entity.customerPhone,
      notes: entity.notes,
      metadata: entity.metadata,
      totalPrice: entity.totalPrice,
      assignedAdminId: entity.assignedAdminId,
      confirmedByAdminId: entity.confirmedByAdminId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      confirmedAt: entity.confirmedAt,
    };
  }
}
