import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import { PodcastPackOfferRepository as PodcastPackOfferRepositorySymbol } from '@/domain/repositories/podcast-pack-offer-repository.interface';

/**
 * Request handler for fetching all active podcast pack offers for admin reservation creation/editing
 */
@injectable()
export class GetPacksRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastPackOfferRepositorySymbol) private readonly packOfferRepository: PodcastPackOfferRepository,
  ) { }

  async handler(req: Request, res: Response) {
    // Fetch all active pack offers
    const packs = await this.packOfferRepository.findAllActive();

    res.status(200).send({
      success: true,
      data: packs.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        metadata: p.metadata,
        basePrice: parseFloat(p.basePrice),
        durationMin: p.durationMin,
        sortOrder: p.sortOrder,
      })),
    });
  }
}
