import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { ROUTERS_DI_TYPES } from '@/container/routers/di-types';

@injectable()
class ApiRouter extends BaseRouter {
  constructor(
    @inject(ROUTERS_DI_TYPES.AuthRouter) private readonly authRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.UsersRouter) private readonly usersRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.HealthRouter) private readonly healthRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.AdminFormsRouter) private readonly adminFormsRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.ClientFormsRouter) private readonly clientFormsRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.AdminServicesRouter) private readonly adminServicesRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.ClientServicesRouter) private readonly clientServicesRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.AdminReservationsRouter) private readonly adminReservationsRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.ClientReservationsRouter) private readonly clientReservationsRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.AnalyticsRouter) private readonly analyticsRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.PodcastClientRouter) private readonly podcastClientRouter: BaseRouter,
    @inject(ROUTERS_DI_TYPES.AdminPodcastConfigurationRouter) private readonly adminPodcastConfigurationRouter: BaseRouter,
  ) {
    super();
  }

  setupRoutes() {
    this.router.use('/auth', this.authRouter.getRouter());
    this.router.use('/users', this.usersRouter.getRouter());
    this.router.use('/health', this.healthRouter.getRouter());
    this.router.use('/admin/forms', this.adminFormsRouter.getRouter());
    this.router.use('/client/forms', this.clientFormsRouter.getRouter());
    this.router.use('/admin', this.adminServicesRouter.getRouter());
    this.router.use('/client', this.clientServicesRouter.getRouter());
    this.router.use('/admin/reservations', this.adminReservationsRouter.getRouter());
    this.router.use('/client/reservations', this.clientReservationsRouter.getRouter());
    this.router.use('/admin/analytics', this.analyticsRouter.getRouter());
    this.router.use('/client', this.podcastClientRouter.getRouter());
    this.router.use('/admin', this.adminPodcastConfigurationRouter.getRouter());
  }
}

export { ApiRouter };
