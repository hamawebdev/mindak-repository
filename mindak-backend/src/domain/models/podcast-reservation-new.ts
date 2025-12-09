export type PodcastReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';

export interface PodcastReservationNew {
  id: string;
  confirmationId: string | null;
  status: PodcastReservationStatus;

  startAt: Date;
  endAt: Date;
  durationHours: number;
  timezone: string;

  calendarStart?: string;
  calendarEnd?: string;

  decorId: string | null;
  packOfferId: string | null;
  themeId: string | null;

  customTheme: string | null;
  podcastDescription: string | null;

  customerName: string;
  customerEmail: string;
  customerPhone: string | null;

  notes: string | null;
  metadata: Record<string, unknown> | null;

  totalPrice: string;

  assignedAdminId: string | null;
  confirmedByAdminId: string | null;

  createdAt: Date;
  updatedAt: Date;
  confirmedAt: Date | null;

  supplements?: PodcastReservationSupplement[];
  answers?: PodcastReservationAnswer[];
  decor?: any;
  packOffer?: any;
  theme?: any;
  assignedAdmin?: any;
  confirmedByAdmin?: any;
}

export interface PodcastReservationSupplement {
  id: string;
  reservationId: string;
  supplementId: string;
  priceAtBooking: string;
  supplement?: any;
}

export interface PodcastReservationAnswer {
  id: string;
  reservationId: string;
  questionId: string;
  answerText: string | null;
  answerOptionIds: string[] | null;
  createdAt: Date;
  question?: any;
}

export interface CreatePodcastReservationInput {
  requestedDate: string;
  requestedStartTime: string;
  timezone?: string;
  decorId?: string;
  packOfferId: string;
  themeId?: string;
  customTheme?: string;
  podcastDescription?: string;
  supplementIds?: string[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  answers: Array<{
    questionId: string;
    answerText?: string;
    answerOptionIds?: string[];
  }>;
}

export interface AdminCreateReservationInput {
  startAt: string;
  endAt: string;
  timezone?: string;
  status?: PodcastReservationStatus;
  decorId?: string;
  packOfferId?: string;
  themeId?: string;
  customTheme?: string;
  podcastDescription?: string;
  supplementIds?: string[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  assignedAdminId?: string;
  answers?: Array<{
    questionId: string;
    answerText?: string;
    answerOptionIds?: string[];
  }>;
}

export interface ConfirmReservationInput {
  finalDate?: string;
  finalStartTime?: string;
}

export interface UpdateScheduleInput {
  startAt: string;
  endAt: string;
  timezone?: string;
  keepStatus?: boolean;
  status?: PodcastReservationStatus;
  reason?: string;
}

export interface UpdateStatusInput {
  status: PodcastReservationStatus;
  notes?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityConfig {
  slotDurationMin: number;
  openingHours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
}
