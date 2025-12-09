export const MIDDLEWARES_DI_TYPES = {
  AuthenticatedMiddleware: Symbol.for('AuthenticatedMiddleware'),
  AdminMiddleware: Symbol.for('AdminMiddleware'),
  ErrorMiddleware: Symbol.for('ErrorMiddleware'),
  CurrentUserMiddleware: Symbol.for('CurrentUserMiddleware'),
  UploadMiddleware: Symbol.for('UploadMiddleware'),
};