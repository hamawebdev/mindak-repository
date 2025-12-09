import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { CreateServiceUseCaseFailure, CreateServiceUseCasePayload, CreateServiceUseCaseSuccess } from '@/domain/use-cases/service/create-service-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type RequestBody = {
  name: string;
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
export class CreateServiceRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.CreateServiceUseCase) private readonly createServiceUseCase: IUseCase<CreateServiceUseCasePayload, CreateServiceUseCaseSuccess, CreateServiceUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const body = req.body as RequestBody;

    // Validation
    if (!body.name || body.name.trim() === '') {
      throw HttpError.badRequest('Service name is required');
    }

    const result = await this.createServiceUseCase.execute({
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

      res.status(201).send(response);
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

