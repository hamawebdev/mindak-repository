import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastAvailabilityService } from '@/domain/services/podcast/podcast-availability.service.interface';
import { PodcastAvailabilityServiceSymbol } from '@/domain/services/podcast/podcast-availability.service.interface';

@injectable()
export class GetAvailabilityConfigRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastAvailabilityServiceSymbol) private readonly availabilityService: PodcastAvailabilityService,
  ) { }

  async handler(req: Request, res: Response) {
    const availabilityConfig = this.availabilityService.getAvailabilityConfig();

    res.status(200).send({
      success: true,
      data: availabilityConfig,
    });
  }
}
