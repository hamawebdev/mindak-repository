import { LoginRequestHandler } from '@/app/request-handlers/auth/commands/login-request-handler';
import { LogoutRequestHandler } from '@/app/request-handlers/auth/commands/logout-request-handler';
import { RefreshTokenRequestHandler } from '@/app/request-handlers/auth/commands/refresh-token-request-handler';
import { ForgotPasswordRequestHandler } from '@/app/request-handlers/auth/commands/forgot-password-request-handler';
import { ResetPasswordRequestHandler } from '@/app/request-handlers/auth/commands/reset-password-request-handler';
import { ChangePasswordRequestHandler } from '@/app/request-handlers/auth/commands/change-password-request-handler';
import { AuthenticatedRequestHandler } from '@/app/request-handlers/auth/queries/authenticated-request-handler';
import { GetMeRequestHandler } from '@/app/request-handlers/auth/queries/get-me-request-handler';
import { HealthRequestHandler } from '@/app/request-handlers/health/queries/health-request-handler';
import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import { CreateUserRequestHandler } from '@/app/request-handlers/users/commands/create-user-request-handler';
import type { ContainerBuilder } from '@/container/container';
import { REQUEST_HANDLERS_DI_TYPES } from '@/container/request-handlers/di-types';

// Form Management Request Handlers
import { GetPodcastQuestionsRequestHandler } from '@/app/request-handlers/forms/admin/podcast/queries/get-podcast-questions-request-handler';
import { CreatePodcastQuestionRequestHandler } from '@/app/request-handlers/forms/admin/podcast/commands/create-podcast-question-request-handler';
import { UpdatePodcastQuestionRequestHandler } from '@/app/request-handlers/forms/admin/podcast/commands/update-podcast-question-request-handler';
import { DeletePodcastQuestionRequestHandler } from '@/app/request-handlers/forms/admin/podcast/commands/delete-podcast-question-request-handler';
import { ReorderPodcastQuestionsRequestHandler } from '@/app/request-handlers/forms/admin/podcast/commands/reorder-podcast-questions-request-handler';
import { GetQuestionAnswersRequestHandler } from '@/app/request-handlers/forms/admin/podcast/answers/queries/get-question-answers-request-handler';
import { CreateQuestionAnswerRequestHandler } from '@/app/request-handlers/forms/admin/podcast/answers/commands/create-question-answer-request-handler';
import { UpdateQuestionAnswerRequestHandler } from '@/app/request-handlers/forms/admin/podcast/answers/commands/update-question-answer-request-handler';
import { DeleteQuestionAnswerRequestHandler } from '@/app/request-handlers/forms/admin/podcast/answers/commands/delete-question-answer-request-handler';
import { ReorderQuestionAnswersRequestHandler } from '@/app/request-handlers/forms/admin/podcast/answers/commands/reorder-question-answers-request-handler';
import { UploadAnswerImageRequestHandler } from '@/app/request-handlers/forms/admin/podcast/answers/commands/upload-answer-image-request-handler';
import { GetServicesQuestionsRequestHandler } from '@/app/request-handlers/forms/admin/services/queries/get-services-questions-request-handler';
import { CreateServicesQuestionRequestHandler } from '@/app/request-handlers/forms/admin/services/commands/create-services-question-request-handler';
import { UpdateServicesQuestionRequestHandler } from '@/app/request-handlers/forms/admin/services/commands/update-services-question-request-handler';
import { DeleteServicesQuestionRequestHandler } from '@/app/request-handlers/forms/admin/services/commands/delete-services-question-request-handler';
import { ReorderServicesQuestionsRequestHandler } from '@/app/request-handlers/forms/admin/services/commands/reorder-services-questions-request-handler';
import { GetServicesQuestionAnswersRequestHandler } from '@/app/request-handlers/forms/admin/services/answers/queries/get-question-answers-request-handler';
import { CreateServicesQuestionAnswerRequestHandler } from '@/app/request-handlers/forms/admin/services/answers/commands/create-question-answer-request-handler';
import { UpdateServicesQuestionAnswerRequestHandler } from '@/app/request-handlers/forms/admin/services/answers/commands/update-question-answer-request-handler';
import { DeleteServicesQuestionAnswerRequestHandler } from '@/app/request-handlers/forms/admin/services/answers/commands/delete-question-answer-request-handler';
import { ReorderServicesQuestionAnswersRequestHandler } from '@/app/request-handlers/forms/admin/services/answers/commands/reorder-question-answers-request-handler';
import { UploadServicesAnswerImageRequestHandler } from '@/app/request-handlers/forms/admin/services/answers/commands/upload-answer-image-request-handler';
import { GetClientPodcastQuestionsRequestHandler } from '@/app/request-handlers/forms/client/queries/get-client-podcast-questions-request-handler';
import { GetClientServicesQuestionsRequestHandler } from '@/app/request-handlers/forms/client/queries/get-client-services-questions-request-handler';

