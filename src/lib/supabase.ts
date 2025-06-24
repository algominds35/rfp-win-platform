import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export interface Company {
  id: string;
  user_id: string;
  name: string;
  team_size: string;
  industry: string;
  capabilities: string[];
  contact_email: string;
  contact_phone: string;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface RFP {
  id: string;
  user_id: string;
  title: string;
  description: string;
  requirements: string[];
  evaluation_criteria: string[];
  budget_range: string;
  deadline: string;
  risk_factors: string[];
  recommendations: string[];
  compliance_score: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  user_id: string;
  rfp_id: string;
  content: string;
  executive_summary: string;
  win_probability: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  rfp_limit: number;
  rfps_used: number;
  created_at: string;
  updated_at: string;
}

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);