import type { PodcastPackOffer, CreatePodcastPackOfferInput, UpdatePodcastPackOfferInput } from '@/domain/models/podcast-pack-offer';

export interface PodcastPackOfferRepository {
  findAll(): Promise<PodcastPackOffer[]>;
  findAllActive(): Promise<PodcastPackOffer[]>;
  findById(id: string): Promise<PodcastPackOffer | null>;
  create(input: CreatePodcastPackOfferInput): Promise<PodcastPackOffer>;
  update(id: string, input: UpdatePodcastPackOfferInput): Promise<PodcastPackOffer | null>;
  delete(id: string): Promise<boolean>;
}

export const PodcastPackOfferRepository = Symbol.for('PodcastPackOfferRepository');
