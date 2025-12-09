import type { PodcastSupplementService, CreatePodcastSupplementServiceInput, UpdatePodcastSupplementServiceInput } from '@/domain/models/podcast-supplement-service';

export interface PodcastSupplementServiceRepository {
  findAll(): Promise<PodcastSupplementService[]>;
  findAllActive(): Promise<PodcastSupplementService[]>;
  findById(id: string): Promise<PodcastSupplementService | null>;
  findByIds(ids: string[]): Promise<PodcastSupplementService[]>;
  create(input: CreatePodcastSupplementServiceInput): Promise<PodcastSupplementService>;
  update(id: string, input: UpdatePodcastSupplementServiceInput): Promise<PodcastSupplementService | null>;
  delete(id: string): Promise<boolean>;
}

export const PodcastSupplementServiceRepository = Symbol.for('PodcastSupplementServiceRepository');
