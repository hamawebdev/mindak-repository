import type { ContainerBuilder } from '@/container/container';
import { MIDDLEWARES_DI_TYPES } from '@/container/middlewares/di-types';
import { AuthenticatedMiddleware, type IAuthenticatedMiddleware } from '@/app/middlewares/authenticated-middleware';
import { AdminMiddleware, type IAdminMiddleware } from '@/app/middlewares/admin-middleware';
import type { IErrorMiddleware } from '@/app/middlewares/error-middleware';
import { ErrorMiddleware } from '@/app/middlewares/error-middleware';
import type { ICurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import { CurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import { UploadMiddleware, type IUploadMiddleware } from '@/app/middlewares/upload-middleware';

export const registerMiddlewares = (containerBuilder: ContainerBuilder) => {
  const builder = new MiddlewaresContainerBuilder(containerBuilder)
    .registerMiddlewares();

  return builder;
};

/**
 * This class is used to register all the middlewares in the container
 */
class MiddlewaresContainerBuilder {
  constructor(private readonly containerBuilder: ContainerBuilder) {}

  registerMiddlewares() {
    this
      .registerCurrentUserMiddleware()
      .registerAuthenticatedMiddleware()
      .registerAdminMiddleware()
      .registerErrorMiddleware()
      .registerUploadMiddleware();

    return this.containerBuilder;
  }

  private registerCurrentUserMiddleware() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<ICurrentUserMiddleware>(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware).to(CurrentUserMiddleware).inRequestScope();
    });

    return this;
  }

  private registerAuthenticatedMiddleware() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IAuthenticatedMiddleware>(MIDDLEWARES_DI_TYPES.AuthenticatedMiddleware).to(AuthenticatedMiddleware).inRequestScope();
    });

    return this;
  }

  private registerAdminMiddleware() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IAdminMiddleware>(MIDDLEWARES_DI_TYPES.AdminMiddleware).to(AdminMiddleware).inRequestScope();
    });

    return this;
  }

  private registerErrorMiddleware() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IErrorMiddleware>(MIDDLEWARES_DI_TYPES.ErrorMiddleware).to(ErrorMiddleware).inRequestScope();
    });

    return this;
  }

  private registerUploadMiddleware() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUploadMiddleware>(MIDDLEWARES_DI_TYPES.UploadMiddleware).to(UploadMiddleware).inSingletonScope();
    });

    return this;
  }
}