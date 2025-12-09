import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IAnalyticsRepository, PodcastAnalytics, DateRangeFilter } from '@/domain/repositories/analytics-repository.interface';

export type GetPodcastAnalyticsUseCasePayload = {
  filters: DateRangeFilter;
};

export type GetPodcastAnalyticsUseCaseSuccess = {
  analytics: PodcastAnalytics;
};

export type GetPodcastAnalyticsUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetPodcastAnalyticsUseCase implements IUseCase<GetPodcastAnalyticsUseCasePayload, GetPodcastAnalyticsUseCaseSuccess, GetPodcastAnalyticsUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.AnalyticsRepository) private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(payload: GetPodcastAnalyticsUseCasePayload) {
    try {
      const analytics = await this.analyticsRepository.getPodcastAnalytics(payload.filters);

      return new Success({ analytics });
    } catch (error) {
      return new Failure<GetPodcastAnalyticsUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

