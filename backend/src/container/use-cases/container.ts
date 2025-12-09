import type { ContainerBuilder } from '@/container/container';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { CORE_DI_TYPES } from '@/container/core/di-types';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import { GetCurrentUserUseCase } from '@/domain/use-cases/auth/get-current-user-use-case';
import { LoginUseCase } from '@/domain/use-cases/auth/login-use-case';
import { RefreshTokenUseCase } from '@/domain/use-cases/auth/refresh-token-use-case';
import { ForgotPasswordUseCase } from '@/domain/use-cases/auth/forgot-password-use-case';
import { ResetPasswordUseCase } from '@/domain/use-cases/auth/reset-password-use-case';
import { ChangePasswordUseCase } from '@/domain/use-cases/auth/change-password-use-case';
import { CreateUserUseCase } from '@/domain/use-cases/user/create-user-use-case';
import { env, integerEnv, mandatoryEnv } from '@/core/env/env';
import type { IIDGenerator } from '@/core/id/id-generator.interface';
import type { ITime } from '@/core/time/time.interface';
import type { IRefreshTokenRepository } from '@/domain/repositories/refresh-token-repository.interface';
import type { IPasswordResetTokenRepository } from '@/domain/repositories/password-reset-token-repository.interface';
import type { IUserRepository } from '@/domain/repositories/user-repository.interface';
import type { IAuthenticator } from '@/domain/services/auth/authenticator.interface';
import type { IEncryptor } from '@/domain/services/security/encryptor.interface';

// Form Management Use Cases
import { GetPodcastQuestionsUseCase } from '@/domain/use-cases/form/get-podcast-questions-use-case';
import { CreatePodcastQuestionUseCase } from '@/domain/use-cases/form/create-podcast-question-use-case';
import { UpdatePodcastQuestionUseCase } from '@/domain/use-cases/form/update-podcast-question-use-case';
import { DeletePodcastQuestionUseCase } from '@/domain/use-cases/form/delete-podcast-question-use-case';
import { ReorderPodcastQuestionsUseCase } from '@/domain/use-cases/form/reorder-podcast-questions-use-case';
import { GetQuestionAnswersUseCase } from '@/domain/use-cases/form/get-question-answers-use-case';
import { CreateQuestionAnswerUseCase } from '@/domain/use-cases/form/create-question-answer-use-case';
import { UpdateQuestionAnswerUseCase } from '@/domain/use-cases/form/update-question-answer-use-case';
import { DeleteQuestionAnswerUseCase } from '@/domain/use-cases/form/delete-question-answer-use-case';
import { ReorderQuestionAnswersUseCase } from '@/domain/use-cases/form/reorder-question-answers-use-case';
import { GetServicesQuestionsUseCase } from '@/domain/use-cases/form/get-services-questions-use-case';
import { CreateServicesQuestionUseCase } from '@/domain/use-cases/form/create-services-question-use-case';
import { UpdateServicesQuestionUseCase } from '@/domain/use-cases/form/update-services-question-use-case';
import { DeleteServicesQuestionUseCase } from '@/domain/use-cases/form/delete-services-question-use-case';
import { ReorderServicesQuestionsUseCase } from '@/domain/use-cases/form/reorder-services-questions-use-case';
import { GetClientPodcastQuestionsUseCase } from '@/domain/use-cases/form/get-client-podcast-questions-use-case';
import { GetClientServicesQuestionsUseCase } from '@/domain/use-cases/form/get-client-services-questions-use-case';

// Service Management Use Cases
import { GetAllServicesUseCase } from '@/domain/use-cases/service/get-all-services-use-case';
import { GetServiceByIdUseCase } from '@/domain/use-cases/service/get-service-by-id-use-case';
import { CreateServiceUseCase } from '@/domain/use-cases/service/create-service-use-case';
import { UpdateServiceUseCase } from '@/domain/use-cases/service/update-service-use-case';
import { DeleteServiceUseCase } from '@/domain/use-cases/service/delete-service-use-case';
import { ToggleServiceStatusUseCase } from '@/domain/use-cases/service/toggle-service-status-use-case';
import { BulkUpdateServiceStatusUseCase } from '@/domain/use-cases/service/bulk-update-service-status-use-case';
import { GetActiveServicesUseCase } from '@/domain/use-cases/service/get-active-services-use-case';

