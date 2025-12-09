import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IAnalyticsRepository, TopService } from '@/domain/repositories/analytics-repository.interface';

export type GetTopServicesUseCasePayload = {
  limit: number;
  period: string;
};

export type GetTopServicesUseCaseSuccess = {
  services: TopService[];
};

export type GetTopServicesUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetTopServicesUseCase implements IUseCase<GetTopServicesUseCasePayload, GetTopServicesUseCaseSuccess, GetTopServicesUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.AnalyticsRepository) private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(payload: GetTopServicesUseCasePayload) {
    try {
      const services = await this.analyticsRepository.getTopServices(payload.limit, payload.period);

      return new Success({ services });
    } catch (error) {
      return new Failure<GetTopServicesUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

