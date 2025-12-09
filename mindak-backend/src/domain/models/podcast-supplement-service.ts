export interface PodcastSupplementService {
  id: string;
  name: string;
  description: string | null;
  price: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePodcastSupplementServiceInput {
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePodcastSupplementServiceInput {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  sortOrder?: number;
}
