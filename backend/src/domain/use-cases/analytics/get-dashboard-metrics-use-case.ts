import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IAnalyticsRepository, DashboardMetrics, PeriodType } from '@/domain/repositories/analytics-repository.interface';

export type GetDashboardMetricsUseCasePayload = {
  period: PeriodType;
};

export type GetDashboardMetricsUseCaseSuccess = {
  metrics: DashboardMetrics;
};

export type GetDashboardMetricsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetDashboardMetricsUseCase implements IUseCase<GetDashboardMetricsUseCasePayload, GetDashboardMetricsUseCaseSuccess, GetDashboardMetricsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.AnalyticsRepository) private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(payload: GetDashboardMetricsUseCasePayload) {
    try {
      const metrics = await this.analyticsRepository.getDashboardMetrics(payload.period);

      return new Success({ metrics });
    } catch (error) {
      return new Failure<GetDashboardMetricsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

