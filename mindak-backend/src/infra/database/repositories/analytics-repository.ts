import { inject, injectable } from 'inversify';
import { sql, eq, and, gte, lte, desc, count } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import type { IDatabase } from '@/infra/database/database';
import type {
  IAnalyticsRepository,
  PeriodType,
  DateRangeFilter,
  DashboardMetrics,
  PodcastAnalytics,
  ServiceAnalytics,
  TrendMetric,
  TrendAnalysis,
  TopService,
  RealtimeDashboardData,
} from '@/domain/repositories/analytics-repository.interface';
import { podcastReservationTable } from '@/infra/database/schemas/podcast-reservation';
import { serviceReservationTable } from '@/infra/database/schemas/service-reservation';
import { serviceTable } from '@/infra/database/schemas/service';

@injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async getDashboardMetrics(period: PeriodType): Promise<DashboardMetrics> {
    const db = this.database.getInstance();
    const { startDate, endDate, previousStartDate, previousEndDate } = this.getPeriodDates(period);

    // Current period metrics
    const [podcastStats] = await db
      .select({
        total: count(),
        pending: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'pending')`,
        confirmed: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'confirmed')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'completed')`,
        cancelled: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'cancelled')`,
      })
      .from(podcastReservationTable)
      .where(
        and(
          gte(podcastReservationTable.submittedAt, startDate),
          lte(podcastReservationTable.submittedAt, endDate)
        )
      );

    const [serviceStats] = await db
      .select({
        total: count(),
        pending: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'pending')`,
        confirmed: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'confirmed')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'completed')`,
        cancelled: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'cancelled')`,
      })
      .from(serviceReservationTable)
      .where(
        and(
          gte(serviceReservationTable.submittedAt, startDate),
          lte(serviceReservationTable.submittedAt, endDate)
        )
      );

    // Previous period metrics for comparison
    const [previousPodcastStats] = await db
      .select({ total: count() })
      .from(podcastReservationTable)
      .where(
        and(
          gte(podcastReservationTable.submittedAt, previousStartDate),
          lte(podcastReservationTable.submittedAt, previousEndDate)
        )
      );

    const [previousServiceStats] = await db
      .select({ total: count() })
      .from(serviceReservationTable)
      .where(
        and(
          gte(serviceReservationTable.submittedAt, previousStartDate),
          lte(serviceReservationTable.submittedAt, previousEndDate)
        )
      );

    const totalReservations = Number(podcastStats.total) + Number(serviceStats.total);
    const previousTotalReservations = Number(previousPodcastStats.total) + Number(previousServiceStats.total);

    const completedReservations = Number(podcastStats.completed) + Number(serviceStats.completed);
    const conversionRate = totalReservations > 0 ? (completedReservations / totalReservations) * 100 : 0;

    const previousCompletedReservations = Number(previousPodcastStats.total) + Number(previousServiceStats.total);
    const previousConversionRate = previousTotalReservations > 0 ? (previousCompletedReservations / previousTotalReservations) * 100 : 0;

    const reservationsChange = previousTotalReservations > 0
      ? ((totalReservations - previousTotalReservations) / previousTotalReservations) * 100
      : 0;

    const conversionRateChange = previousConversionRate > 0
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
      : 0;

    return {
      totalReservations,
      podcastReservations: Number(podcastStats.total),
      serviceReservations: Number(serviceStats.total),
      pendingReservations: Number(podcastStats.pending) + Number(serviceStats.pending),
      confirmedReservations: Number(podcastStats.confirmed) + Number(serviceStats.confirmed),
      completedReservations,
      cancelledReservations: Number(podcastStats.cancelled) + Number(serviceStats.cancelled),
      conversionRate: Math.round(conversionRate * 100) / 100,
      periodComparison: {
        reservationsChange: Math.round(reservationsChange * 100) / 100,
        conversionRateChange: Math.round(conversionRateChange * 100) / 100,
      },
    };
  }

  async getPodcastAnalytics(filters: DateRangeFilter): Promise<PodcastAnalytics> {
    const db = this.database.getInstance();
    const { dateFrom, dateTo } = this.getDateRange(filters);

    // Status breakdown
    const [stats] = await db
      .select({
        total: count(),
        pending: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'pending')`,
        confirmed: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'confirmed')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'completed')`,
        cancelled: sql<number>`COUNT(*) FILTER (WHERE ${podcastReservationTable.status} = 'cancelled')`,
      })
      .from(podcastReservationTable)
      .where(
        and(
          gte(podcastReservationTable.submittedAt, dateFrom),
          lte(podcastReservationTable.submittedAt, dateTo)
        )
      );

    // Time series data
    const timeSeriesResults = await db
      .select({
        date: sql<string>`DATE(${podcastReservationTable.submittedAt})`,
        count: count(),
      })
      .from(podcastReservationTable)
      .where(
        and(
          gte(podcastReservationTable.submittedAt, dateFrom),
          lte(podcastReservationTable.submittedAt, dateTo)
        )
      )
      .groupBy(sql`DATE(${podcastReservationTable.submittedAt})`)
      .orderBy(sql`DATE(${podcastReservationTable.submittedAt})`);

    return {
      totalCount: Number(stats.total),
      statusBreakdown: {
        pending: Number(stats.pending),
        confirmed: Number(stats.confirmed),
        completed: Number(stats.completed),
        cancelled: Number(stats.cancelled),
      },
      timeSeriesData: timeSeriesResults.map(row => ({
        date: row.date,
        count: Number(row.count),
      })),
    };
  }

  async getServiceAnalytics(filters: DateRangeFilter): Promise<ServiceAnalytics> {
    const db = this.database.getInstance();
    const { dateFrom, dateTo } = this.getDateRange(filters);

    // Status breakdown
    const [stats] = await db
      .select({
        total: count(),
        pending: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'pending')`,
        confirmed: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'confirmed')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'completed')`,
        cancelled: sql<number>`COUNT(*) FILTER (WHERE ${serviceReservationTable.status} = 'cancelled')`,
      })
      .from(serviceReservationTable)
      .where(
        and(
          gte(serviceReservationTable.submittedAt, dateFrom),
          lte(serviceReservationTable.submittedAt, dateTo)
        )
      );

    // Time series data
    const timeSeriesResults = await db
      .select({
        date: sql<string>`DATE(${serviceReservationTable.submittedAt})`,
        count: count(),
      })
      .from(serviceReservationTable)
      .where(
        and(
          gte(serviceReservationTable.submittedAt, dateFrom),
          lte(serviceReservationTable.submittedAt, dateTo)
        )
      )
      .groupBy(sql`DATE(${serviceReservationTable.submittedAt})`)
      .orderBy(sql`DATE(${serviceReservationTable.submittedAt})`);

    // Top services - need to unnest the service_ids JSON array
    const topServicesResults = await db.execute<{
      service_id: string;
      service_name: string;
      count: string;
    }>(sql`
      SELECT 
        s.id as service_id,
        s.name as service_name,
        COUNT(*) as count
      FROM ${serviceReservationTable} sr
      CROSS JOIN LATERAL jsonb_array_elements_text(sr.service_ids) as service_id
      JOIN ${serviceTable} s ON s.id = service_id::uuid
      WHERE sr.submitted_at >= ${dateFrom}
        AND sr.submitted_at <= ${dateTo}
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT 10
    `);

    const totalCount = Number(stats.total);
    const topServices = topServicesResults.rows.map(row => ({
      serviceId: row.service_id,
      serviceName: row.service_name,
      count: Number(row.count),
      percentage: totalCount > 0 ? Math.round((Number(row.count) / totalCount) * 10000) / 100 : 0,
    }));

    return {
      totalCount,
      statusBreakdown: {
        pending: Number(stats.pending),
        confirmed: Number(stats.confirmed),
        completed: Number(stats.completed),
        cancelled: Number(stats.cancelled),
      },
      topServices,
      timeSeriesData: timeSeriesResults.map(row => ({
        date: row.date,
        count: Number(row.count),
      })),
    };
  }

  async getTrendAnalysis(metric: TrendMetric, period: string): Promise<TrendAnalysis> {
    const db = this.database.getInstance();
    const { startDate, endDate } = this.parsePeriod(period);

    let data: Array<{ date: string; value: number }> = [];

    if (metric === 'reservations' || metric === 'podcast' || metric === 'services') {
      const table = metric === 'podcast' ? podcastReservationTable :
        metric === 'services' ? serviceReservationTable : null;

      if (table) {
        const results = await db
          .select({
            date: sql<string>`DATE(${table.submittedAt})`,
            value: count(),
          })
          .from(table)
          .where(
            and(
              gte(table.submittedAt, startDate),
              lte(table.submittedAt, endDate)
            )
          )
          .groupBy(sql`DATE(${table.submittedAt})`)
          .orderBy(sql`DATE(${table.submittedAt})`);

        data = results.map(row => ({
          date: row.date,
          value: Number(row.value),
        }));
      } else {
        // Combined reservations
        const podcastResults = await db
          .select({
            date: sql<string>`DATE(${podcastReservationTable.submittedAt})`,
            value: count(),
          })
          .from(podcastReservationTable)
          .where(
            and(
              gte(podcastReservationTable.submittedAt, startDate),
              lte(podcastReservationTable.submittedAt, endDate)
            )
          )
          .groupBy(sql`DATE(${podcastReservationTable.submittedAt})`);

        const serviceResults = await db
          .select({
            date: sql<string>`DATE(${serviceReservationTable.submittedAt})`,
            value: count(),
          })
          .from(serviceReservationTable)
          .where(
            and(
              gte(serviceReservationTable.submittedAt, startDate),
              lte(serviceReservationTable.submittedAt, endDate)
            )
          )
          .groupBy(sql`DATE(${serviceReservationTable.submittedAt})`);

        // Merge the results
        const dateMap = new Map<string, number>();
        podcastResults.forEach(row => {
          dateMap.set(row.date, Number(row.value));
        });
        serviceResults.forEach(row => {
          const existing = dateMap.get(row.date) || 0;
          dateMap.set(row.date, existing + Number(row.value));
        });

        data = Array.from(dateMap.entries())
          .map(([date, value]) => ({ date, value }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const average = data.length > 0 ? total / data.length : 0;
    const peak = data.length > 0 ? Math.max(...data.map(item => item.value)) : 0;
    const peakDate = data.find(item => item.value === peak)?.date || '';

    return {
      metric,
      period,
      data,
      summary: {
        total,
        average: Math.round(average * 100) / 100,
        peak,
        peakDate,
      },
    };
  }

  async getTopServices(limit: number, period: string): Promise<TopService[]> {
    const db = this.database.getInstance();
    const { startDate, endDate } = this.parsePeriod(period);

    // Get current period top services
    const currentResults = await db.execute<{
      service_id: string;
      service_name: string;
      count: string;
    }>(sql`
      SELECT
        s.id as service_id,
        s.name as service_name,
        COUNT(*) as count
      FROM ${serviceReservationTable} sr
      CROSS JOIN LATERAL jsonb_array_elements_text(sr.service_ids) as service_id
      JOIN ${serviceTable} s ON s.id = service_id::uuid
      WHERE sr.submitted_at >= ${startDate}
        AND sr.submitted_at <= ${endDate}
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT ${limit}
    `);

    // Get previous period for trend comparison
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    const previousEndDate = new Date(startDate);

    const previousResults = await db.execute<{
      service_id: string;
      count: string;
    }>(sql`
      SELECT
        s.id as service_id,
        COUNT(*) as count
      FROM ${serviceReservationTable} sr
      CROSS JOIN LATERAL jsonb_array_elements_text(sr.service_ids) as service_id
      JOIN ${serviceTable} s ON s.id = service_id::uuid
      WHERE sr.submitted_at >= ${previousStartDate}
        AND sr.submitted_at <= ${previousEndDate}
      GROUP BY s.id
    `);

    const previousCountMap = new Map<string, number>();
    previousResults.rows.forEach(row => {
      previousCountMap.set(row.service_id, Number(row.count));
    });

    const totalReservations = currentResults.rows.reduce((sum, row) => sum + Number(row.count), 0);

    return currentResults.rows.map(row => {
      const currentCount = Number(row.count);
      const previousCount = previousCountMap.get(row.service_id) || 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (currentCount > previousCount) {
        trend = 'up';
      } else if (currentCount < previousCount) {
        trend = 'down';
      }

      return {
        serviceId: row.service_id,
        serviceName: row.service_name,
        reservationCount: currentCount,
        percentage: totalReservations > 0 ? Math.round((currentCount / totalReservations) * 10000) / 100 : 0,
        trend,
      };
    });
  }

  async getRealtimeDashboardData(): Promise<RealtimeDashboardData> {
    const db = this.database.getInstance();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today's counts
    const [podcastToday] = await db
      .select({ count: count() })
      .from(podcastReservationTable)
      .where(gte(podcastReservationTable.submittedAt, todayStart));

    const [serviceToday] = await db
      .select({ count: count() })
      .from(serviceReservationTable)
      .where(gte(serviceReservationTable.submittedAt, todayStart));

    // Recent reservations (last 10)
    const recentPodcast = await db
      .select({
        id: podcastReservationTable.id,
        confirmationId: podcastReservationTable.confirmationId,
        status: podcastReservationTable.status,
        submittedAt: podcastReservationTable.submittedAt,
      })
      .from(podcastReservationTable)
      .orderBy(desc(podcastReservationTable.submittedAt))
      .limit(5);

    const recentService = await db
      .select({
        id: serviceReservationTable.id,
        confirmationId: serviceReservationTable.confirmationId,
        status: serviceReservationTable.status,
        submittedAt: serviceReservationTable.submittedAt,
      })
      .from(serviceReservationTable)
      .orderBy(desc(serviceReservationTable.submittedAt))
      .limit(5);

    const recentReservations = [
      ...recentPodcast.map(r => ({ ...r, type: 'podcast' as const })),
      ...recentService.map(r => ({ ...r, type: 'service' as const })),
    ]
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      .slice(0, 10);

    // Hourly data for today
    const hourlyPodcast = await db.execute<{
      hour: number;
      count: string;
    }>(sql`
      SELECT
        EXTRACT(HOUR FROM submitted_at) as hour,
        COUNT(*) as count
      FROM ${podcastReservationTable}
      WHERE submitted_at >= ${todayStart}
      GROUP BY EXTRACT(HOUR FROM submitted_at)
      ORDER BY hour
    `);

    const hourlyService = await db.execute<{
      hour: number;
      count: string;
    }>(sql`
      SELECT
        EXTRACT(HOUR FROM submitted_at) as hour,
        COUNT(*) as count
      FROM ${serviceReservationTable}
      WHERE submitted_at >= ${todayStart}
      GROUP BY EXTRACT(HOUR FROM submitted_at)
      ORDER BY hour
    `);

    // Merge hourly data
    const hourlyMap = new Map<number, number>();
    hourlyPodcast.rows.forEach(row => {
      hourlyMap.set(row.hour, Number(row.count));
    });
    hourlyService.rows.forEach(row => {
      const existing = hourlyMap.get(row.hour) || 0;
      hourlyMap.set(row.hour, existing + Number(row.count));
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyMap.get(i) || 0,
    }));

    return {
      todayReservations: Number(podcastToday.count) + Number(serviceToday.count),
      todayPodcast: Number(podcastToday.count),
      todayServices: Number(serviceToday.count),
      recentReservations,
      hourlyData,
    };
  }

  // Helper methods
  private getPeriodDates(period: PeriodType) {
    const now = new Date();
    const endDate = now;
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        previousStartDate = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), previousEndDate.getDate());
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        previousEndDate = new Date(startDate);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        previousEndDate = new Date(startDate);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        previousEndDate = new Date(startDate);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 30);
    }

    return { startDate, endDate, previousStartDate, previousEndDate };
  }

  private getDateRange(filters: DateRangeFilter) {
    const now = new Date();
    const dateFrom = filters.dateFrom || new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const dateTo = filters.dateTo || now;
    return { dateFrom, dateTo };
  }

  private parsePeriod(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = now;
    let startDate: Date;

    const match = period.match(/^(\d+)d$/);
    if (match) {
      const days = parseInt(match[1], 10);
      startDate = new Date(now);
      startDate.setDate(now.getDate() - days);
    } else {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate };
  }
}

