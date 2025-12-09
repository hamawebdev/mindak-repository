export interface PodcastPackMetadataItem {
  key: string;
  label: string;
  value: string | number | boolean | string[];
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'list';
}

export interface PodcastPackOffer {
  id: string;
  name: string;
  description: string | null; // Deprecated
  metadata: PodcastPackMetadataItem[] | null;
  basePrice: string;
  durationMin: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePodcastPackOfferInput {
  name: string;
  description?: string; // Deprecated
  metadata?: PodcastPackMetadataItem[];
  basePrice: number;
  durationMin: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePodcastPackOfferInput {
  name?: string;
  description?: string; // Deprecated
  metadata?: PodcastPackMetadataItem[];
  basePrice?: number;
  durationMin?: number;
  isActive?: boolean;
  sortOrder?: number;
}
