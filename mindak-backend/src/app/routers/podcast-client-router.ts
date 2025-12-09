import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';

@injectable()
class PodcastClientRouter extends BaseRouter {
  constructor(
    @inject(REQUEST_HANDLERS_DI_TYPES.GetFormConfigRequestHandler) private readonly getFormConfigRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetAvailabilityRequestHandler) private readonly getAvailabilityRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreateReservationRequestHandler) private readonly createReservationRequestHandler: IRequestHandler,
  ) {
    super();
  }

  setupRoutes() {
    this.router
      .route('/podcast/form-config')
      .get(this.getFormConfigRequestHandler.handler.bind(this.getFormConfigRequestHandler));

    this.router
      .route('/podcast/availability')
      .get(this.getAvailabilityRequestHandler.handler.bind(this.getAvailabilityRequestHandler));

    this.router
      .route('/podcast/reservations')
      .post(this.createReservationRequestHandler.handler.bind(this.createReservationRequestHandler));
  }
}

export { PodcastClientRouter };
