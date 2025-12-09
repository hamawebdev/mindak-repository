import { injectable } from 'inversify';

@injectable()
export class PodcastValidationService {
  validateDuration(startAt: Date, endAt: Date): { valid: boolean; durationMinutes: number; durationHours: number } {
    const durationMs = endAt.getTime() - startAt.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;

    const valid = durationMinutes > 0 && durationMinutes % 60 === 0;

    return {
      valid,
      durationMinutes,
      durationHours,
    };
  }

  generateConfirmationId(year: number, sequence: number): string {
    const sequenceStr = sequence.toString().padStart(4, '0');
    return `CONF-${year}-${sequenceStr}`;
  }

  async getNextSequence(year: number, getCountFn: (year: number) => Promise<number>): Promise<number> {
    const count = await getCountFn(year);
    return count + 1;
  }

  calculateEndAt(startAt: Date, durationHours: number): Date {
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + durationHours);
    return endAt;
  }

  validateHourBoundary(date: Date): boolean {
    return date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
  }
}

export const PodcastValidationServiceSymbol = Symbol.for('PodcastValidationService');
