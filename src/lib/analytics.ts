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
  
  // Track user action (RFP upload, proposal generation, etc.) - REAL TRACKING
  static async trackUsage(
    userId: string, 
    action: 'rfp_upload' | 'rfp_analysis' | 'proposal_generation' | 'api_call',
    resourceId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      console.log('REAL Usage tracking:', { userId, action, resourceId, metadata });
      
      // Get customer ID first
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', userId)
        .single();

      if (!customer) {
        console.error('Customer not found for usage tracking:', userId);
        return { success: false, error: 'Customer not found' };
      }

      // Log usage in usage_logs table
      const { error: logError } = await supabaseAdmin
        .from('usage_logs')
        .insert({
          customer_id: customer.id,
          user_email: userId,
          action,
          metadata: metadata || {}
        });

      if (logError) {
        console.error('Error logging usage:', logError);
      }

      // Update usage count in customers table
      if (action === 'rfp_analysis' || action === 'proposal_generation') {
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
        
        // If customer doesn't exist, create a new free plan customer
        if (customerError.code === 'PGRST116') {
          console.log('Customer not found, creating new free plan customer');
          return await this.createNewCustomer(userId, 'free');
        }
        throw customerError;
      }

      if (!customer) {
        console.log('No customer data, creating new free plan customer');
        return await this.createNewCustomer(userId, 'free');
      }

      const planType = (customer.plan_type || 'free') as PlanType;
      const rfpLimit = customer.analyses_limit || PLAN_LIMITS[planType];
      const rfpsUsed = customer.analyses_used || 0;

      console.log(`Customer found: ${customer.email}, Plan: ${planType}, Used: ${rfpsUsed}/${rfpLimit}`);

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
      // Return free plan defaults for new users
      return {
        rfpsUsed: 0,
        rfpLimit: 3,
        proposalsUsed: 0,
        proposalLimit: 3,
        planType: 'free' as PlanType,
        remaining: {
          rfps: 3,
          proposals: 3
        }
      };
    }
  }

  // Create new customer with free plan
  static async createNewCustomer(email: string, plan: PlanType): Promise<UsageData> {
    try {
      const limit = PLAN_LIMITS[plan];
      
      const { data: newCustomer, error } = await supabaseAdmin
        .from('customers')
        .insert({
          email,
          plan_type: plan,
          analyses_limit: limit,
          analyses_used: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating new customer:', error);
        throw error;
      }

      console.log('New customer created:', newCustomer);

      return {
        rfpsUsed: 0,
        rfpLimit: limit,
        proposalsUsed: 0,
        proposalLimit: limit,
        planType: plan,
        remaining: {
          rfps: limit,
          proposals: limit
        }
      };
    } catch (error) {
      console.error('Error creating new customer:', error);
      return {
        rfpsUsed: 0,
        rfpLimit: 3,
        proposalsUsed: 0,
        proposalLimit: 3,
        planType: 'free' as PlanType,
        remaining: {
          rfps: 3,
          proposals: 3
        }
      };
    }
  }

  // Get user analytics for dashboard - REAL DATA FROM DATABASE
  static async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      // Get customer data first
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', userId)
        .single();

      if (customerError) {
        console.error('Customer not found:', customerError);
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

      const customerId = customer.id;

      // Get REAL RFP data from database
      const { data: rfps, error: rfpError } = await supabaseAdmin
        .from('rfps')
        .select('*')
        .eq('customer_id', customerId);

      if (rfpError) {
        console.error('Error fetching RFPs:', rfpError);
      }

      // Get REAL proposal data from database
      const { data: proposals, error: proposalError } = await supabaseAdmin
        .from('proposals')
        .select('*')
        .eq('customer_id', customerId);

      if (proposalError) {
        console.error('Error fetching proposals:', proposalError);
      }

      // Calculate REAL analytics from actual data
      const totalRfps = rfps?.length || 0;
      const totalProposals = proposals?.length || 0;
      const wonProposals = proposals?.filter(p => p.status === 'won').length || 0;
      const activeProposals = proposals?.filter(p => ['draft', 'submitted', 'in_progress'].includes(p.status)).length || 0;
      
      // Calculate win rate
      const winRate = totalProposals > 0 ? Math.round((wonProposals / totalProposals) * 100) : 0;
      
      // Calculate pipeline value from proposals
      const pipelineValue = proposals?.reduce((sum, p) => {
        const value = parseFloat(p.estimated_value || '0');
        return sum + (isNaN(value) ? 0 : value);
      }, 0) || 0;

      // Calculate average response time (days between RFP upload and proposal creation)
      let avgResponseTime = 0;
      if (rfps && proposals && rfps.length > 0 && proposals.length > 0) {
        const responseTimes = proposals
          .filter(p => p.rfp_id)
          .map(p => {
            const rfp = rfps.find(r => r.id === p.rfp_id);
            if (rfp) {
              const rfpDate = new Date(rfp.created_at);
              const proposalDate = new Date(p.created_at);
              return (proposalDate.getTime() - rfpDate.getTime()) / (1000 * 60 * 60 * 24); // days
            }
            return 0;
          })
          .filter(time => time > 0);

        if (responseTimes.length > 0) {
          avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        }
      }

      // Get this month's data
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const rfpsThisMonth = rfps?.filter(r => new Date(r.created_at) >= firstDayOfMonth).length || 0;

      console.log(`REAL Analytics for ${userId}:`, {
        totalRfps,
        totalProposals,
        wonProposals,
        winRate,
        pipelineValue,
        avgResponseTime,
        rfpsThisMonth,
        activeProposals
      });

      return {
        totalRfps,
        winRate,
        pipelineValue,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
        rfpsThisMonth,
        proposalsGenerated: totalProposals,
        activeProposals
      };

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

  // Get RFP pipeline data - REAL DATA FROM DATABASE
  static async getRfpPipeline(userId: string): Promise<RfpPipelineItem[]> {
    try {
      // Get customer data first
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', userId)
        .single();

      if (customerError) {
        console.error('Customer not found for pipeline:', customerError);
        return [];
      }

      const customerId = customer.id;

      // Get REAL proposals - NO JOIN to avoid relationship errors
      const { data: proposals, error: proposalError } = await supabaseAdmin
        .from('proposals')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (proposalError) {
        console.error('Error fetching proposals for pipeline:', proposalError);
        return [];
      }

      // Get RFPs separately if needed
      const { data: rfps } = await supabaseAdmin
        .from('rfps')
        .select('*')
        .eq('customer_id', customerId);

      // Convert real proposals to pipeline format
      const pipeline: RfpPipelineItem[] = (proposals || []).map((proposal, index) => {
        // Try to find matching RFP
        const matchingRfp = rfps?.find(rfp => rfp.id === proposal.rfp_id);
        const rfpTitle = matchingRfp?.title || proposal.title || `Proposal #${index + 1}`;
        
        const value = proposal.estimated_value ? 
          `$${parseFloat(proposal.estimated_value).toLocaleString()}` : 
          '$0';

        return {
          id: proposal.id,
          title: rfpTitle,
          client: proposal.client_name || 'Client',
          value: value,
          status: proposal.status as 'draft' | 'submitted' | 'won' | 'lost' | 'in_progress',
          winProbability: proposal.win_probability || 50,
          date: new Date(proposal.created_at).toISOString().split('T')[0]
        };
      });

      console.log(`REAL Pipeline for ${userId}:`, pipeline);

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