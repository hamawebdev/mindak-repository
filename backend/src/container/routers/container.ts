import { ApiRouter } from '@/app/routers/api-router';
import { AuthRouter } from '@/app/routers/auth-router';
import { HealthRouter } from '@/app/routers/health-router';
import type { BaseRouter } from '@/app/routers/base-router';
import { UsersRouter } from '@/app/routers/users-router';
import { AdminFormsRouter } from '@/app/routers/admin-forms-router';
import { ClientFormsRouter } from '@/app/routers/client-forms-router';
import { AdminServicesRouter } from '@/app/routers/admin-services-router';
import { ClientServicesRouter } from '@/app/routers/client-services-router';
import { AdminReservationsRouter } from '@/app/routers/admin-reservations-router';
import { ClientReservationsRouter } from '@/app/routers/client-reservations-router';
import { AnalyticsRouter } from '@/app/routers/analytics-router';
import { PodcastClientRouter } from '@/app/routers/podcast-client-router';
import { AdminPodcastConfigurationRouter } from '@/app/routers/admin-podcast-configuration-router';
import type { ContainerBuilder } from '@/container/container';
import { ROUTERS_DI_TYPES } from '@/container/routers/di-types';

export const registerRouters = (containerBuilder: ContainerBuilder) => {
  const builder = new RoutersContainerBuilder(containerBuilder)
    .registerRouters();

  return builder;
};

/**
 * This class is used to register all the routers in the container
 */
class RoutersContainerBuilder {
  constructor(private readonly containerBuilder: ContainerBuilder) { }

  registerRouters() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.ApiRouter).to(ApiRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.AuthRouter).to(AuthRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.UsersRouter).to(UsersRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.HealthRouter).to(HealthRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.AdminFormsRouter).to(AdminFormsRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.ClientFormsRouter).to(ClientFormsRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.AdminServicesRouter).to(AdminServicesRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.ClientServicesRouter).to(ClientServicesRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.AdminReservationsRouter).to(AdminReservationsRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.ClientReservationsRouter).to(ClientReservationsRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.AnalyticsRouter).to(AnalyticsRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.PodcastClientRouter).to(PodcastClientRouter).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<BaseRouter>(ROUTERS_DI_TYPES.AdminPodcastConfigurationRouter).to(AdminPodcastConfigurationRouter).inSingletonScope();
    });

    return this.containerBuilder;
  }
}