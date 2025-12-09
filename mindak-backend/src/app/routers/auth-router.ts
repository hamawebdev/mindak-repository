import { inject, injectable } from 'inversify';

import { BaseRouter } from '@/app/routers/base-router';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';
import { MIDDLEWARES_DI_TYPES } from '@/container/middlewares/di-types';
import { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { ICurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import type { IAuthenticatedMiddleware } from '@/app/middlewares/authenticated-middleware';

@injectable()
class AuthRouter extends BaseRouter {
  constructor(
    @inject(REQUEST_HANDLERS_DI_TYPES.LoginRequestHandler) private readonly loginRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.LogoutRequestHandler) private readonly logoutRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.GetMeRequestHandler) private readonly getMeRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.RefreshTokenRequestHandler) private readonly refreshTokenRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ForgotPasswordRequestHandler) private readonly forgotPasswordRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ResetPasswordRequestHandler) private readonly resetPasswordRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.ChangePasswordRequestHandler) private readonly changePasswordRequestHandler: IRequestHandler,
    @inject(REQUEST_HANDLERS_DI_TYPES.AuthenticatedRequestHandler) private readonly authenticatedRequestHandler: IRequestHandler,
    @inject(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware) private readonly currentUserMiddleware: ICurrentUserMiddleware,
    @inject(MIDDLEWARES_DI_TYPES.AuthenticatedMiddleware) private readonly authenticatedMiddleware: IAuthenticatedMiddleware,
  ) {
    super();
  }

  setupRoutes() {
    // Public routes
    this.router.route('/login').post(this.loginRequestHandler.handler.bind(this.loginRequestHandler));
    this.router.route('/refresh').post(this.refreshTokenRequestHandler.handler.bind(this.refreshTokenRequestHandler));
    this.router.route('/forgot-password').post(this.forgotPasswordRequestHandler.handler.bind(this.forgotPasswordRequestHandler));
    this.router.route('/reset-password').post(this.resetPasswordRequestHandler.handler.bind(this.resetPasswordRequestHandler));

    // Protected routes (require authentication)
    this.router.route('/logout').post(
      this.currentUserMiddleware.handler.bind(this.currentUserMiddleware),
      this.authenticatedMiddleware.handler.bind(this.authenticatedMiddleware),
      this.logoutRequestHandler.handler.bind(this.logoutRequestHandler)
    );

    this.router.route('/me').get(
      this.currentUserMiddleware.handler.bind(this.currentUserMiddleware),
      this.authenticatedMiddleware.handler.bind(this.authenticatedMiddleware),
      this.getMeRequestHandler.handler.bind(this.getMeRequestHandler)
    );

    this.router.route('/change-password').put(
      this.currentUserMiddleware.handler.bind(this.currentUserMiddleware),
      this.authenticatedMiddleware.handler.bind(this.authenticatedMiddleware),
      this.changePasswordRequestHandler.handler.bind(this.changePasswordRequestHandler)
    );

    this.router.route('/authenticated').get(
      this.currentUserMiddleware.handler.bind(this.currentUserMiddleware),
      this.authenticatedRequestHandler.handler.bind(this.authenticatedRequestHandler)
    );
  }
}

export { AuthRouter };
