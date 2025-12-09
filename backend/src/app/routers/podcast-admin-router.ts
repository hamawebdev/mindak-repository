import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';

@injectable()
class PodcastAdminRouter extends BaseRouter {
  constructor(
    @inject(REQUEST_HANDLERS_DI_TYPES.ListPodcastReservationsRequestHandler) private readonly getReservationsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPodcastReservationDetailsRequestHandler) private readonly getReservationByIdRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastReservationStatusRequestHandler) private readonly confirmReservationRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastReservationStatusRequestHandler) private readonly cancelReservationRequestHandler: IRequestHandler,
  ) {
    super();
  }

  setupRoutes() {
    this.router
      .route('/podcast/reservations')
      .get(this.getReservationsRequestHandler.handler.bind(this.getReservationsRequestHandler));

    this.router
      .route('/podcast/reservations/:id')
      .get(this.getReservationByIdRequestHandler.handler.bind(this.getReservationByIdRequestHandler));

    this.router
      .route('/podcast/reservations/:id/confirm')
      .post(this.confirmReservationRequestHandler.handler.bind(this.confirmReservationRequestHandler));

    this.router
      .route('/podcast/reservations/:id/cancel')
      .post(this.cancelReservationRequestHandler.handler.bind(this.cancelReservationRequestHandler));
  }
}

export { PodcastAdminRouter };
