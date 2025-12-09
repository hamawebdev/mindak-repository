import { inject, injectable } from 'inversify';

import type { PodcastAvailabilityService as IPodcastAvailabilityService } from './podcast-availability.service.interface';
import type { TimeSlot, AvailabilityConfig } from '@/domain/models/podcast-reservation-new';
import type { PodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import { PodcastReservationNewRepository as PodcastReservationNewRepositorySymbol } from '@/domain/repositories/podcast-reservation-new-repository.interface';

@injectable()
export class PodcastAvailabilityService implements IPodcastAvailabilityService {
  private readonly config: AvailabilityConfig = {
    slotDurationMin: 60,
    openingHours: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '10:00', end: '16:00' },
      sunday: { start: '00:00', end: '00:00' },
    },
  };

  constructor(
    @inject(PodcastReservationNewRepositorySymbol)
    private readonly reservationRepository: PodcastReservationNewRepository,
  ) { }

  getAvailabilityConfig(): AvailabilityConfig {
    return this.config;
  }

  updateAvailabilityConfig(config: AvailabilityConfig): void {
    this.config.slotDurationMin = config.slotDurationMin;
    this.config.openingHours = config.openingHours;
  }

  async getAvailableSlots(date: string, durationMin: number): Promise<TimeSlot[]> {
    const parsedDate = new Date(date);
    const weekday = this.getWeekdayName(parsedDate.getDay());
    const hours = this.config.openingHours[weekday];

    if (!hours || (hours.start === '00:00' && hours.end === '00:00')) {
      return [];
    }

    const baseSlots = this.generateHourSlots(hours.start, hours.end);
    const confirmedReservations = await this.reservationRepository.findConfirmedByDate(date);

    const blockedIntervals = confirmedReservations.map(r => ({
      start: r.startAt,
      end: r.endAt,
    }));

    return baseSlots.map(slot => ({
      ...slot,
      available: this.checkConsecutiveHoursAvailable(slot.startTime, durationMin, hours.end, blockedIntervals, date),
    }));
  }

  private checkConsecutiveHoursAvailable(
    startTime: string,
    durationMin: number,
    workDayEnd: string,
    blockedIntervals: Array<{ start: Date; end: Date }>,
    date: string,
  ): boolean {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = workDayEnd.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + (endMin || 0);

    if (startMinutes + durationMin > endMinutes) {
      return false;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMin);

    for (const blocked of blockedIntervals) {
      if (startDateTime < blocked.end && endDateTime > blocked.start) {
        return false;
      }
    }

    return true;
  }

  private generateHourSlots(startTime: string, endTime: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: true,
      });
    }

    return slots;
  }

  private getWeekdayName(dayOfWeek: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayOfWeek];
  }


}
