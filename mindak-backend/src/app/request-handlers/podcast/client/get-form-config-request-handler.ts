import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastDecorRepository } from '@/domain/repositories/podcast-decor-repository.interface';
import type { PodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import type { PodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import type { PodcastFormQuestionRepository } from '@/domain/repositories/podcast-form-question-repository.interface';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';
import type { PodcastAvailabilityService } from '@/domain/services/podcast/podcast-availability.service.interface';
import { PodcastDecorRepository as PodcastDecorRepositorySymbol } from '@/domain/repositories/podcast-decor-repository.interface';
import { PodcastPackOfferRepository as PodcastPackOfferRepositorySymbol } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import { PodcastSupplementServiceRepository as PodcastSupplementServiceRepositorySymbol } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import { PodcastFormQuestionRepository as PodcastFormQuestionRepositorySymbol } from '@/domain/repositories/podcast-form-question-repository.interface';
import { PodcastThemeRepository as PodcastThemeRepositorySymbol } from '@/domain/repositories/podcast-theme-repository.interface';
import { PodcastAvailabilityServiceSymbol } from '@/domain/services/podcast/podcast-availability.service.interface';

@injectable()
export class GetFormConfigRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastDecorRepositorySymbol) private readonly decorRepository: PodcastDecorRepository,
    @inject(PodcastPackOfferRepositorySymbol) private readonly packOfferRepository: PodcastPackOfferRepository,
    @inject(PodcastSupplementServiceRepositorySymbol) private readonly supplementRepository: PodcastSupplementServiceRepository,
    @inject(PodcastFormQuestionRepositorySymbol) private readonly questionRepository: PodcastFormQuestionRepository,
    @inject(PodcastThemeRepositorySymbol) private readonly themeRepository: IPodcastThemeRepository,
    @inject(PodcastAvailabilityServiceSymbol) private readonly availabilityService: PodcastAvailabilityService,
  ) {}

  async handler(req: Request, res: Response) {
    const [decorOptions, packOffers, supplementServices, questions, themes] = await Promise.all([
      this.decorRepository.findAllActive(),
      this.packOfferRepository.findAllActive(),
      this.supplementRepository.findAllActive(),
      this.questionRepository.findAllActiveWithOptions(),
      this.themeRepository.findAll(true),
    ]);

    const availabilityConfig = this.availabilityService.getAvailabilityConfig();

    res.status(200).send({
      success: true,
      data: {
        decorOptions: decorOptions.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          imageUrl: d.imageUrl,
        })),
        themes: themes.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
        })),
        packOffers: packOffers.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          metadata: p.metadata,
          basePrice: parseFloat(p.basePrice),
          durationMin: p.durationMin,
        })),
        supplementServices: supplementServices.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: parseFloat(s.price),
        })),
        questions: questions.map(q => ({
          id: q.id,
          label: q.label,
          fieldName: q.fieldName,
          questionType: q.questionType,
          isRequired: q.isRequired,
          helpText: q.helpText,
          options: q.options?.map(o => ({
            id: o.id,
            value: o.value,
            label: o.label,
          })) || [],
        })),
        availabilityConfig,
      },
    });
  }
}
