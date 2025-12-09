import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { ListPodcastReservationsUseCaseFailure, ListPodcastReservationsUseCasePayload, ListPodcastReservationsUseCaseSuccess } from '@/domain/use-cases/reservation/list-podcast-reservations-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    reservations: Array<{
      id: string;
      clientId: string;
      confirmationId: string;
      status: string;
      submittedAt: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

@injectable()
export class ListPodcastReservationsRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.ListPodcastReservationsUseCase) private readonly listPodcastReservationsUseCase: IUseCase<ListPodcastReservationsUseCasePayload, ListPodcastReservationsUseCaseSuccess, ListPodcastReservationsUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const order = (req.query.order as 'asc' | 'desc') || 'desc';
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const result = await this.listPodcastReservationsUseCase.execute({
      filters: {
        status,
        search,
        dateFrom,
        dateTo,
      },
      pagination: {
        page,
        limit,
        sortBy,
        order,
      },
    });

    if (result.isSuccess()) {
      const { result: paginatedResult } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          reservations: paginatedResult.data.map(r => ({
            id: r.id,
            clientId: r.clientId,
            confirmationId: r.confirmationId,
            status: r.status,
            submittedAt: r.submittedAt.toISOString(),
          })),
          pagination: {
            total: paginatedResult.total,
            page: paginatedResult.page,
            limit: paginatedResult.limit,
            totalPages: paginatedResult.totalPages,
          },
        },
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

