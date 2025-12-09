import type { PodcastDecor, CreatePodcastDecorInput, UpdatePodcastDecorInput } from '@/domain/models/podcast-decor';

export interface PodcastDecorRepository {
  findAll(): Promise<PodcastDecor[]>;
  findAllActive(): Promise<PodcastDecor[]>;
  findById(id: string): Promise<PodcastDecor | null>;
  create(input: CreatePodcastDecorInput): Promise<PodcastDecor>;
  update(id: string, input: UpdatePodcastDecorInput): Promise<PodcastDecor | null>;
  delete(id: string): Promise<boolean>;
  isInUse(id: string): Promise<boolean>;
}

export const PodcastDecorRepository = Symbol.for('PodcastDecorRepository');
