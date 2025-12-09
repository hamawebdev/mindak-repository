import type {
  PodcastReservationNew,
  CreatePodcastReservationInput,
  AdminCreateReservationInput,
  UpdateScheduleInput,
  UpdateStatusInput,
  PodcastReservationStatus
} from '@/domain/models/podcast-reservation-new';

export interface PodcastReservationNewRepository {
  findAll(filters?: {
    status?: PodcastReservationStatus;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PodcastReservationNew[]>;

  findById(id: string): Promise<PodcastReservationNew | null>;
  findByIdWithDetails(id: string): Promise<PodcastReservationNew | null>;

  findConfirmedByDateRange(startDate: Date, endDate: Date): Promise<PodcastReservationNew[]>;
  findPendingByDateRange(startDate: Date, endDate: Date): Promise<PodcastReservationNew[]>;

  findConfirmedByDate(date: string): Promise<PodcastReservationNew[]>;

  getConfirmationSequence(year: number): Promise<number>;

  create(input: CreatePodcastReservationInput & {
    startAt: Date;
    endAt: Date;
    durationHours: number;
    totalPrice: number;
  }): Promise<PodcastReservationNew>;

  adminCreate(input: AdminCreateReservationInput & {
    durationHours: number;
    totalPrice: number;
    confirmationId?: string;
  }): Promise<PodcastReservationNew>;

  updateSchedule(id: string, data: UpdateScheduleInput & {
    durationHours: number;
  }): Promise<PodcastReservationNew | null>;

  updateStatus(id: string, data: UpdateStatusInput): Promise<PodcastReservationNew | null>;

  cancel(id: string): Promise<PodcastReservationNew | null>;

  checkSlotAvailability(startAt: Date, endAt: Date, excludeReservationId?: string): Promise<boolean>;

  confirm(id: string, data: {
    finalDate: string;
    finalStartTime: string;
    finalEndTime: string;
    confirmedByAdminId: string;
  }): Promise<PodcastReservationNew | null>;
}

export const PodcastReservationNewRepository = Symbol.for('PodcastReservationNewRepository');
