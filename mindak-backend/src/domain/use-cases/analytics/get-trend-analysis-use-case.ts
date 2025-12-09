import { inject, injectable } from 'inversify';

import type { IUseCase } from '@/core/use-case/use-case.interface';
import { Success, Failure } from '@/core/result/result';
import { REPOSITORIES_DI_TYPES } from '@/container/repositories/di-types';
import type { IAnalyticsRepository, TrendAnalysis, TrendMetric } from '@/domain/repositories/analytics-repository.interface';

export type GetTrendAnalysisUseCasePayload = {
  metric: TrendMetric;
  period: string;
};

export type GetTrendAnalysisUseCaseSuccess = {
  analysis: TrendAnalysis;
};

export type GetTrendAnalysisUseCaseFailure = {
  reason: 'UnknownError';
  error: Error;
};

@injectable()
export class GetTrendAnalysisUseCase implements IUseCase<GetTrendAnalysisUseCasePayload, GetTrendAnalysisUseCaseSuccess, GetTrendAnalysisUseCaseFailure> {
  constructor(
    @inject(REPOSITORIES_DI_TYPES.AnalyticsRepository) private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(payload: GetTrendAnalysisUseCasePayload) {
    try {
      const analysis = await this.analyticsRepository.getTrendAnalysis(payload.metric, payload.period);

      return new Success({ analysis });
    } catch (error) {
      return new Failure<GetTrendAnalysisUseCaseFailure>({
        reason: 'UnknownError',
        error: error as Error,
      });
    }
  }
}

