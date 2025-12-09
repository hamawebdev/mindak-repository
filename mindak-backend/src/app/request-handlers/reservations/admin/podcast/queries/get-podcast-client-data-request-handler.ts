import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';

import type { IRequestHandler } from '@/app/request-handlers/request-handler.interface';
import type { IUseCase } from '@/core/use-case/use-case.interface';
import type { GetPodcastClientDataUseCaseFailure, GetPodcastClientDataUseCasePayload, GetPodcastClientDataUseCaseSuccess } from '@/domain/use-cases/reservation/get-podcast-client-data-use-case';
import { USE_CASES_DI_TYPES } from '@/container/use-cases/di-types';
import { HttpError } from '@/app/http-error';

type ResponseBody = {
  success: boolean;
  data: {
    client: {
      id: string;
      reservations: Array<{
        reservationId: string;
        confirmationId: string;
        status: string;
        submittedAt: string;
        clientAnswers: any[];
      }>;
    };
  };
};

@injectable()
export class GetPodcastClientDataRequestHandler implements IRequestHandler<ResponseBody> {
  constructor(
    @inject(USE_CASES_DI_TYPES.GetPodcastClientDataUseCase) private readonly getPodcastClientDataUseCase: IUseCase<GetPodcastClientDataUseCasePayload, GetPodcastClientDataUseCaseSuccess, GetPodcastClientDataUseCaseFailure>,
  ) {}

  async handler(req: Request, res: Response<ResponseBody>) {
    const { clientId } = req.params;

    if (!clientId) {
      throw new HttpError({ status: 400, message: 'Client ID is required' });
    }

    const result = await this.getPodcastClientDataUseCase.execute({ clientId });

    if (result.isSuccess()) {
      const { client } = result.value;

      const response: ResponseBody = {
        success: true,
        data: {
          client: {
            id: client.id,
            reservations: client.reservations.map(r => ({
              reservationId: r.reservationId,
              confirmationId: r.confirmationId,
              status: r.status,
              submittedAt: r.submittedAt.toISOString(),
              clientAnswers: r.clientAnswers,
            })),
          },
        },
      };

      res.status(200).send(response);
      return;
    } else if (result.isFailure()) {
      const failure = result.failure;

      switch (failure.reason) {
        case 'ClientNotFound':
          throw new HttpError({ status: 404, message: 'Client not found' });
        case 'UnknownError':
          throw failure.error;
      }
    }
  }
}
