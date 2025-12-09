import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import { MIDDLEWARES_DI_TYPES } from '@/container/middlewares/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { ICurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import type { IAuthenticatedMiddleware } from '@/app/middlewares/authenticated-middleware';
import type { IAdminMiddleware } from '@/app/middlewares/admin-middleware';

@injectable()
class AdminReservationsRouter extends BaseRouter {
  constructor(
    // Podcast Reservations
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastReservationRequestHandler) private readonly createPodcastReservationRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ListPodcastReservationsRequestHandler) private readonly listPodcastReservationsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPodcastReservationDetailsRequestHandler) private readonly getPodcastReservationDetailsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPodcastClientDataRequestHandler) private readonly getPodcastClientDataRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetConfirmedCalendarRequestHandler) private readonly getConfirmedCalendarRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPendingCalendarRequestHandler) private readonly getPendingCalendarRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastReservationStatusRequestHandler) private readonly updatePodcastReservationStatusRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastReservationScheduleRequestHandler) private readonly updatePodcastReservationScheduleRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.AddPodcastReservationNoteRequestHandler) private readonly addPodcastReservationNoteRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastReservationRequestHandler) private readonly deletePodcastReservationRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetDecorsRequestHandler) private readonly getDecorsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPacksRequestHandler) private readonly getPacksRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetSupplementsRequestHandler) private readonly getSupplementsRequestHandler: IRequestHandler,

    // Service Reservations
    @inject(REQUEST_HANDLERS_DI_TYPES.ListServiceReservationsRequestHandler) private readonly listServiceReservationsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetServiceReservationDetailsRequestHandler) private readonly getServiceReservationDetailsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetServiceClientDataRequestHandler) private readonly getServiceClientDataRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdateServiceReservationStatusRequestHandler) private readonly updateServiceReservationStatusRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.AddServiceReservationNoteRequestHandler) private readonly addServiceReservationNoteRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeleteServiceReservationRequestHandler) private readonly deleteServiceReservationRequestHandler: IRequestHandler,

    // Middlewares
    @inject(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware) private readonly currentUserMiddleware: ICurrentUserMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AuthenticatedMiddleware) private readonly authenticatedMiddleware: IAuthenticatedMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AdminMiddleware) private readonly adminMiddleware: IAdminMiddleware,
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

    // Podcast Reservations Routes
    this.router.route('/podcast')
      .get(this.listPodcastReservationsRequestHandler.handler.bind(this.listPodcastReservationsRequestHandler))
      .post(this.createPodcastReservationRequestHandler.handler.bind(this.createPodcastReservationRequestHandler));

    // Calendar routes (must come before :id routes)
    this.router.route('/podcast/calendar/confirmed')
      .get(this.getConfirmedCalendarRequestHandler.handler.bind(this.getConfirmedCalendarRequestHandler));

    this.router.route('/podcast/calendar/pending')
      .get(this.getPendingCalendarRequestHandler.handler.bind(this.getPendingCalendarRequestHandler));

    // Form options routes (must come before :id routes)
    this.router.route('/podcast/decors')
      .get(this.getDecorsRequestHandler.handler.bind(this.getDecorsRequestHandler));

    this.router.route('/podcast/packs')
      .get(this.getPacksRequestHandler.handler.bind(this.getPacksRequestHandler));

    this.router.route('/podcast/supplements')
      .get(this.getSupplementsRequestHandler.handler.bind(this.getSupplementsRequestHandler));

    this.router.route('/podcast/client/:clientId')
      .get(this.getPodcastClientDataRequestHandler.handler.bind(this.getPodcastClientDataRequestHandler));

    this.router.route('/podcast/:id')
      .get(this.getPodcastReservationDetailsRequestHandler.handler.bind(this.getPodcastReservationDetailsRequestHandler))
      .delete(this.deletePodcastReservationRequestHandler.handler.bind(this.deletePodcastReservationRequestHandler));

    this.router.route('/podcast/:id/status')
      .patch(this.updatePodcastReservationStatusRequestHandler.handler.bind(this.updatePodcastReservationStatusRequestHandler));

    this.router.route('/podcast/:id/schedule')
      .patch(this.updatePodcastReservationScheduleRequestHandler.handler.bind(this.updatePodcastReservationScheduleRequestHandler));

    this.router.route('/podcast/:id/notes')
      .post(this.addPodcastReservationNoteRequestHandler.handler.bind(this.addPodcastReservationNoteRequestHandler));

    // Service Reservations Routes
    this.router.route('/services')
      .get(this.listServiceReservationsRequestHandler.handler.bind(this.listServiceReservationsRequestHandler));

    // More specific routes must come before generic :id routes
    this.router.route('/services/client/:clientId')
      .get(this.getServiceClientDataRequestHandler.handler.bind(this.getServiceClientDataRequestHandler));

    this.router.route('/services/:id/status')
      .patch(this.updateServiceReservationStatusRequestHandler.handler.bind(this.updateServiceReservationStatusRequestHandler));

    this.router.route('/services/:id/notes')
      .post(this.addServiceReservationNoteRequestHandler.handler.bind(this.addServiceReservationNoteRequestHandler));

    this.router.route('/services/:id')
      .get(this.getServiceReservationDetailsRequestHandler.handler.bind(this.getServiceReservationDetailsRequestHandler))
      .delete(this.deleteServiceReservationRequestHandler.handler.bind(this.deleteServiceReservationRequestHandler));
  }
}

export { AdminReservationsRouter };

