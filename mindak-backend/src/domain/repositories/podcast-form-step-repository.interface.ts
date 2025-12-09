import type { PodcastFormStep, CreatePodcastFormStepInput, UpdatePodcastFormStepInput } from '@/domain/models/podcast-form-step';

export interface PodcastFormStepRepository {
  findAll(): Promise<PodcastFormStep[]>;
  findAllActive(): Promise<PodcastFormStep[]>;
  findById(id: string): Promise<PodcastFormStep | null>;
  create(input: CreatePodcastFormStepInput): Promise<PodcastFormStep>;
  update(id: string, input: UpdatePodcastFormStepInput): Promise<PodcastFormStep | null>;
  delete(id: string): Promise<boolean>;
}

export const PodcastFormStepRepository = Symbol.for('PodcastFormStepRepository');
