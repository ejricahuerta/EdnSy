export interface AnalyticsMetrics {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    path: string;
    title: string;
    domain: string;
    views: number;
    uniqueViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
  }>;
  trafficSources: Array<{
    source: string;
    medium: string;
    sessions: number;
    users: number;
    bounceRate: number;
    conversionRate: number;
  }>;
  userRetention: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
  };
  isRealData?: boolean;
  error?: string;
}

export interface AnalyticsPage {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  bounceRate: number;
  conversionRate: number;
}

export interface UserRetentionData {
  day1: number;
  day7: number;
  day14: number;
  day30: number;
}

class AnalyticsService {
  async getMetrics(startDate: string = '30daysAgo', endDate: string = 'today'): Promise<AnalyticsMetrics> {
    try {
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      throw new Error('Failed to fetch analytics metrics');
    }
  }

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    currentPageViews: number;
    topActivePages: string[];
  }> {
    try {
      // Mock real-time data for now
      return {
        activeUsers: 45,
        currentPageViews: 120,
        topActivePages: ['/', '/dashboard', '/analytics']
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw new Error('Failed to fetch real-time metrics');
    }
  }

  async getConversionMetrics(): Promise<{
    totalConversions: number;
    conversionRate: number;
    topConversionPaths: any[];
    ecommerceRevenue: number;
  }> {
    try {
      // Mock conversion data for now
      return {
        totalConversions: 1250,
        conversionRate: 2.3,
        topConversionPaths: [
          { path: '/product-page', conversions: 450 },
          { path: '/checkout', conversions: 320 },
          { path: '/landing-page', conversions: 280 }
        ],
        ecommerceRevenue: 45000
      };
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
      throw new Error('Failed to fetch conversion metrics');
    }
  }
}

export const analyticsService = new AnalyticsService(); 