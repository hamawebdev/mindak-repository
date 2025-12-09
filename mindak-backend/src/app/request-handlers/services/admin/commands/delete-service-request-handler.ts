import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { DeleteServiceUseCaseFailure, DeleteServiceUseCasePayload, DeleteServiceUseCaseSuccess } from '@/domain/use-cases/service/delete-service-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  message: string;
};

@injectable()
export class DeleteServiceRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.DeleteServiceUseCase) private readonly deleteServiceUseCase: IUseCase<DeleteServiceUseCasePayload, DeleteServiceUseCaseSuccess, DeleteServiceUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;

    const result = await this.deleteServiceUseCase.execute({ id });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Service deleted successfully',
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'ServiceNotFound':
          throw HttpError.notFound('Service not found');
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

