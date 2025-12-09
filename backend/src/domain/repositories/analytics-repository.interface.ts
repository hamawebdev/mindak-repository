export type PeriodType = 'daily' | 'weekly' | 'monthly' | '7d' | '30d' | '90d';

export type DateRangeFilter = {
  dateFrom?: Date;
  dateTo?: Date;
};

export type DashboardMetrics = {
  totalReservations: number;
  podcastReservations: number;
  serviceReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  conversionRate: number; // percentage
  periodComparison: {
    reservationsChange: number; // percentage change from previous period
    conversionRateChange: number; // percentage change from previous period
  };
};

export type PodcastAnalytics = {
  totalCount: number;
  statusBreakdown: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  timeSeriesData: Array<{
    date: string; // ISO date string
    count: number;
  }>;
};

export type ServiceAnalytics = {
  totalCount: number;
  statusBreakdown: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string; // ISO date string
    count: number;
  }>;
};

export type TrendMetric = 'reservations' | 'podcast' | 'services' | 'conversion';

export type TrendAnalysis = {
  metric: TrendMetric;
  period: string;
  data: Array<{
    date: string; // ISO date string
    value: number;
    label?: string;
  }>;
  summary: {
    total: number;
    average: number;
    peak: number;
    peakDate: string;
  };
};

export type TopService = {
  serviceId: string;
  serviceName: string;
  reservationCount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
};

export type RealtimeDashboardData = {
  todayReservations: number;
  todayPodcast: number;
  todayServices: number;
  recentReservations: Array<{
    id: string;
    type: 'podcast' | 'service';
    confirmationId: string;
    status: string;
    submittedAt: Date;
  }>;
  hourlyData: Array<{
    hour: number;
    count: number;
  }>;
};

export interface IAnalyticsRepository {
  getDashboardMetrics(period: PeriodType): Promise<DashboardMetrics>;
  getPodcastAnalytics(filters: DateRangeFilter): Promise<PodcastAnalytics>;
  getServiceAnalytics(filters: DateRangeFilter): Promise<ServiceAnalytics>;
  getTrendAnalysis(metric: TrendMetric, period: string): Promise<TrendAnalysis>;
  getTopServices(limit: number, period: string): Promise<TopService[]>;
  getRealtimeDashboardData(): Promise<RealtimeDashboardData>;
}

