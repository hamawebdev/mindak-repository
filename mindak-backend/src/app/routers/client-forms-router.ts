import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';

@injectable()
class ClientFormsRouter extends BaseRouter {
  constructor(
    @inject(REQUEST_HANDLERS_DI_TYPES.GetClientPodcastQuestionsRequestHandler) private readonly getClientPodcastQuestionsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetClientServicesQuestionsRequestHandler) private readonly getClientServicesQuestionsRequestHandler: IRequestHandler,
  ) {
    super();
  }

  setupRoutes() {
    // Public routes - no authentication required
    this.router.route('/podcast/questions')
      .get(this.getClientPodcastQuestionsRequestHandler.handler.bind(this.getClientPodcastQuestionsRequestHandler));

    this.router.route('/services/questions')
      .get(this.getClientServicesQuestionsRequestHandler.handler.bind(this.getClientServicesQuestionsRequestHandler));
  }
}

export { ClientFormsRouter };

