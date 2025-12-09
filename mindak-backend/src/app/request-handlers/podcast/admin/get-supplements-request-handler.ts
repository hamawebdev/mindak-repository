import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import { PodcastSupplementServiceRepository as PodcastSupplementServiceRepositorySymbol } from '@/domain/repositories/podcast-supplement-service-repository.interface';

/**
 * Request handler for fetching all active podcast supplement services for admin reservation creation/editing
 */
@injectable()
export class GetSupplementsRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastSupplementServiceRepositorySymbol) private readonly supplementRepository: PodcastSupplementServiceRepository,
  ) { }

  async handler(req: Request, res: Response) {
    // Fetch all active supplement services
    const supplements = await this.supplementRepository.findAllActive();

    res.status(200).send({
      success: true,
      data: supplements.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: parseFloat(s.price),
        sortOrder: s.sortOrder,
      })),
    });
  }
}
