import cors from 'cors';
import helmet from 'helmet';
import type { Container } from 'inversify';
import morgan from 'morgan';
import express, { json, urlencoded, static as expressStatic } from 'express';
import path from 'path';

import { env } from '@/core/env/env';
import { MIDDLEWARES_DI_TYPES } from '@/container/middlewares/di-types';
import { HttpError } from '@/app/http-error';
import type { IErrorMiddleware } from '@/app/middlewares/error-middleware';
import type { ICurrentUserMiddleware } from '@/app/middlewares/current-user-middleware';
import { ROUTERS_DI_TYPES } from '@/container/routers/di-types';
import type { BaseRouter } from '@/app/routers/base-router';

export const createServer = (container: Container) => {
  const corsOptions = {
    origin: env('CORS_ORIGIN_ALLOWED', '*'),
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  const app = express();

  app.use(morgan('dev'));
  app.use(cors(corsOptions));
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(helmet());
  app.set('json spaces', 2);

  // Serve static files from uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', expressStatic(uploadsPath));

  const currentUserMiddleware = container.get<ICurrentUserMiddleware>(MIDDLEWARES_DI_TYPES.CurrentUserMiddleware);
  app.use(currentUserMiddleware.handler.bind(currentUserMiddleware));

  const apiRouter = container.get<BaseRouter>(ROUTERS_DI_TYPES.ApiRouter);
  app.use('/api/v1', apiRouter.getRouter());

  // Mount client forms router without /api/v1 prefix for backward compatibility
  const clientFormsRouter = container.get<BaseRouter>(ROUTERS_DI_TYPES.ClientFormsRouter);
  app.use('/client/forms', clientFormsRouter.getRouter());

  // This is the last request middleware, if no other middleware handled the request, it means
  // the route is not found, so we throw a not found error
  app.use((_req, _res) => {
    throw HttpError.notFound('Resource not found');
  });

  const errorMiddleware = container.get<IErrorMiddleware>(MIDDLEWARES_DI_TYPES.ErrorMiddleware);
  app.use(errorMiddleware.handler.bind(errorMiddleware));
  return app;
};