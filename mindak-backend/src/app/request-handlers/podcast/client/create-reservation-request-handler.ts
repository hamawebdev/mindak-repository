import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastReservationService } from '@/domain/services/podcast/podcast-reservation.service.interface';
import { PodcastReservationService as PodcastReservationServiceSymbol } from '@/domain/services/podcast/podcast-reservation.service.interface';

const answerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().optional(),
  answerOptionIds: z.array(z.string()).optional(),
});

const createReservationSchema = z.object({
  decorId: z.string().uuid().optional(),
  packOfferId: z.string().uuid(),
  supplementIds: z.array(z.string().uuid()).optional(),
  themeId: z.string().uuid().optional(),
  customTheme: z.string().optional(),
  podcastDescription: z.string(),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().max(255),
  customerPhone: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  answers: z.array(answerSchema),
}).refine(data => data.themeId || data.customTheme, {
  message: 'Either themeId or customTheme must be provided',
  path: ['themeId']
});

@injectable()
export class CreateReservationRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastReservationServiceSymbol) private readonly reservationService: PodcastReservationService,
  ) {}

  async handler(req: Request, res: Response) {
    const input = createReservationSchema.parse(req.body);

    const reservation = await this.reservationService.createReservation(input);

    res.status(201).send({
      success: true,
      data: {
        id: reservation.id,
        status: reservation.status,
        message: 'Reservation submitted successfully. Awaiting confirmation.',
      },
    });
  }
}
