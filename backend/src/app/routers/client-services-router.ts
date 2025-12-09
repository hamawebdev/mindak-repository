import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';

@injectable()
class ClientServicesRouter extends BaseRouter {
  constructor(
    // Services
    @inject(REQUEST_HANDLERS_DI_TYPES.GetActiveServicesRequestHandler) private readonly getActiveServicesRequestHandler: IRequestHandler,
  ) {
    super();
  }

  setupRoutes() {
    // Client Services Routes (Public - No authentication required)
    this.router
      .route('/services')
      .get(this.getActiveServicesRequestHandler.handler.bind(this.getActiveServicesRequestHandler));
  }
}

export { ClientServicesRouter };

