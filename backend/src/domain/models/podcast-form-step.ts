export interface PodcastFormStep {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePodcastFormStepInput {
  title: string;
  description?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdatePodcastFormStepInput {
  title?: string;
  description?: string;
  orderIndex?: number;
  isActive?: boolean;
}
