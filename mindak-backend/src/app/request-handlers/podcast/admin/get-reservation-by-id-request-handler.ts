import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { PodcastReservationService } from '@/domain/services/podcast/podcast-reservation.service.interface';
import { PodcastReservationService as PodcastReservationServiceSymbol } from '@/domain/services/podcast/podcast-reservation.service.interface';
import { HttpError } from '@/app/http-error';

@injectable()
export class GetReservationByIdRequestHandler implements IRequestHandler {
  constructor(
    @inject(PodcastReservationServiceSymbol) private readonly reservationService: PodcastReservationService,
  ) {}

  async handler(req: Request, res: Response) {
    const { id } = req.params;

    const reservation = await this.reservationService.getReservationByIdWithDetails(id);
    if (!reservation) {
      throw HttpError.notFound('Reservation not found', { code: 'RESERVATION_NOT_FOUND' });
    }

    res.status(200).send({
      success: true,
      data: {
        id: reservation.id,
        status: reservation.status,
        requestedDate: reservation.startAt.toISOString().split('T')[0],
        requestedStartTime: reservation.startAt.toISOString().split('T')[1].substring(0, 5),
        requestedEndTime: reservation.endAt.toISOString().split('T')[1].substring(0, 5),
        finalDate: reservation.startAt.toISOString().split('T')[0],
        finalStartTime: reservation.startAt.toISOString().split('T')[1].substring(0, 5),
        finalEndTime: reservation.endAt.toISOString().split('T')[1].substring(0, 5),
        decor: reservation.decor ? {
          id: reservation.decor.id,
          name: reservation.decor.name,
        } : null,
        packOffer: reservation.packOffer ? {
          id: reservation.packOffer.id,
          name: reservation.packOffer.name,
          durationMin: reservation.packOffer.durationMin,
        } : null,
        supplements: reservation.supplements?.map(s => ({
          id: s.supplement.id,
          name: s.supplement.name,
          priceAtBooking: parseFloat(s.priceAtBooking),
        })) || [],
        customer: {
          name: reservation.customerName,
          email: reservation.customerEmail,
          phone: reservation.customerPhone,
        },
        answers: reservation.answers?.map(a => ({
          questionId: a.questionId,
          fieldName: a.question.fieldName,
          label: a.question.label,
          value: a.answerText || a.answerOptionIds,
        })) || [],
        notes: reservation.notes,
        totalPrice: parseFloat(reservation.totalPrice),
        createdAt: reservation.createdAt,
        confirmedAt: reservation.confirmedAt,
      },
    });
  }
}
