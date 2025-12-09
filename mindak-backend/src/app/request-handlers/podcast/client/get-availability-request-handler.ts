import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { z } from 'zod';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastAvailabilityService } from '@/domain/services/podcast/podcast-availability.service.interface';
import type { PodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import { PodcastAvailabilityServiceSymbol } from '@/domain/services/podcast/podcast-availability.service.interface';
import { PodcastPackOfferRepository as PodcastPackOfferRepositorySymbol } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import { HttpError } from '@/app/http-error';

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  packOfferId: z.string().uuid().optional().or(z.literal('')),
  duration: z.coerce.number().int().positive().optional(),
}).refine(data => (data.packOfferId && data.packOfferId !== '') || data.duration, {
  message: 'Either packOfferId or duration must be provided',
});

@injectable()
export class GetAvailabilityRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastAvailabilityServiceSymbol) private readonly availabilityService: PodcastAvailabilityService,
    @inject(PodcastPackOfferRepositorySymbol) private readonly packOfferRepository: PodcastPackOfferRepository,
  ) {}

  async handler(req: Request, res: Response) {
    const { date, packOfferId, duration } = querySchema.parse(req.query);

    // Default to today if date is not provided
    const targetDate = date ?? new Date().toISOString().split('T')[0];

    let durationMin: number;

    if (packOfferId && packOfferId !== '') {
      const packOffer = await this.packOfferRepository.findById(packOfferId);
      if (!packOffer) {
        throw HttpError.badRequest('Pack offer not found', { code: 'INVALID_PACK_OFFER' });
      }
      durationMin = packOffer.durationMin;
    } else {
      // If duration is provided directly (in minutes or hours?)
      // Assuming minutes to match packOffer.durationMin
      // If it's hours, we might need to multiply by 60.
      // But given we use "duration" generic name, usually it's the base unit.
      // However, if spec says "Whole hours", admin might send 60, 120.
      // Safe to assume it is in minutes for now as per existing patterns.
      durationMin = duration!;
    }


    const slots = await this.availabilityService.getAvailableSlots(targetDate, durationMin);

    res.status(200).send({
      success: true,
      data: {
        date: targetDate,
        availableSlots: slots.filter(s => s.available).map(s => ({
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        unavailableSlots: slots.filter(s => !s.available).map(s => ({
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      },
    });
  }
}
