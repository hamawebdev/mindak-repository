import type { TimeSlot, AvailabilityConfig } from '@/domain/models/podcast-reservation-new';

export interface PodcastAvailabilityService {
  getAvailableSlots(date: string, packDurationMin: number): Promise<TimeSlot[]>;
  getAvailabilityConfig(): AvailabilityConfig;
  updateAvailabilityConfig(config: AvailabilityConfig): void;
}

export const PodcastAvailabilityServiceSymbol = Symbol.for('PodcastAvailabilityService');
