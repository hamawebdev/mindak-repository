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
class AdminFormsRouter extends BaseRouter {
  constructor(
    // Podcast Questions
    @inject(REQUEST_HANDLERS_DI_TYPES.GetPodcastQuestionsRequestHandler) private readonly getPodcastQuestionsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreatePodcastQuestionRequestHandler) private readonly createPodcastQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastQuestionRequestHandler) private readonly updatePodcastQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeletePodcastQuestionRequestHandler) private readonly deletePodcastQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ReorderPodcastQuestionsRequestHandler) private readonly reorderPodcastQuestionsRequestHandler: IRequestHandler,

    // Podcast Question Answers
    @inject(REQUEST_HANDLERS_DI_TYPES.GetQuestionAnswersRequestHandler) private readonly getQuestionAnswersRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreateQuestionAnswerRequestHandler) private readonly createQuestionAnswerRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdateQuestionAnswerRequestHandler) private readonly updateQuestionAnswerRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeleteQuestionAnswerRequestHandler) private readonly deleteQuestionAnswerRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ReorderQuestionAnswersRequestHandler) private readonly reorderQuestionAnswersRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UploadAnswerImageRequestHandler) private readonly uploadAnswerImageRequestHandler: IRequestHandler,

    // Services Questions
    @inject(REQUEST_HANDLERS_DI_TYPES.GetServicesQuestionsRequestHandler) private readonly getServicesQuestionsRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreateServicesQuestionRequestHandler) private readonly createServicesQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdateServicesQuestionRequestHandler) private readonly updateServicesQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeleteServicesQuestionRequestHandler) private readonly deleteServicesQuestionRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ReorderServicesQuestionsRequestHandler) private readonly reorderServicesQuestionsRequestHandler: IRequestHandler,

    // Services Question Answers
    @inject(REQUEST_HANDLERS_DI_TYPES.GetServicesQuestionAnswersRequestHandler) private readonly getServicesQuestionAnswersRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.CreateServicesQuestionAnswerRequestHandler) private readonly createServicesQuestionAnswerRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UpdateServicesQuestionAnswerRequestHandler) private readonly updateServicesQuestionAnswerRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.DeleteServicesQuestionAnswerRequestHandler) private readonly deleteServicesQuestionAnswerRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ReorderServicesQuestionAnswersRequestHandler) private readonly reorderServicesQuestionAnswersRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.UploadServicesAnswerImageRequestHandler) private readonly uploadServicesAnswerImageRequestHandler: IRequestHandler,

    // Middlewares
    @inject(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware) private readonly currentUserMiddleware: ICurrentUserMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AuthenticatedMiddleware) private readonly authenticatedMiddleware: IAuthenticatedMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AdminMiddleware) private readonly adminMiddleware: IAdminMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.UploadMiddleware) private readonly uploadMiddleware: IUploadMiddleware,
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

    // Podcast Form Questions Routes
    this.router.route('/podcast/questions')
      .get(...adminProtected(), this.getPodcastQuestionsRequestHandler.handler.bind(this.getPodcastQuestionsRequestHandler))
      .post(...adminProtected(), this.createPodcastQuestionRequestHandler.handler.bind(this.createPodcastQuestionRequestHandler));

    this.router.route('/podcast/questions/bulk-reorder')
      .patch(...adminProtected(), this.reorderPodcastQuestionsRequestHandler.handler.bind(this.reorderPodcastQuestionsRequestHandler));

    this.router.route('/podcast/questions/:id')
      .put(...adminProtected(), this.updatePodcastQuestionRequestHandler.handler.bind(this.updatePodcastQuestionRequestHandler))
      .delete(...adminProtected(), this.deletePodcastQuestionRequestHandler.handler.bind(this.deletePodcastQuestionRequestHandler));

    // Podcast Question Answers Routes
    this.router.route('/podcast/questions/:questionId/answers')
      .get(...adminProtected(), this.getQuestionAnswersRequestHandler.handler.bind(this.getQuestionAnswersRequestHandler))
      .post(...adminProtected(), this.createQuestionAnswerRequestHandler.handler.bind(this.createQuestionAnswerRequestHandler));

    this.router.route('/podcast/questions/:questionId/answers/bulk-reorder')
      .patch(...adminProtected(), this.reorderQuestionAnswersRequestHandler.handler.bind(this.reorderQuestionAnswersRequestHandler));

    this.router.route('/podcast/questions/:questionId/answers/:id')
      .put(...adminProtected(), this.updateQuestionAnswerRequestHandler.handler.bind(this.updateQuestionAnswerRequestHandler))
      .delete(...adminProtected(), this.deleteQuestionAnswerRequestHandler.handler.bind(this.deleteQuestionAnswerRequestHandler));

    // Podcast Question Answer Image Upload
    this.router.route('/podcast/answers/upload-image')
      .post(...adminProtected(), this.uploadMiddleware.single('image'), this.uploadAnswerImageRequestHandler.handler.bind(this.uploadAnswerImageRequestHandler));

    // Services Form Questions Routes
    this.router.route('/services/questions')
      .get(...adminProtected(), this.getServicesQuestionsRequestHandler.handler.bind(this.getServicesQuestionsRequestHandler))
      .post(...adminProtected(), this.createServicesQuestionRequestHandler.handler.bind(this.createServicesQuestionRequestHandler));

    this.router.route('/services/questions/bulk-reorder')
      .patch(...adminProtected(), this.reorderServicesQuestionsRequestHandler.handler.bind(this.reorderServicesQuestionsRequestHandler));

    this.router.route('/services/questions/:id')
      .put(...adminProtected(), this.updateServicesQuestionRequestHandler.handler.bind(this.updateServicesQuestionRequestHandler))
      .delete(...adminProtected(), this.deleteServicesQuestionRequestHandler.handler.bind(this.deleteServicesQuestionRequestHandler));

    // Services Question Answers Routes
    this.router.route('/services/questions/:questionId/answers')
      .get(...adminProtected(), this.getServicesQuestionAnswersRequestHandler.handler.bind(this.getServicesQuestionAnswersRequestHandler))
      .post(...adminProtected(), this.createServicesQuestionAnswerRequestHandler.handler.bind(this.createServicesQuestionAnswerRequestHandler));

    this.router.route('/services/questions/:questionId/answers/bulk-reorder')
      .patch(...adminProtected(), this.reorderServicesQuestionAnswersRequestHandler.handler.bind(this.reorderServicesQuestionAnswersRequestHandler));

    this.router.route('/services/questions/:questionId/answers/:id')
      .put(...adminProtected(), this.updateServicesQuestionAnswerRequestHandler.handler.bind(this.updateServicesQuestionAnswerRequestHandler))
      .delete(...adminProtected(), this.deleteServicesQuestionAnswerRequestHandler.handler.bind(this.deleteServicesQuestionAnswerRequestHandler));

    // Services Question Answer Image Upload
    this.router.route('/services/answers/upload-image')
      .post(...adminProtected(), this.uploadMiddleware.single('image'), this.uploadServicesAnswerImageRequestHandler.handler.bind(this.uploadServicesAnswerImageRequestHandler));
  }
}

export { AdminFormsRouter };