// Service Management Request Handlers
import { GetAllServicesRequestHandler } from '@/app/request-handlers/services/admin/queries/get-all-services-request-handler';
import { GetServiceByIdRequestHandler } from '@/app/request-handlers/services/admin/queries/get-service-by-id-request-handler';
import { CreateServiceRequestHandler } from '@/app/request-handlers/services/admin/commands/create-service-request-handler';
import { UpdateServiceRequestHandler } from '@/app/request-handlers/services/admin/commands/update-service-request-handler';
import { DeleteServiceRequestHandler } from '@/app/request-handlers/services/admin/commands/delete-service-request-handler';
import { ToggleServiceStatusRequestHandler } from '@/app/request-handlers/services/admin/commands/toggle-service-status-request-handler';
import { BulkUpdateServiceStatusRequestHandler } from '@/app/request-handlers/services/admin/commands/bulk-update-service-status-request-handler';
import { GetActiveServicesRequestHandler } from '@/app/request-handlers/services/client/queries/get-active-services-request-handler';

// Reservation Management Request Handlers
import { SubmitPodcastReservationRequestHandler } from '@/app/request-handlers/reservations/client/commands/submit-podcast-reservation-request-handler';
import { SubmitServiceReservationRequestHandler } from '@/app/request-handlers/reservations/client/commands/submit-service-reservation-request-handler';
import { GetReservationConfirmationRequestHandler } from '@/app/request-handlers/reservations/client/queries/get-reservation-confirmation-request-handler';
import { GetFormConfigRequestHandler } from '@/app/request-handlers/podcast/client/get-form-config-request-handler';
import { GetAvailabilityRequestHandler } from '@/app/request-handlers/podcast/client/get-availability-request-handler';
import { CreateReservationRequestHandler } from '@/app/request-handlers/podcast/client/create-reservation-request-handler';
import { CreatePodcastReservationRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/commands/create-podcast-reservation-request-handler';
import { ListPodcastReservationsRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/queries/list-podcast-reservations-request-handler';
import { GetPodcastReservationDetailsRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/queries/get-podcast-reservation-details-request-handler';
import { GetConfirmedCalendarRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/queries/get-confirmed-calendar-request-handler';
import { GetPendingCalendarRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/queries/get-pending-calendar-request-handler';
import { UpdatePodcastReservationStatusRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/commands/update-podcast-reservation-status-request-handler';
import { UpdatePodcastReservationScheduleRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/commands/update-podcast-reservation-schedule-request-handler';
import { AddPodcastReservationNoteRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/commands/add-podcast-reservation-note-request-handler';
import { DeletePodcastReservationRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/commands/delete-podcast-reservation-request-handler';
import { ListServiceReservationsRequestHandler } from '@/app/request-handlers/reservations/admin/services/queries/list-service-reservations-request-handler';
import { GetServiceReservationDetailsRequestHandler } from '@/app/request-handlers/reservations/admin/services/queries/get-service-reservation-details-request-handler';
import { UpdateServiceReservationStatusRequestHandler } from '@/app/request-handlers/reservations/admin/services/commands/update-service-reservation-status-request-handler';
import { AddServiceReservationNoteRequestHandler } from '@/app/request-handlers/reservations/admin/services/commands/add-service-reservation-note-request-handler';
import { DeleteServiceReservationRequestHandler } from '@/app/request-handlers/reservations/admin/services/commands/delete-service-reservation-request-handler';
import { GetPodcastClientDataRequestHandler } from '@/app/request-handlers/reservations/admin/podcast/queries/get-podcast-client-data-request-handler';
import { GetServiceClientDataRequestHandler } from '@/app/request-handlers/reservations/admin/services/queries/get-service-client-data-request-handler';
import { GetDecorsRequestHandler } from '@/app/request-handlers/podcast/admin/get-decors-request-handler';
import { GetPacksRequestHandler } from '@/app/request-handlers/podcast/admin/get-packs-request-handler';
import { GetSupplementsRequestHandler } from '@/app/request-handlers/podcast/admin/get-supplements-request-handler';

// Analytics Request Handlers
import { GetDashboardMetricsRequestHandler } from '@/app/request-handlers/analytics/get-dashboard-metrics-request-handler';
import { GetPodcastAnalyticsRequestHandler } from '@/app/request-handlers/analytics/get-podcast-analytics-request-handler';
import { GetServiceAnalyticsRequestHandler } from '@/app/request-handlers/analytics/get-service-analytics-request-handler';
import { GetTrendAnalysisRequestHandler } from '@/app/request-handlers/analytics/get-trend-analysis-request-handler';
import { GetTopServicesRequestHandler } from '@/app/request-handlers/analytics/get-top-services-request-handler';
import { GetRealtimeDashboardRequestHandler } from '@/app/request-handlers/analytics/get-realtime-dashboard-request-handler';

// Podcast Configuration
import { CreatePodcastDecorRequestHandler } from '@/app/request-handlers/podcast-configuration/decors/create-podcast-decor-request-handler';
import { UpdatePodcastDecorRequestHandler } from '@/app/request-handlers/podcast-configuration/decors/update-podcast-decor-request-handler';
import { DeletePodcastDecorRequestHandler } from '@/app/request-handlers/podcast-configuration/decors/delete-podcast-decor-request-handler';
import { UploadPodcastDecorImageRequestHandler } from '@/app/request-handlers/podcast-configuration/decors/upload-podcast-decor-image-request-handler';
import { CreatePodcastPackOfferRequestHandler } from '@/app/request-handlers/podcast-configuration/packs/create-podcast-pack-offer-request-handler';
import { UpdatePodcastPackOfferRequestHandler } from '@/app/request-handlers/podcast-configuration/packs/update-podcast-pack-offer-request-handler';
import { DeletePodcastPackOfferRequestHandler } from '@/app/request-handlers/podcast-configuration/packs/delete-podcast-pack-offer-request-handler';
import { CreatePodcastSupplementRequestHandler } from '@/app/request-handlers/podcast-configuration/supplements/create-podcast-supplement-request-handler';
import { UpdatePodcastSupplementRequestHandler } from '@/app/request-handlers/podcast-configuration/supplements/update-podcast-supplement-request-handler';
import { DeletePodcastSupplementRequestHandler } from '@/app/request-handlers/podcast-configuration/supplements/delete-podcast-supplement-request-handler';
import { CreatePodcastFormStepRequestHandler } from '@/app/request-handlers/podcast-configuration/steps/create-podcast-form-step-request-handler';
import { UpdatePodcastFormStepRequestHandler } from '@/app/request-handlers/podcast-configuration/steps/update-podcast-form-step-request-handler';
import { DeletePodcastFormStepRequestHandler } from '@/app/request-handlers/podcast-configuration/steps/delete-podcast-form-step-request-handler';
import { GetPodcastFormStructureRequestHandler } from '@/app/request-handlers/podcast-configuration/structure/get-podcast-form-structure-request-handler';
import { CreatePodcastFormQuestionRequestHandler } from '@/app/request-handlers/podcast-configuration/questions/create-podcast-form-question-request-handler';
import { UpdatePodcastFormQuestionRequestHandler } from '@/app/request-handlers/podcast-configuration/questions/update-podcast-form-question-request-handler';
import { DeletePodcastFormQuestionRequestHandler } from '@/app/request-handlers/podcast-configuration/questions/delete-podcast-form-question-request-handler';
import { CreatePodcastThemeRequestHandler } from '@/app/request-handlers/podcast-configuration/themes/create-podcast-theme-request-handler';
import { UpdatePodcastThemeRequestHandler } from '@/app/request-handlers/podcast-configuration/themes/update-podcast-theme-request-handler';
import { DeletePodcastThemeRequestHandler } from '@/app/request-handlers/podcast-configuration/themes/delete-podcast-theme-request-handler';
import { GetPodcastThemesRequestHandler } from '@/app/request-handlers/podcast-configuration/themes/get-podcast-themes-request-handler';
import { GetAvailabilityConfigRequestHandler } from '@/app/request-handlers/podcast/admin/get-availability-config-request-handler';
import { UpdateAvailabilityConfigRequestHandler } from '@/app/request-handlers/podcast/admin/update-availability-config-request-handler';

export const registerRequestHandlers = (containerBuilder: ContainerBuilder) => {
  const builder = new RequestHandlersContainerBuilder(containerBuilder)
    .registerRequestHandlers();

  return builder;
};

/**
 * This class is used to register all the request handlers in the container
 */
class RequestHandlersContainerBuilder {
  constructor(private readonly containerBuilder: ContainerBuilder) { }

  registerRequestHandlers() {
    this
      .registerAuthRequestHandlers()
      .registerUsersRequestHandlers()
      .registerHealthRequestHandlers()
      .registerFormRequestHandlers()
      .registerServiceRequestHandlers()
      .registerReservationRequestHandlers()
      .registerAnalyticsRequestHandlers()
      .registerPodcastConfigurationRequestHandlers();

    return this.containerBuilder;
  }

  private registerAuthRequestHandlers() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.LoginRequestHandler).to(LoginRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.LogoutRequestHandler).to(LogoutRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetMeRequestHandler).to(GetMeRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.RefreshTokenRequestHandler).to(RefreshTokenRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ForgotPasswordRequestHandler).to(ForgotPasswordRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ResetPasswordRequestHandler).to(ResetPasswordRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ChangePasswordRequestHandler).to(ChangePasswordRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.AuthenticatedRequestHandler).to(AuthenticatedRequestHandler).inSingletonScope();
    });

    return this;
  }

  private registerUsersRequestHandlers() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreateUserRequestHandler).to(CreateUserRequestHandler).inSingletonScope();
    });

    return this;
  }

  private registerHealthRequestHandlers() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.HealthRequestHandler).to(HealthRequestHandler).inSingletonScope();
    });

    return this;
  }

  private registerFormRequestHandlers() {
    // Admin - Podcast Questions
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPodcastQuestionsRequestHandler).to(GetPodcastQuestionsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastQuestionRequestHandler).to(CreatePodcastQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastQuestionRequestHandler).to(UpdatePodcastQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastQuestionRequestHandler).to(DeletePodcastQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ReorderPodcastQuestionsRequestHandler).to(ReorderPodcastQuestionsRequestHandler).inSingletonScope();
    });

    // Admin - Podcast Question Answers
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetQuestionAnswersRequestHandler).to(GetQuestionAnswersRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreateQuestionAnswerRequestHandler).to(CreateQuestionAnswerRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdateQuestionAnswerRequestHandler).to(UpdateQuestionAnswerRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeleteQuestionAnswerRequestHandler).to(DeleteQuestionAnswerRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ReorderQuestionAnswersRequestHandler).to(ReorderQuestionAnswersRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UploadAnswerImageRequestHandler).to(UploadAnswerImageRequestHandler).inSingletonScope();
    });

    // Admin - Services Questions
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetServicesQuestionsRequestHandler).to(GetServicesQuestionsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreateServicesQuestionRequestHandler).to(CreateServicesQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdateServicesQuestionRequestHandler).to(UpdateServicesQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeleteServicesQuestionRequestHandler).to(DeleteServicesQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ReorderServicesQuestionsRequestHandler).to(ReorderServicesQuestionsRequestHandler).inSingletonScope();
    });

    // Admin - Services Question Answers
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetServicesQuestionAnswersRequestHandler).to(GetServicesQuestionAnswersRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreateServicesQuestionAnswerRequestHandler).to(CreateServicesQuestionAnswerRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdateServicesQuestionAnswerRequestHandler).to(UpdateServicesQuestionAnswerRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeleteServicesQuestionAnswerRequestHandler).to(DeleteServicesQuestionAnswerRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ReorderServicesQuestionAnswersRequestHandler).to(ReorderServicesQuestionAnswersRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UploadServicesAnswerImageRequestHandler).to(UploadServicesAnswerImageRequestHandler).inSingletonScope();
    });

    // Client - Form Questions
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetClientPodcastQuestionsRequestHandler).to(GetClientPodcastQuestionsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetClientServicesQuestionsRequestHandler).to(GetClientServicesQuestionsRequestHandler).inSingletonScope();
    });

    return this;
  }

  private registerServiceRequestHandlers() {
    // Admin - Services
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetAllServicesRequestHandler).to(GetAllServicesRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetServiceByIdRequestHandler).to(GetServiceByIdRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreateServiceRequestHandler).to(CreateServiceRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdateServiceRequestHandler).to(UpdateServiceRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeleteServiceRequestHandler).to(DeleteServiceRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ToggleServiceStatusRequestHandler).to(ToggleServiceStatusRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.BulkUpdateServiceStatusRequestHandler).to(BulkUpdateServiceStatusRequestHandler).inSingletonScope();
    });

    // Client - Services
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetActiveServicesRequestHandler).to(GetActiveServicesRequestHandler).inSingletonScope();
    });

    return this;
  }

  private registerReservationRequestHandlers() {
    // Client - Reservations
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.SubmitPodcastReservationRequestHandler).to(SubmitPodcastReservationRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.SubmitServiceReservationRequestHandler).to(SubmitServiceReservationRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetReservationConfirmationRequestHandler).to(GetReservationConfirmationRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetFormConfigRequestHandler).to(GetFormConfigRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetAvailabilityRequestHandler).to(GetAvailabilityRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreateReservationRequestHandler).to(CreateReservationRequestHandler).inSingletonScope();
    });

    // Admin - Podcast Reservations
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastReservationRequestHandler).to(CreatePodcastReservationRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ListPodcastReservationsRequestHandler).to(ListPodcastReservationsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPodcastReservationDetailsRequestHandler).to(GetPodcastReservationDetailsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPodcastClientDataRequestHandler).to(GetPodcastClientDataRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetConfirmedCalendarRequestHandler).to(GetConfirmedCalendarRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPendingCalendarRequestHandler).to(GetPendingCalendarRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastReservationStatusRequestHandler).to(UpdatePodcastReservationStatusRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastReservationScheduleRequestHandler).to(UpdatePodcastReservationScheduleRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.AddPodcastReservationNoteRequestHandler).to(AddPodcastReservationNoteRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastReservationRequestHandler).to(DeletePodcastReservationRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetDecorsRequestHandler).to(GetDecorsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPacksRequestHandler).to(GetPacksRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetSupplementsRequestHandler).to(GetSupplementsRequestHandler).inSingletonScope();
    });

    // Admin - Service Reservations
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.ListServiceReservationsRequestHandler).to(ListServiceReservationsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetServiceReservationDetailsRequestHandler).to(GetServiceReservationDetailsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetServiceClientDataRequestHandler).to(GetServiceClientDataRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdateServiceReservationStatusRequestHandler).to(UpdateServiceReservationStatusRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.AddServiceReservationNoteRequestHandler).to(AddServiceReservationNoteRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeleteServiceReservationRequestHandler).to(DeleteServiceReservationRequestHandler).inSingletonScope();
    });

    return this;
  }

  private registerAnalyticsRequestHandlers() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetDashboardMetricsRequestHandler).to(GetDashboardMetricsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPodcastAnalyticsRequestHandler).to(GetPodcastAnalyticsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetServiceAnalyticsRequestHandler).to(GetServiceAnalyticsRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetTrendAnalysisRequestHandler).to(GetTrendAnalysisRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetTopServicesRequestHandler).to(GetTopServicesRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetRealtimeDashboardRequestHandler).to(GetRealtimeDashboardRequestHandler).inSingletonScope();
    });

    return this;
  }

  private registerPodcastConfigurationRequestHandlers() {
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastDecorRequestHandler).to(CreatePodcastDecorRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastDecorRequestHandler).to(UpdatePodcastDecorRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastDecorRequestHandler).to(DeletePodcastDecorRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UploadPodcastDecorImageRequestHandler).to(UploadPodcastDecorImageRequestHandler).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastPackOfferRequestHandler).to(CreatePodcastPackOfferRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastPackOfferRequestHandler).to(UpdatePodcastPackOfferRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastPackOfferRequestHandler).to(DeletePodcastPackOfferRequestHandler).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastSupplementRequestHandler).to(CreatePodcastSupplementRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastSupplementRequestHandler).to(UpdatePodcastSupplementRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastSupplementRequestHandler).to(DeletePodcastSupplementRequestHandler).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastFormStepRequestHandler).to(CreatePodcastFormStepRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastFormStepRequestHandler).to(UpdatePodcastFormStepRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastFormStepRequestHandler).to(DeletePodcastFormStepRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPodcastFormStructureRequestHandler).to(GetPodcastFormStructureRequestHandler).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastFormQuestionRequestHandler).to(CreatePodcastFormQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastFormQuestionRequestHandler).to(UpdatePodcastFormQuestionRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastFormQuestionRequestHandler).to(DeletePodcastFormQuestionRequestHandler).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.CreatePodcastThemeRequestHandler).to(CreatePodcastThemeRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdatePodcastThemeRequestHandler).to(UpdatePodcastThemeRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.DeletePodcastThemeRequestHandler).to(DeletePodcastThemeRequestHandler).inSingletonScope();
    });
    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetPodcastThemesRequestHandler).to(GetPodcastThemesRequestHandler).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.GetAvailabilityConfigRequestHandler).to(GetAvailabilityConfigRequestHandler).inSingletonScope();
    });

    this.containerBuilder.registerActions.push((container) => {
      container.bind<IRequestHandler>(REQUEST_HANDLERS_DI_TYPES.UpdateAvailabilityConfigRequestHandler).to(UpdateAvailabilityConfigRequestHandler).inSingletonScope();
    });

    return this;
  }
}