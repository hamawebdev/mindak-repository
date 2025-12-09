export const REQUEST_HANDLERS_DI_TYPES = {
  LoginRequestHandler: Symbol.for('LoginRequestHandler'),
  LogoutRequestHandler: Symbol.for('LogoutRequestHandler'),
  GetMeRequestHandler: Symbol.for('GetMeRequestHandler'),
  RefreshTokenRequestHandler: Symbol.for('RefreshTokenRequestHandler'),
  ForgotPasswordRequestHandler: Symbol.for('ForgotPasswordRequestHandler'),
  ResetPasswordRequestHandler: Symbol.for('ResetPasswordRequestHandler'),
  ChangePasswordRequestHandler: Symbol.for('ChangePasswordRequestHandler'),
  AuthenticatedRequestHandler: Symbol.for('AuthenticatedRequestHandler'),
  CreateUserRequestHandler: Symbol.for('CreateUserRequestHandler'),
  HealthRequestHandler: Symbol.for('HealthRequestHandler'),

  // Form Management Request Handlers
  // Admin - Podcast Questions
  GetPodcastQuestionsRequestHandler: Symbol.for('GetPodcastQuestionsRequestHandler'),
  CreatePodcastQuestionRequestHandler: Symbol.for('CreatePodcastQuestionRequestHandler'),
  UpdatePodcastQuestionRequestHandler: Symbol.for('UpdatePodcastQuestionRequestHandler'),
  DeletePodcastQuestionRequestHandler: Symbol.for('DeletePodcastQuestionRequestHandler'),
  ReorderPodcastQuestionsRequestHandler: Symbol.for('ReorderPodcastQuestionsRequestHandler'),

  // Admin - Podcast Question Answers
  GetQuestionAnswersRequestHandler: Symbol.for('GetQuestionAnswersRequestHandler'),
  CreateQuestionAnswerRequestHandler: Symbol.for('CreateQuestionAnswerRequestHandler'),
  UpdateQuestionAnswerRequestHandler: Symbol.for('UpdateQuestionAnswerRequestHandler'),
  DeleteQuestionAnswerRequestHandler: Symbol.for('DeleteQuestionAnswerRequestHandler'),
  ReorderQuestionAnswersRequestHandler: Symbol.for('ReorderQuestionAnswersRequestHandler'),
  UploadAnswerImageRequestHandler: Symbol.for('UploadAnswerImageRequestHandler'),

  // Admin - Services Questions
  GetServicesQuestionsRequestHandler: Symbol.for('GetServicesQuestionsRequestHandler'),
  CreateServicesQuestionRequestHandler: Symbol.for('CreateServicesQuestionRequestHandler'),
  UpdateServicesQuestionRequestHandler: Symbol.for('UpdateServicesQuestionRequestHandler'),
  DeleteServicesQuestionRequestHandler: Symbol.for('DeleteServicesQuestionRequestHandler'),
  ReorderServicesQuestionsRequestHandler: Symbol.for('ReorderServicesQuestionsRequestHandler'),

  // Admin - Services Question Answers
  GetServicesQuestionAnswersRequestHandler: Symbol.for('GetServicesQuestionAnswersRequestHandler'),
  CreateServicesQuestionAnswerRequestHandler: Symbol.for('CreateServicesQuestionAnswerRequestHandler'),
  UpdateServicesQuestionAnswerRequestHandler: Symbol.for('UpdateServicesQuestionAnswerRequestHandler'),
  DeleteServicesQuestionAnswerRequestHandler: Symbol.for('DeleteServicesQuestionAnswerRequestHandler'),
  ReorderServicesQuestionAnswersRequestHandler: Symbol.for('ReorderServicesQuestionAnswersRequestHandler'),
  UploadServicesAnswerImageRequestHandler: Symbol.for('UploadServicesAnswerImageRequestHandler'),

  // Client - Form Questions
  GetClientPodcastQuestionsRequestHandler: Symbol.for('GetClientPodcastQuestionsRequestHandler'),
  GetClientServicesQuestionsRequestHandler: Symbol.for('GetClientServicesQuestionsRequestHandler'),

  // Service Management Request Handlers
  // Admin - Services
  GetAllServicesRequestHandler: Symbol.for('GetAllServicesRequestHandler'),
  GetServiceByIdRequestHandler: Symbol.for('GetServiceByIdRequestHandler'),
  CreateServiceRequestHandler: Symbol.for('CreateServiceRequestHandler'),
  UpdateServiceRequestHandler: Symbol.for('UpdateServiceRequestHandler'),
  DeleteServiceRequestHandler: Symbol.for('DeleteServiceRequestHandler'),
  ToggleServiceStatusRequestHandler: Symbol.for('ToggleServiceStatusRequestHandler'),
  BulkUpdateServiceStatusRequestHandler: Symbol.for('BulkUpdateServiceStatusRequestHandler'),

  // Client - Services
  GetActiveServicesRequestHandler: Symbol.for('GetActiveServicesRequestHandler'),

  // Reservation Management Request Handlers
  // Client - Reservations
  SubmitPodcastReservationRequestHandler: Symbol.for('SubmitPodcastReservationRequestHandler'),
  SubmitServiceReservationRequestHandler: Symbol.for('SubmitServiceReservationRequestHandler'),
  GetReservationConfirmationRequestHandler: Symbol.for('GetReservationConfirmationRequestHandler'),
  GetFormConfigRequestHandler: Symbol.for('GetFormConfigRequestHandler'),
  GetAvailabilityRequestHandler: Symbol.for('GetAvailabilityRequestHandler'),
  CreateReservationRequestHandler: Symbol.for('CreateReservationRequestHandler'),

  // Admin - Podcast Reservations
  CreatePodcastReservationRequestHandler: Symbol.for('CreatePodcastReservationRequestHandler'),
  ListPodcastReservationsRequestHandler: Symbol.for('ListPodcastReservationsRequestHandler'),
  GetPodcastReservationDetailsRequestHandler: Symbol.for('GetPodcastReservationDetailsRequestHandler'),
  GetPodcastClientDataRequestHandler: Symbol.for('GetPodcastClientDataRequestHandler'),
  GetConfirmedCalendarRequestHandler: Symbol.for('GetConfirmedCalendarRequestHandler'),
  GetPendingCalendarRequestHandler: Symbol.for('GetPendingCalendarRequestHandler'),
  UpdatePodcastReservationStatusRequestHandler: Symbol.for('UpdatePodcastReservationStatusRequestHandler'),
  UpdatePodcastReservationScheduleRequestHandler: Symbol.for('UpdatePodcastReservationScheduleRequestHandler'),
  AddPodcastReservationNoteRequestHandler: Symbol.for('AddPodcastReservationNoteRequestHandler'),
  DeletePodcastReservationRequestHandler: Symbol.for('DeletePodcastReservationRequestHandler'),
  GetDecorsRequestHandler: Symbol.for('GetDecorsRequestHandler'),
  GetPacksRequestHandler: Symbol.for('GetPacksRequestHandler'),
  GetSupplementsRequestHandler: Symbol.for('GetSupplementsRequestHandler'),

  // Admin - Service Reservations
  ListServiceReservationsRequestHandler: Symbol.for('ListServiceReservationsRequestHandler'),
  GetServiceReservationDetailsRequestHandler: Symbol.for('GetServiceReservationDetailsRequestHandler'),
  GetServiceClientDataRequestHandler: Symbol.for('GetServiceClientDataRequestHandler'),
  UpdateServiceReservationStatusRequestHandler: Symbol.for('UpdateServiceReservationStatusRequestHandler'),
  AddServiceReservationNoteRequestHandler: Symbol.for('AddServiceReservationNoteRequestHandler'),
  DeleteServiceReservationRequestHandler: Symbol.for('DeleteServiceReservationRequestHandler'),

  // Analytics Request Handlers
  GetDashboardMetricsRequestHandler: Symbol.for('GetDashboardMetricsRequestHandler'),
  GetPodcastAnalyticsRequestHandler: Symbol.for('GetPodcastAnalyticsRequestHandler'),
  GetServiceAnalyticsRequestHandler: Symbol.for('GetServiceAnalyticsRequestHandler'),
  GetTrendAnalysisRequestHandler: Symbol.for('GetTrendAnalysisRequestHandler'),
  GetTopServicesRequestHandler: Symbol.for('GetTopServicesRequestHandler'),
  GetRealtimeDashboardRequestHandler: Symbol.for('GetRealtimeDashboardRequestHandler'),

  // Podcast Configuration Request Handlers
  // Decors
  CreatePodcastDecorRequestHandler: Symbol.for('CreatePodcastDecorRequestHandler'),
  UpdatePodcastDecorRequestHandler: Symbol.for('UpdatePodcastDecorRequestHandler'),
  DeletePodcastDecorRequestHandler: Symbol.for('DeletePodcastDecorRequestHandler'),
  UploadPodcastDecorImageRequestHandler: Symbol.for('UploadPodcastDecorImageRequestHandler'),

  // Packs
  CreatePodcastPackOfferRequestHandler: Symbol.for('CreatePodcastPackOfferRequestHandler'),
  UpdatePodcastPackOfferRequestHandler: Symbol.for('UpdatePodcastPackOfferRequestHandler'),
  DeletePodcastPackOfferRequestHandler: Symbol.for('DeletePodcastPackOfferRequestHandler'),

  // Supplements
  CreatePodcastSupplementRequestHandler: Symbol.for('CreatePodcastSupplementRequestHandler'),
  UpdatePodcastSupplementRequestHandler: Symbol.for('UpdatePodcastSupplementRequestHandler'),
  DeletePodcastSupplementRequestHandler: Symbol.for('DeletePodcastSupplementRequestHandler'),

  // Steps
  CreatePodcastFormStepRequestHandler: Symbol.for('CreatePodcastFormStepRequestHandler'),
  UpdatePodcastFormStepRequestHandler: Symbol.for('UpdatePodcastFormStepRequestHandler'),
  DeletePodcastFormStepRequestHandler: Symbol.for('DeletePodcastFormStepRequestHandler'),
  GetPodcastFormStructureRequestHandler: Symbol.for('GetPodcastFormStructureRequestHandler'),

  // Form Questions (New)
  CreatePodcastFormQuestionRequestHandler: Symbol.for('CreatePodcastFormQuestionRequestHandler'),
  UpdatePodcastFormQuestionRequestHandler: Symbol.for('UpdatePodcastFormQuestionRequestHandler'),
  DeletePodcastFormQuestionRequestHandler: Symbol.for('DeletePodcastFormQuestionRequestHandler'),

  // Themes
  CreatePodcastThemeRequestHandler: Symbol.for('CreatePodcastThemeRequestHandler'),
  UpdatePodcastThemeRequestHandler: Symbol.for('UpdatePodcastThemeRequestHandler'),
  DeletePodcastThemeRequestHandler: Symbol.for('DeletePodcastThemeRequestHandler'),
  GetPodcastThemesRequestHandler: Symbol.for('GetPodcastThemesRequestHandler'),

  // Availability
  GetAvailabilityConfigRequestHandler: Symbol.for('GetAvailabilityConfigRequestHandler'),
  UpdateAvailabilityConfigRequestHandler: Symbol.for('UpdateAvailabilityConfigRequestHandler'),
};