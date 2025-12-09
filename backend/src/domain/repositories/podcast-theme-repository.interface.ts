import type { CreatePodcastThemeInput, PodcastTheme, UpdatePodcastThemeInput } from '../models/podcast-theme';

export interface IPodcastThemeRepository {
  create(input: CreatePodcastThemeInput): Promise<PodcastTheme>;
  update(id: string, input: UpdatePodcastThemeInput): Promise<PodcastTheme | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<PodcastTheme | null>;
  findAll(activeOnly?: boolean): Promise<PodcastTheme[]>;
}

export const PodcastThemeRepository = Symbol.for('PodcastThemeRepository');
