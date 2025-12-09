import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastAvailabilityService } from '@/domain/services/podcast/podcast-availability.service.interface';
import { PodcastAvailabilityServiceSymbol } from '@/domain/services/podcast/podcast-availability.service.interface';

const dayScheduleSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const bodySchema = z.object({
  slotDurationMin: z.number().int().positive(),
  openingHours: z.object({
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema,
  }),
});

@injectable()
export class UpdateAvailabilityConfigRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastAvailabilityServiceSymbol) private readonly availabilityService: PodcastAvailabilityService,
  ) { }

  async handler(req: Request, res: Response) {
    const config = bodySchema.parse(req.body);

    this.availabilityService.updateAvailabilityConfig(config);

    res.status(200).send({
      success: true,
      data: config,
    });
  }
}
