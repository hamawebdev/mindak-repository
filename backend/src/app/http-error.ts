const errorNameBinding = {
  400: 'BadRequest',
  401: 'Unauthorized',
  402: 'PaymentRequired',
  403: 'Forbidden',
  404: 'NotFound',
  405: 'MethodNotAllowed',
  406: 'NotAcceptable',
  407: 'ProxyAuthenticationRequired',
  408: 'RequestTimeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'LengthRequired',
  412: 'PreconditionFailed',
  413: 'PayloadTooLarge',
  414: 'URITooLong',
  415: 'UnsupportedMediaType',
  416: 'RangeNotSatisfiable',
  417: 'ExpectationFailed',
  418: 'ImATeapot',
  421: 'MisdirectedRequest',
  422: 'UnprocessableEntity',
  423: 'Locked',
  424: 'FailedDependency',
  425: 'UnorderedCollection',
  426: 'UpgradeRequired',
  428: 'PreconditionRequired',
  429: 'TooManyRequests',
  431: 'RequestHeaderFieldsTooLarge',
  451: 'UnavailableForLegalReasons',
  500: 'InternalServerError',
  501: 'NotImplemented',
  502: 'BadGateway',
  503: 'ServiceUnavailable',
  504: 'GatewayTimeout',
  505: 'HTTPVersionNotSupported',
  506: 'VariantAlsoNegotiates',
  507: 'InsufficientStorage',
  508: 'LoopDetected',
  509: 'BandwidthLimitExceeded',
  510: 'NotExtended',
  511: 'NetworkAuthenticationRequired',
} as const;

export type ErrorStatus = keyof typeof errorNameBinding;
export type ErrorName = typeof errorNameBinding[keyof typeof errorNameBinding];

export class HttpError {
  status: ErrorStatus;
  message: string;
  name: ErrorName;
  error?: Error;
  code?: string;
  details?: unknown;

  constructor({ status, message, error, code, details }: { status: ErrorStatus; message: string; error?: Error; code?: string; details?: unknown }) {
    this.status = status;
    this.message = message;
    this.error = error;
    this.code = code;
    this.details = details;

    this.name = errorNameBinding[status];
  }

  static badRequest(message: string, options?: { code?: string; details?: unknown }) {
    return new HttpError({ status: 400, message, code: options?.code, details: options?.details });
  }

  static unauthorized(message: string, options?: { code?: string; details?: unknown }) {
    return new HttpError({ status: 401, message, code: options?.code, details: options?.details });
  }

  static forbidden(message: string, options?: { code?: string; details?: unknown }) {
    return new HttpError({ status: 403, message, code: options?.code, details: options?.details });
  }

  static notFound(message: string, options?: { code?: string; details?: unknown }) {
    return new HttpError({ status: 404, message, code: options?.code, details: options?.details });
  }

  static conflict(message: string, options?: { code?: string; details?: unknown }) {
    return new HttpError({ status: 409, message, code: options?.code, details: options?.details });
  }

  static unprocessableEntity(message: string, options?: { code?: string; details?: unknown }) {
    return new HttpError({ status: 422, message, code: options?.code, details: options?.details });
  }

  static internalServerError(message: string, error?: Error, options?: { code?: string; details?: unknown }) {
    return new HttpError({ status: 500, message, error, code: options?.code, details: options?.details });
  }
}