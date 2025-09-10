export interface StripeMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  customerLifetimeValue: number;
  paymentSuccessRate: number;
  disputes: number;
  subscriptionDetails?: Array<{
    id: string;
    customerName: string;
    productName: string;
    amount: number;
    status: string;
    created: number;
    currentPeriodEnd: number;
  }>;
  customerDetails?: Array<{
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    created: number;
    subscriptions: number;
  }>;
  paymentDetails?: Array<{
    id: string;
    amount: number;
    status: string;
    created: number;
    customerEmail: string;
  }>;
  disputeDetails?: Array<{
    id: string;
    amount: number;
    reason: string;
    status: string;
    created: number;
  }>;
  isRealData?: boolean;
  error?: string;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  plan: {
    amount: number;
    currency: string;
    interval: string;
  };
  created: number;
}

export interface StripeCustomer {
  id: string;
  email: string;
  created: number;
  total_spent: number;
  subscriptions: StripeSubscription[];
}

class StripeService {
  async getMetrics(): Promise<StripeMetrics> {
    try {
      const response = await fetch('/api/stripe');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Stripe metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Stripe metrics:', error);
      throw new Error('Failed to fetch Stripe metrics');
    }
  }

  async getSubscriptionAnalytics(): Promise<{
    activeSubscriptions: StripeSubscription[];
    recentSubscriptions: StripeSubscription[];
    subscriptionGrowth: number;
  }> {
    try {
      // Mock data for now
      return {
        activeSubscriptions: [],
        recentSubscriptions: [],
        subscriptionGrowth: 12.5
      };
    } catch (error) {
      console.error('Error fetching subscription analytics:', error);
      throw new Error('Failed to fetch subscription analytics');
    }
  }
}

export const stripeService = new StripeService(); 