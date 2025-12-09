import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastReservationService } from '@/domain/services/podcast/podcast-reservation.service.interface';
import { PodcastReservationService as PodcastReservationServiceSymbol } from '@/domain/services/podcast/podcast-reservation.service.interface';

@injectable()
export class CancelReservationRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastReservationServiceSymbol) private readonly reservationService: PodcastReservationService,
  ) {}

  async handler(req: Request, res: Response) {
    const { id } = req.params;

    const reservation = await this.reservationService.cancelReservation(id);

    res.status(200).send({
      success: true,
      data: {
        id: reservation.id,
        status: reservation.status,
        message: 'Reservation has been cancelled.',
      },
    });
  }
}
