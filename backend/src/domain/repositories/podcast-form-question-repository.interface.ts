import type {
  PodcastFormQuestion,
  PodcastFormQuestionOption,
  CreatePodcastFormQuestionInput,
  UpdatePodcastFormQuestionInput,
  CreatePodcastFormQuestionOptionInput
} from '@/domain/models/podcast-form-question';

export interface PodcastFormQuestionRepository {
  findAll(): Promise<PodcastFormQuestion[]>;
  findAllActive(): Promise<PodcastFormQuestion[]>;
  findAllActiveWithOptions(): Promise<PodcastFormQuestion[]>;
  findById(id: string): Promise<PodcastFormQuestion | null>;
  create(input: CreatePodcastFormQuestionInput): Promise<PodcastFormQuestion>;
  update(id: string, input: UpdatePodcastFormQuestionInput): Promise<PodcastFormQuestion | null>;
  delete(id: string): Promise<boolean>;

  createOption(input: CreatePodcastFormQuestionOptionInput): Promise<PodcastFormQuestionOption>;
  findOptionsByQuestionId(questionId: string): Promise<PodcastFormQuestionOption[]>;
  deleteOption(optionId: string): Promise<boolean>;
}

export const PodcastFormQuestionRepository = Symbol.for('PodcastFormQuestionRepository');
