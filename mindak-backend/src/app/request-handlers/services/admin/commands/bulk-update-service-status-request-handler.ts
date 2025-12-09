import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { BulkUpdateServiceStatusUseCaseFailure, BulkUpdateServiceStatusUseCasePayload, BulkUpdateServiceStatusUseCaseSuccess } from '@/domain/use-cases/service/bulk-update-service-status-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type RequestBody = {
  ids: string[];
  is_active: boolean;
};

type ResponseBody = {
  success: boolean;
  message: string;
};

@injectable()
export class BulkUpdateServiceStatusRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.BulkUpdateServiceStatusUseCase) private readonly bulkUpdateServiceStatusUseCase: IUseCase<BulkUpdateServiceStatusUseCasePayload, BulkUpdateServiceStatusUseCaseSuccess, BulkUpdateServiceStatusUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const body = req.body as RequestBody;

    // Validation
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      throw HttpError.badRequest('Service IDs array is required and must not be empty');
    }

    if (typeof body.is_active !== 'boolean') {
      throw HttpError.badRequest('is_active must be a boolean');
    }

    const result = await this.bulkUpdateServiceStatusUseCase.execute({
      ids: body.ids,
      isActive: body.is_active,
    });

    if (result.isSuccess()) {
      const response: ResponseBody = {
        success: true,
        message: 'Services status updated successfully',
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}

