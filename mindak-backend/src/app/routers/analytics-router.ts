import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import { MIDDLEWARES_DI_TYPES } from '@/container/middlewares/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { ICurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import type { IAuthenticatedMiddleware } from '@/app/middlewares/authenticated-middleware';
import type { IAdminMiddleware } from '@/app/middlewares/admin-middleware';

@injectable()
class AnalyticsRouter extends BaseRouter {
  constructor(
    // Middlewares
    @inject(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware) private readonly currentUserMiddleware: ICurrentUserMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AuthenticatedMiddleware) private readonly authenticatedMiddleware: IAuthenticatedMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AdminMiddleware) private readonly adminMiddleware: IAdminMiddleware,
    // Request Handlers
    @inject(REQUEST_HANDLERS_DI_TYPES.GetDashboardMetricsRequestHandler) private readonly getDashboardMetricsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPodcastAnalyticsRequestHandler) private readonly getPodcastAnalyticsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetServiceAnalyticsRequestHandler) private readonly getServiceAnalyticsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetTrendAnalysisRequestHandler) private readonly getTrendAnalysisRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetTopServicesRequestHandler) private readonly getTopServicesRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetRealtimeDashboardRequestHandler) private readonly getRealtimeDashboardRequestHandler: IRequestHandler,
  ) {
    super();
  }

  setupRoutes() {
    // Apply authentication and admin middleware to all routes
    this.router.use(
      this.currentUserMiddleware.handler.bind(this.currentUserMiddleware),
      this.authenticatedMiddleware.handler.bind(this.authenticatedMiddleware),
      this.adminMiddleware.handler.bind(this.adminMiddleware),
    );

    // Analytics Routes
    this.router.route('/overview')
      .get(this.getDashboardMetricsRequestHandler.handler.bind(this.getDashboardMetricsRequestHandler));

    this.router.route('/podcast')
      .get(this.getPodcastAnalyticsRequestHandler.handler.bind(this.getPodcastAnalyticsRequestHandler));

    this.router.route('/services')
      .get(this.getServiceAnalyticsRequestHandler.handler.bind(this.getServiceAnalyticsRequestHandler));

    this.router.route('/trends')
      .get(this.getTrendAnalysisRequestHandler.handler.bind(this.getTrendAnalysisRequestHandler));

    this.router.route('/top-services')
      .get(this.getTopServicesRequestHandler.handler.bind(this.getTopServicesRequestHandler));

    this.router.route('/realtime')
      .get(this.getRealtimeDashboardRequestHandler.handler.bind(this.getRealtimeDashboardRequestHandler));

    return this.router;
  }
}

export { AnalyticsRouter };

