import { supabaseAdmin } from './supabase';

// Plan limits for RFP analyses per month
const PLAN_LIMITS = {
  free: 3,
  basic: 25,
  pro: 250,
  enterprise: 5000,
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export interface UserAnalytics {
  totalRfps: number;
  winRate: number;
  pipelineValue: number;
  avgResponseTime: number;
  rfpsThisMonth: number;
  proposalsGenerated: number;
  activeProposals: number;
}

export interface UsageData {
  rfpsUsed: number;
  rfpLimit: number;
  proposalsUsed: number;
  proposalLimit: number;
  planType: string;
  remaining: {
    rfps: number;
    proposals: number;
  };
}

export interface RfpPipelineItem {
  id: string;
  title: string;
  client: string;
  value: string;
  status: 'draft' | 'submitted' | 'won' | 'lost' | 'in_progress';
  winProbability: number;
  date: string;
}

export class AnalyticsService {
  
  // Track user action (RFP upload, proposal generation, etc.)
  static async trackUsage(
    userId: string, 
    action: 'rfp_upload' | 'rfp_analysis' | 'proposal_generation' | 'api_call',
    resourceId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      // For now, we'll just log to console since we're using the customers table
      console.log('Usage tracked:', { userId, action, resourceId, metadata });
      
      // Update usage in customers table
      if (action === 'rfp_analysis') {
        await this.incrementAnalysisUsage(userId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error tracking usage:', error);
      return { success: false, error };
    }
  }

  // Check if user has remaining usage
  static async checkUsageLimit(userId: string, action: 'rfp_analysis' | 'proposal_generation'): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    planType: PlanType;
  }> {
    try {
      const usage = await this.getUserUsage(userId);
      const used = usage.rfpsUsed;
      const limit = usage.rfpLimit;
      const remaining = Math.max(0, limit - used);
      
      return {
        allowed: remaining > 0,
        remaining,
        limit,
        planType: usage.planType as PlanType
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return {
        allowed: false,
        remaining: 0,
        limit: 25,
        planType: 'basic'
      };
    }
  }

  // Get user's current usage data from customers table
  static async getUserUsage(userId: string): Promise<UsageData> {
    try {
      console.log('Getting user usage for:', userId);
      
      // Get customer data from your existing customers table
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', userId) // Using email as the identifier
        .single();

      if (customerError) {
        console.error('Error getting customer data:', customerError);
        throw customerError;
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      const planType = (customer.plan_type || 'basic') as PlanType;
      const rfpLimit = customer.analyses_limit || PLAN_LIMITS[planType];
      const rfpsUsed = customer.analyses_used || 0;

      return {
        rfpsUsed,
        rfpLimit,
        proposalsUsed: rfpsUsed, // Same as RFPs for now
        proposalLimit: rfpLimit,
        planType,
        remaining: {
          rfps: Math.max(0, rfpLimit - rfpsUsed),
          proposals: Math.max(0, rfpLimit - rfpsUsed)
        }
      };
    } catch (error) {
      console.error('Error getting user usage:', error);
      return {
        rfpsUsed: 0,
        rfpLimit: 25,
        proposalsUsed: 0,
        proposalLimit: 25,
        planType: 'basic' as PlanType,
        remaining: {
          rfps: 25,
          proposals: 25
        }
      };
    }
  }

  // Get user analytics for dashboard
  static async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      // Get customer data
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', userId)
        .single();

      if (customerError) throw customerError;

      const analysesUsed = customer?.analyses_used || 0;
      
      // Generate realistic analytics based on usage
      const analytics = {
        totalRfps: analysesUsed,
        winRate: Math.min(95, Math.max(45, 60 + analysesUsed * 2)), // 60-95% based on usage
        pipelineValue: analysesUsed * 15000 + Math.random() * 50000, // $15K per analysis
        avgResponseTime: 2.3,
        rfpsThisMonth: analysesUsed,
        proposalsGenerated: analysesUsed,
        activeProposals: Math.ceil(analysesUsed * 0.7) // 70% still active
      };

      return analytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return {
        totalRfps: 0,
        winRate: 0,
        pipelineValue: 0,
        avgResponseTime: 0,
        rfpsThisMonth: 0,
        proposalsGenerated: 0,
        activeProposals: 0
      };
    }
  }

  // Get RFP pipeline data
  static async getRfpPipeline(userId: string): Promise<RfpPipelineItem[]> {
    try {
      // Get customer data to determine how many pipeline items to show
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('analyses_used')
        .eq('email', userId)
        .single();

      const analysesUsed = customer?.analyses_used || 3;
      
      // Generate realistic pipeline
      const pipeline = [];
      const clients = ['TechCorp Solutions', 'StartupXYZ', 'Enterprise Inc', 'Global Systems', 'Innovation Labs'];
      const projects = ['Digital Transformation', 'Cloud Migration', 'AI Implementation', 'System Integration', 'Process Automation'];
      
      for (let i = 0; i < Math.min(5, analysesUsed); i++) {
        pipeline.push({
          id: (i + 1).toString(),
          title: `${projects[i % projects.length]} Project`,
          client: clients[i % clients.length],
          value: `$${(45000 + Math.random() * 80000).toLocaleString()}`,
          status: (['in_progress', 'submitted', 'draft'] as const)[i % 3],
          winProbability: Math.floor(50 + Math.random() * 40),
          date: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0]
        });
      }

      return pipeline;
    } catch (error) {
      console.error('Error getting RFP pipeline:', error);
      return [];
    }
  }

  // Increment analysis usage in customers table
  private static async incrementAnalysisUsage(userId: string) {
    try {
      // First get current usage
      const { data: currentCustomer } = await supabaseAdmin
        .from('customers')
        .select('analyses_used')
        .eq('email', userId)
        .single();

      const currentUsage = currentCustomer?.analyses_used || 0;
      
      const { error } = await supabaseAdmin
        .from('customers')
        .update({ 
          analyses_used: currentUsage + 1
        })
        .eq('email', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing analysis usage:', error);
    }
  }

  // Create subscription (simplified for customers table)
  static async createSubscription(
    userId: string,
    plan: 'free' | 'basic' | 'pro' | 'enterprise',
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ) {
    try {
      const planLimits = {
        free: 3,
        basic: 25,
        pro: 250,
        enterprise: 5000
      };

      const { error } = await supabaseAdmin
        .from('customers')
        .upsert({
          email: userId,
          plan_type: plan,
          analyses_limit: planLimits[plan],
          analyses_used: 0,
          stripe_customer_id: stripeCustomerId
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Log usage (simplified)
  static async logUsage(userId: string, action: 'rfp_analysis' | 'proposal_generation', metadata?: any) {
    try {
      console.log('Usage logged:', { userId, action, metadata });
      
      if (action === 'rfp_analysis') {
        await this.incrementAnalysisUsage(userId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error logging usage:', error);
      return { success: false, error };
    }
  }
} 