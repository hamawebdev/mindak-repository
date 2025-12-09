import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetAllServicesUseCaseFailure, GetAllServicesUseCasePayload, GetAllServicesUseCaseSuccess } from '@/domain/use-cases/service/get-all-services-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';

type ResponseBody = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    price: string | null;
    category_id: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
  }>;
};

@injectable()
export class GetAllServicesRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetAllServicesUseCase) private readonly getAllServicesUseCase: IUseCase<GetAllServicesUseCasePayload, GetAllServicesUseCaseSuccess, GetAllServicesUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const result = await this.getAllServicesUseCase.execute({
      includeInactive: true, // Admin sees all services
    });

    if (result.isSuccess()) {
      const { services } = result.value;

      const response: ResponseBody = {
        success: true,
        data: services.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          category_id: s.categoryId,
          is_active: s.isActive,
          display_order: s.displayOrder,
          created_at: s.createdAt.toISOString(),
          updated_at: s.updatedAt.toISOString(),
        })),
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

