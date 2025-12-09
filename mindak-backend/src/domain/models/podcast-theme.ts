export interface PodcastTheme {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePodcastThemeInput {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePodcastThemeInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}
