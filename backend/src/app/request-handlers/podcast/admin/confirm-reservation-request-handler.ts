import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastReservationService } from '@/domain/services/podcast/podcast-reservation.service.interface';
import { PodcastReservationService as PodcastReservationServiceSymbol } from '@/domain/services/podcast/podcast-reservation.service.interface';

const confirmSchema = z.object({
  finalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  finalStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

@injectable()
export class ConfirmReservationRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastReservationServiceSymbol) private readonly reservationService: PodcastReservationService,
  ) {}

  async handler(req: Request, res: Response) {
    const { id } = req.params;
    const input = confirmSchema.parse(req.body);

    const adminId = (req as any).user?.id;
    if (!adminId) {
      throw new Error('Admin user not authenticated');
    }

    const reservation = await this.reservationService.confirmReservation(id, input, adminId);

    res.status(200).send({
      success: true,
      data: {
        id: reservation.id,
        status: reservation.status,
        finalDate: reservation.startAt.toISOString().split('T')[0],
        finalStartTime: reservation.startAt.toISOString().split('T')[1].substring(0, 5),
        finalEndTime: reservation.endAt.toISOString().split('T')[1].substring(0, 5),
        message: 'Reservation has been confirmed and the slot is now blocked.',
      },
    });
  }
}