// Reservation Management Use Cases
import { SubmitPodcastReservationUseCase } from '@/domain/use-cases/reservation/submit-podcast-reservation-use-case';
import { SubmitServiceReservationUseCase } from '@/domain/use-cases/reservation/submit-service-reservation-use-case';
import { GetReservationConfirmationUseCase } from '@/domain/use-cases/reservation/get-reservation-confirmation-use-case';
import { CreatePodcastReservationAdminUseCase } from '@/domain/use-cases/reservation/create-podcast-reservation-admin-use-case';
import { ListPodcastReservationsUseCase } from '@/domain/use-cases/reservation/list-podcast-reservations-use-case';
import { GetPodcastReservationDetailsUseCase } from '@/domain/use-cases/reservation/get-podcast-reservation-details-use-case';
import { GetConfirmedCalendarUseCase } from '@/domain/use-cases/reservation/get-confirmed-calendar-use-case';
import { GetPendingCalendarUseCase } from '@/domain/use-cases/reservation/get-pending-calendar-use-case';
import { UpdatePodcastReservationStatusUseCase } from '@/domain/use-cases/reservation/update-podcast-reservation-status-use-case';
import { UpdatePodcastReservationScheduleUseCase } from '@/domain/use-cases/reservation/update-podcast-reservation-schedule-use-case';
import { AddPodcastReservationNoteUseCase } from '@/domain/use-cases/reservation/add-podcast-reservation-note-use-case';
import { DeletePodcastReservationUseCase } from '@/domain/use-cases/reservation/delete-podcast-reservation-use-case';
import { ListServiceReservationsUseCase } from '@/domain/use-cases/reservation/list-service-reservations-use-case';
import { GetServiceReservationDetailsUseCase } from '@/domain/use-cases/reservation/get-service-reservation-details-use-case';
import { UpdateServiceReservationStatusUseCase } from '@/domain/use-cases/reservation/update-service-reservation-status-use-case';
import { AddServiceReservationNoteUseCase } from '@/domain/use-cases/reservation/add-service-reservation-note-use-case';
import { DeleteServiceReservationUseCase } from '@/domain/use-cases/reservation/delete-service-reservation-use-case';
import { GetPodcastClientDataUseCase } from '@/domain/use-cases/reservation/get-podcast-client-data-use-case';
import { GetServiceClientDataUseCase } from '@/domain/use-cases/reservation/get-service-client-data-use-case';

// Analytics Use Cases
import { GetDashboardMetricsUseCase } from '@/domain/use-cases/analytics/get-dashboard-metrics-use-case';
import { GetPodcastAnalyticsUseCase } from '@/domain/use-cases/analytics/get-podcast-analytics-use-case';
import { GetServiceAnalyticsUseCase } from '@/domain/use-cases/analytics/get-service-analytics-use-case';
import { GetTrendAnalysisUseCase } from '@/domain/use-cases/analytics/get-trend-analysis-use-case';
import { GetTopServicesUseCase } from '@/domain/use-cases/analytics/get-top-services-use-case';
import { GetRealtimeDashboardUseCase } from '@/domain/use-cases/analytics/get-realtime-dashboard-use-case';

