import type { ContainerBuilder } from '@/container/container';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IUserRepository } from '@/domain/repositories/user-repository.interface';
import { UserRepository } from '@/infra/database/repositories/user-repository';
import type { IRefreshTokenRepository } from '@/domain/repositories/refresh-token-repository.interface';
import { RefreshTokenRepository } from '@/infra/database/repositories/refresh-token-repository';
import type { IPasswordResetTokenRepository } from '@/domain/repositories/password-reset-token-repository.interface';
import { PasswordResetTokenRepository } from '@/infra/database/repositories/password-reset-token-repository';
import type { IFormQuestionRepository } from '@/domain/repositories/form-question-repository.interface';
import { FormQuestionRepository } from '@/infra/database/repositories/form-question-repository';
import type { IFormQuestionAnswerRepository } from '@/domain/repositories/form-question-answer-repository.interface';
import { FormQuestionAnswerRepository } from '@/infra/database/repositories/form-question-answer-repository';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import { ServiceRepository } from '@/infra/database/repositories/service-repository';
import type { IServiceCategoryRepository } from '@/domain/repositories/service-category-repository.interface';
import { ServiceCategoryRepository } from '@/infra/database/repositories/service-category-repository';
import type { IPodcastReservationRepository } from '@/domain/repositories/podcast-reservation-repository.interface';
import { PodcastReservationRepository } from '@/infra/database/repositories/podcast-reservation-repository';
import type { PodcastReservationNewRepository as IPodcastReservationNewRepository } from '@/domain/repositories/podcast-reservation-new-repository.interface';
import { PodcastReservationNewRepository } from '@/infra/database/repositories/podcast-reservation-new-repository';
import type { IServiceReservationRepository } from '@/domain/repositories/service-reservation-repository.interface';
import { ServiceReservationRepository } from '@/infra/database/repositories/service-reservation-repository';
import type { IReservationStatusHistoryRepository } from '@/domain/repositories/reservation-status-history-repository.interface';
import { ReservationStatusHistoryRepository } from '@/infra/database/repositories/reservation-status-history-repository';
import type { IReservationNoteRepository } from '@/domain/repositories/reservation-note-repository.interface';
import { ReservationNoteRepository } from '@/infra/database/repositories/reservation-note-repository';
import type { IAnalyticsRepository } from '@/domain/repositories/analytics-repository.interface';
import { AnalyticsRepository } from '@/infra/database/repositories/analytics-repository';
import type { PodcastDecorRepository as IPodcastDecorRepository } from '@/domain/repositories/podcast-decor-repository.interface';
import { PodcastDecorRepository } from '@/infra/database/repositories/podcast-decor-repository';
import type { PodcastPackOfferRepository as IPodcastPackOfferRepository } from '@/domain/repositories/podcast-pack-offer-repository.interface';
import { PodcastPackOfferRepository } from '@/infra/database/repositories/podcast-pack-offer-repository';
import type { PodcastSupplementServiceRepository as IPodcastSupplementServiceRepository } from '@/domain/repositories/podcast-supplement-service-repository.interface';
import { PodcastSupplementServiceRepository } from '@/infra/database/repositories/podcast-supplement-service-repository';
import type { PodcastFormQuestionRepository as IPodcastFormQuestionRepository } from '@/domain/repositories/podcast-form-question-repository.interface';
import { PodcastFormQuestionRepository } from '@/infra/database/repositories/podcast-form-question-repository';
import type { PodcastFormStepRepository as IPodcastFormStepRepository } from '@/domain/repositories/podcast-form-step-repository.interface';
import { PodcastFormStepRepository } from '@/infra/database/repositories/podcast-form-step-repository';
import type { IPodcastThemeRepository } from '@/domain/repositories/podcast-theme-repository.interface';
import { PodcastThemeRepository } from '@/infra/database/repositories/podcast-theme-repository';

export const registerRepositories = (containerBuilder: ContainerBuilder) => {
  const builder = new RepositoriesContainerBuilder(containerBuilder)
    .registerRepositories();

  return builder;
};

/**
 * This class is used to register all the repositories in the container
 */
class RepositoriesContainerBuilder {
  constructor(private readonly containerBuilder: ContainerBuilder) { }

