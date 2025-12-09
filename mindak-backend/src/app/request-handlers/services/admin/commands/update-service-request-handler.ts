import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { UpdateServiceUseCaseFailure, UpdateServiceUseCasePayload, UpdateServiceUseCaseSuccess } from '@/domain/use-cases/service/update-service-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type RequestBody = {
  name?: string;
  description?: string | null;
  price?: string | null;
  category_id?: string | null;
  is_active?: boolean;
  display_order?: number;
};

type ResponseBody = {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string | null;
    price: string | null;
    category_id: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
  };
};

@injectable()
export class UpdateServiceRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.UpdateServiceUseCase) private readonly updateServiceUseCase: IUseCase<UpdateServiceUseCasePayload, UpdateServiceUseCaseSuccess, UpdateServiceUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { id } = req.params;
    const body = req.body as RequestBody;

    const result = await this.updateServiceUseCase.execute({
      id,
      name: body.name,
      description: body.description,
      price: body.price,
      categoryId: body.category_id,
      isActive: body.is_active,
      displayOrder: body.display_order,
    });

    if (result.isSuccess()) {
      const { service } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          category_id: service.categoryId,
          is_active: service.isActive,
          display_order: service.displayOrder,
          created_at: service.createdAt.toISOString(),
          updated_at: service.updatedAt.toISOString(),
        },
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