// Podcast Configuration Use Cases
import { CreatePodcastDecorUseCase } from '@/domain/use-cases/podcast-configuration/create-podcast-decor-use-case';
import { UpdatePodcastDecorUseCase } from '@/domain/use-cases/podcast-configuration/update-podcast-decor-use-case';
import { DeletePodcastDecorUseCase } from '@/domain/use-cases/podcast-configuration/delete-podcast-decor-use-case';
import { CreatePodcastPackOfferUseCase } from '@/domain/use-cases/podcast-configuration/create-podcast-pack-use-case';
import { UpdatePodcastPackOfferUseCase } from '@/domain/use-cases/podcast-configuration/update-podcast-pack-use-case';
import { DeletePodcastPackOfferUseCase } from '@/domain/use-cases/podcast-configuration/delete-podcast-pack-use-case';
import { CreatePodcastSupplementUseCase } from '@/domain/use-cases/podcast-configuration/create-podcast-supplement-use-case';
import { UpdatePodcastSupplementUseCase } from '@/domain/use-cases/podcast-configuration/update-podcast-supplement-use-case';
import { DeletePodcastSupplementUseCase } from '@/domain/use-cases/podcast-configuration/delete-podcast-supplement-use-case';
import { CreatePodcastFormStepUseCase } from '@/domain/use-cases/podcast-configuration/steps/create-podcast-form-step-use-case';
import { UpdatePodcastFormStepUseCase } from '@/domain/use-cases/podcast-configuration/steps/update-podcast-form-step-use-case';
import { DeletePodcastFormStepUseCase } from '@/domain/use-cases/podcast-configuration/steps/delete-podcast-form-step-use-case';
import { GetPodcastFormStructureUseCase } from '@/domain/use-cases/podcast-configuration/get-podcast-form-structure-use-case';
import { CreatePodcastFormQuestionUseCase } from '@/domain/use-cases/podcast-configuration/questions/create-podcast-form-question-use-case';
import { UpdatePodcastFormQuestionUseCase } from '@/domain/use-cases/podcast-configuration/questions/update-podcast-form-question-use-case';
import { DeletePodcastFormQuestionUseCase } from '@/domain/use-cases/podcast-configuration/questions/delete-podcast-form-question-use-case';
import { CreatePodcastThemeUseCase } from '@/domain/use-cases/podcast-configuration/create-podcast-theme-use-case';
import { UpdatePodcastThemeUseCase } from '@/domain/use-cases/podcast-configuration/update-podcast-theme-use-case';
import { DeletePodcastThemeUseCase } from '@/domain/use-cases/podcast-configuration/delete-podcast-theme-use-case';
import { GetPodcastThemesUseCase } from '@/domain/use-cases/podcast-configuration/get-podcast-themes-use-case';

export const registerUseCases = (containerBuilder: ContainerBuilder) => {
  const builder = new UseCasesContainerBuilder(containerBuilder)
    .registerUseCases();

  return builder;
};

/**
 * This class is used to register all the use cases in the container
 */
class UseCasesContainerBuilder {
  constructor(private readonly containerBuilder: ContainerBuilder) { }

  registerUseCases() {
    this
      .registerAuthUseCases()
      .registerUserUseCases()
      .registerFormUseCases()
      .registerServiceUseCases()
      .registerReservationUseCases()
      .registerAnalyticsUseCases()
      .registerPodcastConfigurationUseCases();

    return this.containerBuilder;
  }

