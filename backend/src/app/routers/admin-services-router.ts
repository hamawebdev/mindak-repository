import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import { MIDDLEWARES_DI_TYPES } from '@/container/middlewares/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { ICurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import type { IAuthenticatedMiddleware } from '@/app/middlewares/authenticated-middleware';
import type { IAdminMiddleware } from '@/app/middlewares/admin-middleware';

@injectable()
class AdminServicesRouter extends BaseRouter {
  constructor(
    // Services
    @inject(REQUEST_HANDLERS_DI_TYPES.GetAllServicesRequestHandler) private readonly getAllServicesRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetServiceByIdRequestHandler) private readonly getServiceByIdRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreateServiceRequestHandler) private readonly createServiceRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdateServiceRequestHandler) private readonly updateServiceRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeleteServiceRequestHandler) private readonly deleteServiceRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ToggleServiceStatusRequestHandler) private readonly toggleServiceStatusRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.BulkUpdateServiceStatusRequestHandler) private readonly bulkUpdateServiceStatusRequestHandler: IRequestHandler,

    // Middlewares
    @inject(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware) private readonly currentUserMiddleware: ICurrentUserMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AuthenticatedMiddleware) private readonly authenticatedMiddleware: IAuthenticatedMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AdminMiddleware) private readonly adminMiddleware: IAdminMiddleware,
  ) {
    super();
  }

  setupRoutes() {
    // Helper to create admin-protected route chain
    const adminProtected = () => [
      this.currentUserMiddleware.handler.bind(this.currentUserMiddleware),
      this.authenticatedMiddleware.handler.bind(this.authenticatedMiddleware),
      this.adminMiddleware.handler.bind(this.adminMiddleware),
    ];

    // Services Routes
    this.router.route('/services')
      .get(...adminProtected(), this.getAllServicesRequestHandler.handler.bind(this.getAllServicesRequestHandler))
      .post(...adminProtected(), this.createServiceRequestHandler.handler.bind(this.createServiceRequestHandler));

    this.router.route('/services/bulk-status')
      .patch(...adminProtected(), this.bulkUpdateServiceStatusRequestHandler.handler.bind(this.bulkUpdateServiceStatusRequestHandler));

    this.router.route('/services/:id')
      .get(...adminProtected(), this.getServiceByIdRequestHandler.handler.bind(this.getServiceByIdRequestHandler))
      .put(...adminProtected(), this.updateServiceRequestHandler.handler.bind(this.updateServiceRequestHandler))
      .delete(...adminProtected(), this.deleteServiceRequestHandler.handler.bind(this.deleteServiceRequestHandler));

    this.router.route('/services/:id/toggle-status')
      .patch(...adminProtected(), this.toggleServiceStatusRequestHandler.handler.bind(this.toggleServiceStatusRequestHandler));

    return this.router;
  }
}

export { AdminServicesRouter };

