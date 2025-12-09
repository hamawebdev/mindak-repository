import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastDecorRepository } from '@/domain/repositories/podcast-decor-repository.interface';
import { PodcastDecorRepository as PodcastDecorRepositorySymbol } from '@/domain/repositories/podcast-decor-repository.interface';

/**
 * Request handler for fetching all active podcast decors for admin reservation creation/editing
 */
@injectable()
export class GetDecorsRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastDecorRepositorySymbol) private readonly decorRepository: PodcastDecorRepository,
  ) {}

  async handler(req: Request, res: Response) {
    // Fetch all active decors
    const decors = await this.decorRepository.findAllActive();

    res.status(200).send({
      success: true,
      data: decors.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        imageUrl: d.imageUrl,
        sortOrder: d.sortOrder,
      })),
    });
  }
}
