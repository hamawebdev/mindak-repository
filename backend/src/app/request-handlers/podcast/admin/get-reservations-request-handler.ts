import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastReservationService } from '@/domain/services/podcast/podcast-reservation.service.interface';
import { PodcastReservationService as PodcastReservationServiceSymbol } from '@/domain/services/podcast/podcast-reservation.service.interface';

const querySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'rejected']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  search: z.string().optional(),
});

@injectable()
export class GetReservationsRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastReservationServiceSymbol) private readonly reservationService: PodcastReservationService,
  ) {}

  async handler(req: Request, res: Response) {
    const filters = querySchema.parse(req.query);

    const reservations = await this.reservationService.getReservations(filters);

    res.status(200).send({
      success: true,
      data: reservations.map(r => ({
        id: r.id,
        status: r.status,
        requestedDate: r.startAt.toISOString().split('T')[0],
        requestedStartTime: r.startAt.toISOString().split('T')[1].substring(0, 5),
        requestedEndTime: r.endAt.toISOString().split('T')[1].substring(0, 5),
        finalDate: r.startAt.toISOString().split('T')[0],
        finalStartTime: r.startAt.toISOString().split('T')[1].substring(0, 5),
        finalEndTime: r.endAt.toISOString().split('T')[1].substring(0, 5),
        customerName: r.customerName,
        customerEmail: r.customerEmail,
        customerPhone: r.customerPhone,
        totalPrice: parseFloat(r.totalPrice),
        createdAt: r.createdAt,
        confirmedAt: r.confirmedAt,
      })),
    });
  }
}
