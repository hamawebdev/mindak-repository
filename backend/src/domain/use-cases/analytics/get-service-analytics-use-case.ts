import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IAnalyticsRepository, ServiceAnalytics, DateRangeFilter } from '@/domain/repositories/analytics-repository.interface';

export type GetServiceAnalyticsUseCasePayload = {
  filters: DateRangeFilter;
};

export type GetServiceAnalyticsUseCaseSuccess = {
  analytics: ServiceAnalytics;
};

export type GetServiceAnalyticsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetServiceAnalyticsUseCase implements IUseCase<GetServiceAnalyticsUseCasePayload, GetServiceAnalyticsUseCaseSuccess, GetServiceAnalyticsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.AnalyticsRepository) private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(payload: GetServiceAnalyticsUseCasePayload) {
    try {
      const analytics = await this.analyticsRepository.getServiceAnalytics(payload.filters);

      return new Success({ analytics });
    } catch (error) {
      return new Failure<GetServiceAnalyticsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