  private registerAuthUseCases() {
    // JWT and refresh token configuration
    const jwtSecret = mandatoryEnv('JWT_SECRET');
    const jwtExpiresInSeconds = integerEnv('JWT_EXPIRES_IN_SECONDS', 86400); // 1 day
    const refreshTokenSecret = env('REFRESH_TOKEN_SECRET', jwtSecret); // Use JWT secret as fallback
    const refreshTokenExpiresInDays = integerEnv('REFRESH_TOKEN_EXPIRES_IN_DAYS', 30); // 30 days
    const resetTokenExpiresInHours = integerEnv('RESET_TOKEN_EXPIRES_IN_HOURS', 24); // 24 hours

    // LoginUseCase with refresh token support
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.LoginUseCase).toDynamicValue(() => new LoginUseCase(
        { refreshTokenSecret, refreshTokenExpiresInDays },
        container.get<IAuthenticator>(SERVICES_DI_TYPES.Authenticator),
        container.get<IRefreshTokenRepository>(REPOSITORIES_DI_TYPES.RefreshTokenRepository),
        container.get<IIDGenerator>(CORE_DI_TYPES.IDGenerator),
        container.get<ITime>(CORE_DI_TYPES.Time),
      )).inSingletonScope();
    });

    // RefreshTokenUseCase
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.RefreshTokenUseCase).toDynamicValue(() => new RefreshTokenUseCase(
        { jwtSecret, jwtExpiresInSeconds, refreshTokenSecret, refreshTokenExpiresInDays },
        container.get<IIDGenerator>(CORE_DI_TYPES.IDGenerator),
        container.get<ITime>(CORE_DI_TYPES.Time),
        container.get<IRefreshTokenRepository>(REPOSITORIES_DI_TYPES.RefreshTokenRepository),
        container.get<IUserRepository>(REPOSITORIES_DI_TYPES.UserRepository),
      )).inSingletonScope();
    });

    // ForgotPasswordUseCase
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ForgotPasswordUseCase).toDynamicValue(() => new ForgotPasswordUseCase(
        { resetTokenExpiresInHours },
        container.get<IIDGenerator>(CORE_DI_TYPES.IDGenerator),
        container.get<ITime>(CORE_DI_TYPES.Time),
        container.get<IPasswordResetTokenRepository>(REPOSITORIES_DI_TYPES.PasswordResetTokenRepository),
        container.get<IUserRepository>(REPOSITORIES_DI_TYPES.UserRepository),
      )).inSingletonScope();
    });

    // ResetPasswordUseCase
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase).inSingletonScope();
    });

    // ChangePasswordUseCase
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ChangePasswordUseCase).to(ChangePasswordUseCase).inSingletonScope();
    });

    // GetCurrentUserUseCase
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetCurrentUserUseCase).to(GetCurrentUserUseCase).inSingletonScope();
    });

    return this;
  }

  private registerUserUseCases() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreateUserUseCase).to(CreateUserUseCase).inSingletonScope();
    });

    return this;
  }

  private registerFormUseCases() {
    // Podcast Form Questions
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetPodcastQuestionsUseCase).to(GetPodcastQuestionsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastQuestionUseCase).to(CreatePodcastQuestionUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastQuestionUseCase).to(UpdatePodcastQuestionUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastQuestionUseCase).to(DeletePodcastQuestionUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ReorderPodcastQuestionsUseCase).to(ReorderPodcastQuestionsUseCase).inSingletonScope();
    });

    // Question Answers
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetQuestionAnswersUseCase).to(GetQuestionAnswersUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreateQuestionAnswerUseCase).to(CreateQuestionAnswerUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdateQuestionAnswerUseCase).to(UpdateQuestionAnswerUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeleteQuestionAnswerUseCase).to(DeleteQuestionAnswerUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ReorderQuestionAnswersUseCase).to(ReorderQuestionAnswersUseCase).inSingletonScope();
    });

    // Services Form Questions
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetServicesQuestionsUseCase).to(GetServicesQuestionsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreateServicesQuestionUseCase).to(CreateServicesQuestionUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdateServicesQuestionUseCase).to(UpdateServicesQuestionUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeleteServicesQuestionUseCase).to(DeleteServicesQuestionUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ReorderServicesQuestionsUseCase).to(ReorderServicesQuestionsUseCase).inSingletonScope();
    });

    // Client Form Questions
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetClientPodcastQuestionsUseCase).to(GetClientPodcastQuestionsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetClientServicesQuestionsUseCase).to(GetClientServicesQuestionsUseCase).inSingletonScope();
    });

    return this;
  }

  private registerServiceUseCases() {
    // Service Management Use Cases
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetAllServicesUseCase).to(GetAllServicesUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetServiceByIdUseCase).to(GetServiceByIdUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreateServiceUseCase).to(CreateServiceUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdateServiceUseCase).to(UpdateServiceUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeleteServiceUseCase).to(DeleteServiceUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ToggleServiceStatusUseCase).to(ToggleServiceStatusUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.BulkUpdateServiceStatusUseCase).to(BulkUpdateServiceStatusUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetActiveServicesUseCase).to(GetActiveServicesUseCase).inSingletonScope();
    });

    return this;
  }

  private registerReservationUseCases() {
    // Client Submission Use Cases
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.SubmitPodcastReservationUseCase).to(SubmitPodcastReservationUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.SubmitServiceReservationUseCase).to(SubmitServiceReservationUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetReservationConfirmationUseCase).to(GetReservationConfirmationUseCase).inSingletonScope();
    });

    // Admin - Podcast Reservations Use Cases
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastReservationAdminUseCase).to(CreatePodcastReservationAdminUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ListPodcastReservationsUseCase).to(ListPodcastReservationsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetPodcastReservationDetailsUseCase).to(GetPodcastReservationDetailsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetPodcastClientDataUseCase).to(GetPodcastClientDataUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetConfirmedCalendarUseCase).to(GetConfirmedCalendarUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetPendingCalendarUseCase).to(GetPendingCalendarUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastReservationStatusUseCase).to(UpdatePodcastReservationStatusUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastReservationScheduleUseCase).to(UpdatePodcastReservationScheduleUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.AddPodcastReservationNoteUseCase).to(AddPodcastReservationNoteUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastReservationUseCase).to(DeletePodcastReservationUseCase).inSingletonScope();
    });

    // Admin - Service Reservations Use Cases
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.ListServiceReservationsUseCase).to(ListServiceReservationsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetServiceReservationDetailsUseCase).to(GetServiceReservationDetailsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetServiceClientDataUseCase).to(GetServiceClientDataUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdateServiceReservationStatusUseCase).to(UpdateServiceReservationStatusUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.AddServiceReservationNoteUseCase).to(AddServiceReservationNoteUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeleteServiceReservationUseCase).to(DeleteServiceReservationUseCase).inSingletonScope();
    });

    return this;
  }

  private registerAnalyticsUseCases() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetDashboardMetricsUseCase).to(GetDashboardMetricsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetPodcastAnalyticsUseCase).to(GetPodcastAnalyticsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetServiceAnalyticsUseCase).to(GetServiceAnalyticsUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetTrendAnalysisUseCase).to(GetTrendAnalysisUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetTopServicesUseCase).to(GetTopServicesUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetRealtimeDashboardUseCase).to(GetRealtimeDashboardUseCase).inSingletonScope();
    });

    return this;
  }

  private registerPodcastConfigurationUseCases() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastDecorUseCase).to(CreatePodcastDecorUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastDecorUseCase).to(UpdatePodcastDecorUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastDecorUseCase).to(DeletePodcastDecorUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastPackOfferUseCase).to(CreatePodcastPackOfferUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastPackOfferUseCase).to(UpdatePodcastPackOfferUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastPackOfferUseCase).to(DeletePodcastPackOfferUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastSupplementUseCase).to(CreatePodcastSupplementUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastSupplementUseCase).to(UpdatePodcastSupplementUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastSupplementUseCase).to(DeletePodcastSupplementUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastFormStepUseCase).to(CreatePodcastFormStepUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastFormStepUseCase).to(UpdatePodcastFormStepUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastFormStepUseCase).to(DeletePodcastFormStepUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetPodcastFormStructureUseCase).to(GetPodcastFormStructureUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastFormQuestionUseCase).to(CreatePodcastFormQuestionUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastFormQuestionUseCase).to(UpdatePodcastFormQuestionUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastFormQuestionUseCase).to(DeletePodcastFormQuestionUseCase).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.CreatePodcastThemeUseCase).to(CreatePodcastThemeUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.UpdatePodcastThemeUseCase).to(UpdatePodcastThemeUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.DeletePodcastThemeUseCase).to(DeletePodcastThemeUseCase).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IUseCase>(USE_CASES_DI_TYPES.GetPodcastThemesUseCase).to(GetPodcastThemesUseCase).inSingletonScope();
    });

    return this;
  }
}