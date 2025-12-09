import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IAnalyticsRepository, RealtimeDashboardData } from '@/domain/repositories/analytics-repository.interface';

export type GetRealtimeDashboardUseCasePayload = Record<string, never>;

export type GetRealtimeDashboardUseCaseSuccess = {
  data: RealtimeDashboardData;
};

export type GetRealtimeDashboardUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetRealtimeDashboardUseCase implements IUseCase<GetRealtimeDashboardUseCasePayload, GetRealtimeDashboardUseCaseSuccess, GetRealtimeDashboardUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.AnalyticsRepository) private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(_payload: GetRealtimeDashboardUseCasePayload) {
    try {
      const data = await this.analyticsRepository.getRealtimeDashboardData();

      return new Success({ data });
    } catch (error) {
      return new Failure<GetRealtimeDashboardUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

