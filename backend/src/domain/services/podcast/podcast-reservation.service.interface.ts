import type {
  PodcastReservationNew,
  CreatePodcastReservationInput,
  ConfirmReservationInput,
  PodcastReservationStatus
} from '@/domain/models/podcast-reservation-new';

export interface PodcastReservationService {
  createReservation(input: CreatePodcastReservationInput): Promise<PodcastReservationNew>;
  getReservations(filters?: {
    status?: PodcastReservationStatus;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PodcastReservationNew[]>;
  getReservationById(id: string): Promise<PodcastReservationNew | null>;
  getReservationByIdWithDetails(id: string): Promise<PodcastReservationNew | null>;
  confirmReservation(id: string, input: ConfirmReservationInput, adminId: string): Promise<PodcastReservationNew>;
  cancelReservation(id: string): Promise<PodcastReservationNew>;
}

export const PodcastReservationService = Symbol.for('PodcastReservationService');
