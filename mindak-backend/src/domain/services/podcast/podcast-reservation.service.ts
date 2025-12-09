import { inject, injectable } from 'inversify';

import type { PodcastReservationService as IPodcastReservationService } from './podcast-reservation.service.interface';
import type {
  PodcastReservationNew,
  CreatePodcastReservationInput,
  ConfirmReservationInput,
  PodcastReservationStatus
} from '@/domain/models/podcast-reservation-new';
import type { PodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import type { PodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import type { PodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';
import { PodcastReservationNewRepository as PodcastReservationNewRepositorySymbol } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import { PodcastPackOfferRepository as PodcastPackOfferRepositorySymbol } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import { PodcastSupplementServiceRepository as PodcastSupplementServiceRepositorySymbol } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import { PodcastThemeRepository as PodcastThemeRepositorySymbol } from '@/domain/repositories/podcast-theme-repository.interface';
import { HttpError } from '@/app/http-error';

@injectable()
export class PodcastReservationService implements IPodcastReservationService {
  constructor(
    @inject(PodcastReservationNewRepositorySymbol)
    private readonly reservationRepository: PodcastReservationNewRepository,
    @inject(PodcastPackOfferRepositorySymbol)
    private readonly packOfferRepository: PodcastPackOfferRepository,
    @inject(PodcastSupplementServiceRepositorySymbol)
    private readonly supplementRepository: PodcastSupplementServiceRepository,
    @inject(PodcastThemeRepositorySymbol)
    private readonly themeRepository: IPodcastThemeRepository,
  ) {}

  async createReservation(input: CreatePodcastReservationInput): Promise<PodcastReservationNew> {
    const packOffer = await this.packOfferRepository.findById(input.packOfferId);
    if (!packOffer) {
      throw HttpError.badRequest('Pack offer not found', { code: 'INVALID_PACK_OFFER' });
    }

    if (input.themeId) {
      const theme = await this.themeRepository.findById(input.themeId);
      if (!theme) {
        throw HttpError.badRequest('Theme not found', { code: 'INVALID_THEME' });
      }
    }

    const supplements = input.supplementIds && input.supplementIds.length > 0
      ? await this.supplementRepository.findByIds(input.supplementIds)
      : [];

    const requestedStartTime = input.requestedStartTime;

    const startAt = new Date(`${input.requestedDate}T${requestedStartTime}:00`);
    const durationHours = packOffer.durationMin / 60;
    const endAt = new Date(startAt.getTime() + packOffer.durationMin * 60000);

    const basePrice = parseFloat(packOffer.basePrice);
    const supplementsTotal = supplements.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const totalPrice = basePrice + supplementsTotal;

    return await this.reservationRepository.create({
      ...input,
      startAt,
      endAt,
      durationHours,
      totalPrice,
    });
  }

  async getReservations(filters?: {
    status?: PodcastReservationStatus;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PodcastReservationNew[]> {
    return await this.reservationRepository.findAll(filters);
  }

  async getReservationById(id: string): Promise<PodcastReservationNew | null> {
    return await this.reservationRepository.findById(id);
  }

  async getReservationByIdWithDetails(id: string): Promise<PodcastReservationNew | null> {
    return await this.reservationRepository.findByIdWithDetails(id);
  }

  async confirmReservation(
    id: string,
    input: ConfirmReservationInput,
    adminId: string,
  ): Promise<PodcastReservationNew> {
    const reservation = await this.reservationRepository.findByIdWithDetails(id);
    if (!reservation) {
      throw HttpError.notFound('Reservation not found', { code: 'RESERVATION_NOT_FOUND' });
    }

    if (reservation.status !== 'pending') {
      throw HttpError.conflict('Reservation is not in pending status', { code: 'RESERVATION_NOT_PENDING' });
    }

    const requestedDate = reservation.startAt.toISOString().split('T')[0];
    const requestedStartTime = reservation.startAt.toISOString().split('T')[1].substring(0, 5);

    const finalDate = input.finalDate || requestedDate;
    const finalStartTime = input.finalStartTime || requestedStartTime;

    const packOffer = reservation.packOffer;
    if (!packOffer) {
      throw HttpError.badRequest('Pack offer not found', { code: 'PACK_OFFER_NOT_FOUND' });
    }

    const finalEndTime = this.addMinutesToTime(finalStartTime, packOffer.durationMin);
    const startAt = new Date(`${finalDate}T${finalStartTime}:00`);
    const endAt = new Date(startAt.getTime() + packOffer.durationMin * 60000);

    const isAvailable = await this.reservationRepository.checkSlotAvailability(
      startAt,
      endAt,
      id,
    );

    if (!isAvailable) {
      throw HttpError.conflict('The selected time slot is no longer available', { code: 'SLOT_ALREADY_BOOKED' });
    }

    const confirmed = await this.reservationRepository.confirm(id, {
      finalDate,
      finalStartTime,
      finalEndTime,
      confirmedByAdminId: adminId,
    });

    if (!confirmed) {
      throw HttpError.internalServerError('Failed to confirm reservation', undefined, { code: 'CONFIRMATION_FAILED' });
    }

    return confirmed;
  }

  async cancelReservation(id: string): Promise<PodcastReservationNew> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw HttpError.notFound('Reservation not found', { code: 'RESERVATION_NOT_FOUND' });
    }

    const cancelled = await this.reservationRepository.cancel(id);
    if (!cancelled) {
      throw HttpError.internalServerError('Failed to cancel reservation', undefined, { code: 'CANCELLATION_FAILED' });
    }

    return cancelled;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }
}