  registerRepositories() {
    this
      .registerUserRepository()
      .registerRefreshTokenRepository()
      .registerPasswordResetTokenRepository()
      .registerFormQuestionRepository()
      .registerFormQuestionAnswerRepository()
      .registerServiceRepository()
      .registerServiceCategoryRepository()
      .registerPodcastReservationRepository()
      .registerPodcastReservationNewRepository()
      .registerServiceReservationRepository()
      .registerReservationStatusHistoryRepository()
      .registerReservationNoteRepository()
      .registerAnalyticsRepository()
      .registerPodcastDecorRepository()
      .registerPodcastPackOfferRepository()
      .registerPodcastSupplementServiceRepository()
      .registerPodcastFormQuestionRepository()
      .registerPodcastFormStepRepository()
      .registerPodcastThemeRepository();

    return this.containerBuilder;
  }

  private registerUserRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUserRepository>(REPOSITORIES_DI_TYPES.UserRepository).to(UserRepository).inSingletonScope();
    });

    return this;
  }

  private registerRefreshTokenRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRefreshTokenRepository>(REPOSITORIES_DI_TYPES.RefreshTokenRepository).to(RefreshTokenRepository).inSingletonScope();
    });

    return this;
  }

  private registerPasswordResetTokenRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPasswordResetTokenRepository>(REPOSITORIES_DI_TYPES.PasswordResetTokenRepository).to(PasswordResetTokenRepository).inSingletonScope();
    });

    return this;
  }

  private registerFormQuestionRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IFormQuestionRepository>(REPOSITORIES_DI_TYPES.FormQuestionRepository).to(FormQuestionRepository).inSingletonScope();
    });

    return this;
  }

  private registerFormQuestionAnswerRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IFormQuestionAnswerRepository>(REPOSITORIES_DI_TYPES.FormQuestionAnswerRepository).to(FormQuestionAnswerRepository).inSingletonScope();
    });

    return this;
  }

  private registerServiceRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IServiceRepository>(REPOSITORIES_DI_TYPES.ServiceRepository).to(ServiceRepository).inSingletonScope();
    });

    return this;
  }

  private registerServiceCategoryRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IServiceCategoryRepository>(REPOSITORIES_DI_TYPES.ServiceCategoryRepository).to(ServiceCategoryRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastReservationRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastReservationRepository>(REPOSITORIES_DI_TYPES.PodcastReservationRepository).to(PodcastReservationRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastReservationNewRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastReservationNewRepository>(REPOSITORIES_DI_TYPES.PodcastReservationNewRepository).to(PodcastReservationNewRepository).inSingletonScope();
    });

    return this;
  }

  private registerServiceReservationRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IServiceReservationRepository>(REPOSITORIES_DI_TYPES.ServiceReservationRepository).to(ServiceReservationRepository).inSingletonScope();
    });

    return this;
  }

  private registerReservationStatusHistoryRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IReservationStatusHistoryRepository>(REPOSITORIES_DI_TYPES.ReservationStatusHistoryRepository).to(ReservationStatusHistoryRepository).inSingletonScope();
    });

    return this;
  }

  private registerReservationNoteRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IReservationNoteRepository>(REPOSITORIES_DI_TYPES.ReservationNoteRepository).to(ReservationNoteRepository).inSingletonScope();
    });

    return this;
  }

  private registerAnalyticsRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IAnalyticsRepository>(REPOSITORIES_DI_TYPES.AnalyticsRepository).to(AnalyticsRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastDecorRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastDecorRepository>(REPOSITORIES_DI_TYPES.PodcastDecorRepository).to(PodcastDecorRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastPackOfferRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastPackOfferRepository>(REPOSITORIES_DI_TYPES.PodcastPackOfferRepository).to(PodcastPackOfferRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastSupplementServiceRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastSupplementServiceRepository>(REPOSITORIES_DI_TYPES.PodcastSupplementServiceRepository).to(PodcastSupplementServiceRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastFormQuestionRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastFormQuestionRepository>(REPOSITORIES_DI_TYPES.PodcastFormQuestionRepository).to(PodcastFormQuestionRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastFormStepRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastFormStepRepository>(REPOSITORIES_DI_TYPES.PodcastFormStepRepository).to(PodcastFormStepRepository).inSingletonScope();
    });

    return this;
  }

  private registerPodcastThemeRepository() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IPodcastThemeRepository>(REPOSITORIES_DI_TYPES.PodcastThemeRepository).to(PodcastThemeRepository).inSingletonScope();
    });

    return this;
  }
}