import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import { MIDDLEWARES_DI_TYPES } from '@/container/middlewares/di-types';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { ICurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import type { IAuthenticatedMiddleware } from '@/app/middlewares/authenticated-middleware';
import type { IAdminMiddleware } from '@/app/middlewares/admin-middleware';
import type { IUploadMiddleware } from '@/app/middlewares/upload-middleware';

@injectable()
class AdminPodcastConfigurationRouter extends BaseRouter {
  constructor(
    // Decors
    @inject(REQUEST_HANDLERS_DI_TYPES.GetDecorsRequestHandler) private readonly getDecorsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastDecorRequestHandler) private readonly createDecorRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastDecorRequestHandler) private readonly updateDecorRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastDecorRequestHandler) private readonly deleteDecorRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UploadPodcastDecorImageRequestHandler) private readonly uploadDecorImageRequestHandler: IRequestHandler,

    // Packs
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPacksRequestHandler) private readonly getPacksRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastPackOfferRequestHandler) private readonly createPackRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastPackOfferRequestHandler) private readonly updatePackRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastPackOfferRequestHandler) private readonly deletePackRequestHandler: IRequestHandler,

    // Supplements
    @inject(REQUEST_HANDLERS_DI_TYPES.GetSupplementsRequestHandler) private readonly getSupplementsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastSupplementRequestHandler) private readonly createSupplementRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastSupplementRequestHandler) private readonly updateSupplementRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastSupplementRequestHandler) private readonly deleteSupplementRequestHandler: IRequestHandler,

    // Steps
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastFormStepRequestHandler) private readonly createStepRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastFormStepRequestHandler) private readonly updateStepRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastFormStepRequestHandler) private readonly deleteStepRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPodcastFormStructureRequestHandler) private readonly getStructureRequestHandler: IRequestHandler,

    // Questions
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastFormQuestionRequestHandler) private readonly createQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastFormQuestionRequestHandler) private readonly updateQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastFormQuestionRequestHandler) private readonly deleteQuestionRequestHandler: IRequestHandler,

    // Themes
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastThemeRequestHandler) private readonly createThemeRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastThemeRequestHandler) private readonly updateThemeRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastThemeRequestHandler) private readonly deleteThemeRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPodcastThemesRequestHandler) private readonly getThemesRequestHandler: IRequestHandler,

    // Availability
    @inject(REQUEST_HANDLERS_DI_TYPES.GetAvailabilityConfigRequestHandler) private readonly getAvailabilityConfigRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdateAvailabilityConfigRequestHandler) private readonly updateAvailabilityConfigRequestHandler: IRequestHandler,

    // Middlewares
    @inject(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware) private readonly currentUserMiddleware: ICurrentUserMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AuthenticatedMiddleware) private readonly authenticatedMiddleware: IAuthenticatedMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AdminMiddleware) private readonly adminMiddleware: IAdminMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.UploadMiddleware) private readonly uploadMiddleware: IUploadMiddleware,
  ) {
    super();
  }

  setupRoutes() {
    const adminProtected = () => [
      this.currentUserMiddleware.handler.bind(this.currentUserMiddleware),
      this.authenticatedMiddleware.handler.bind(this.authenticatedMiddleware),
      this.adminMiddleware.handler.bind(this.adminMiddleware),
    ];

    // Decors
    this.router.route('/podcast/configuration/decors')
      .get(...adminProtected(), this.getDecorsRequestHandler.handler.bind(this.getDecorsRequestHandler))
      .post(...adminProtected(), this.createDecorRequestHandler.handler.bind(this.createDecorRequestHandler));

    this.router.route('/podcast/configuration/decors/:id')
      .put(...adminProtected(), this.updateDecorRequestHandler.handler.bind(this.updateDecorRequestHandler))
      .delete(...adminProtected(), this.deleteDecorRequestHandler.handler.bind(this.deleteDecorRequestHandler));

    // Decor Image Upload (50MB limit, all image formats)
    this.router.route('/podcast/configuration/decors/upload-image')
      .post(...adminProtected(), this.uploadMiddleware.singleWithOptions('image', { maxSizeMb: 50, allowAllImageFormats: true }), this.uploadDecorImageRequestHandler.handler.bind(this.uploadDecorImageRequestHandler));

    // Packs
    this.router.route('/podcast/configuration/packs')
      .get(...adminProtected(), this.getPacksRequestHandler.handler.bind(this.getPacksRequestHandler))
      .post(...adminProtected(), this.createPackRequestHandler.handler.bind(this.createPackRequestHandler));

    this.router.route('/podcast/configuration/packs/:id')
      .put(...adminProtected(), this.updatePackRequestHandler.handler.bind(this.updatePackRequestHandler))
      .delete(...adminProtected(), this.deletePackRequestHandler.handler.bind(this.deletePackRequestHandler));

    // Supplements
    this.router.route('/podcast/configuration/supplements')
      .get(...adminProtected(), this.getSupplementsRequestHandler.handler.bind(this.getSupplementsRequestHandler))
      .post(...adminProtected(), this.createSupplementRequestHandler.handler.bind(this.createSupplementRequestHandler));

    this.router.route('/podcast/configuration/supplements/:id')
      .put(...adminProtected(), this.updateSupplementRequestHandler.handler.bind(this.updateSupplementRequestHandler))
      .delete(...adminProtected(), this.deleteSupplementRequestHandler.handler.bind(this.deleteSupplementRequestHandler));

    // Steps
    this.router.route('/podcast/configuration/steps')
      .get(...adminProtected(), this.getStructureRequestHandler.handler.bind(this.getStructureRequestHandler))
      .post(...adminProtected(), this.createStepRequestHandler.handler.bind(this.createStepRequestHandler));

    this.router.route('/podcast/configuration/steps/:id')
      .put(...adminProtected(), this.updateStepRequestHandler.handler.bind(this.updateStepRequestHandler))
      .delete(...adminProtected(), this.deleteStepRequestHandler.handler.bind(this.deleteStepRequestHandler));

    // Structure (Steps + Questions)
    this.router.route('/podcast/configuration/structure')
      .get(...adminProtected(), this.getStructureRequestHandler.handler.bind(this.getStructureRequestHandler));

    // Questions (New endpoints)
    this.router.route('/podcast/configuration/questions')
      .post(...adminProtected(), this.createQuestionRequestHandler.handler.bind(this.createQuestionRequestHandler));

    this.router.route('/podcast/configuration/questions/:id')
      .put(...adminProtected(), this.updateQuestionRequestHandler.handler.bind(this.updateQuestionRequestHandler))
      .delete(...adminProtected(), this.deleteQuestionRequestHandler.handler.bind(this.deleteQuestionRequestHandler));

    // Themes
    this.router.route('/podcast/configuration/themes')
      .get(...adminProtected(), this.getThemesRequestHandler.handler.bind(this.getThemesRequestHandler))
      .post(...adminProtected(), this.createThemeRequestHandler.handler.bind(this.createThemeRequestHandler));

    this.router.route('/podcast/configuration/themes/:id')
      .put(...adminProtected(), this.updateThemeRequestHandler.handler.bind(this.updateThemeRequestHandler))
      .delete(...adminProtected(), this.deleteThemeRequestHandler.handler.bind(this.deleteThemeRequestHandler));

    // Availability
    this.router.route('/podcast/configuration/availability')
      .get(...adminProtected(), this.getAvailabilityConfigRequestHandler.handler.bind(this.getAvailabilityConfigRequestHandler))
      .put(...adminProtected(), this.updateAvailabilityConfigRequestHandler.handler.bind(this.updateAvailabilityConfigRequestHandler));
  }
}

export { AdminPodcastConfigurationRouter };
