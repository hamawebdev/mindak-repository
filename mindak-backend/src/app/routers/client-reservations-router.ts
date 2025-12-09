import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';

@injectable()
class ClientReservationsRouter extends BaseRouter {
  constructor(
    @inject(REQUEST_HANDLERS_DI_TYPES.SubmitPodcastReservationRequestHandler) private readonly submitPodcastReservationRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.SubmitServiceReservationRequestHandler) private readonly submitServiceReservationRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetReservationConfirmationRequestHandler) private readonly getReservationConfirmationRequestHandler: IRequestHandler,
  ) {
    super();
  }

  setupRoutes() {
    // Public routes - no authentication required
    this.router.route('/podcast')
      .post(this.submitPodcastReservationRequestHandler.handler.bind(this.submitPodcastReservationRequestHandler));

    this.router.route('/services')
      .post(this.submitServiceReservationRequestHandler.handler.bind(this.submitServiceReservationRequestHandler));

    this.router.route('/:confirmationId/confirmation')
      .get(this.getReservationConfirmationRequestHandler.handler.bind(this.getReservationConfirmationRequestHandler));
  }
}

export { ClientReservationsRouter };

