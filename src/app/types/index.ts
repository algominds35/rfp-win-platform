// File: src/types/index.ts
export interface User {
    id: string;
    email: string;
    name: string;
    workspace_id: string;
    role: 'admin' | 'member' | 'viewer';
    created_at: string;
  }
  
  export interface Workspace {
    id: string;
    name: string;
    plan: 'starter' | 'pro' | 'enterprise';
    created_at: string;
    owner_id: string;
  }
  
  export interface RFP {
    id: string;
    workspace_id: string;
    title: string;
    description: string;
    requirements: string[];
    deadline: string;
    budget_range?: string;
    file_url?: string;
    extracted_text?: string;
    status: 'analyzing' | 'ready' | 'completed';
    created_at: string;
  }
  
  export interface Proposal {
    id: string;
    rfp_id: string;
    workspace_id: string;
    title: string;
    content: string;
    executive_summary: string;
    pricing: ProposalPricing[];
    compliance_score: number;
    win_probability: number;
    status: 'draft' | 'review' | 'submitted' | 'won' | 'lost';
    created_at: string;
    updated_at: string;
  }
  
  export interface ProposalPricing {
    item: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }
  
  export interface CompanyProfile {
    id: string;
    workspace_id: string;
    name: string;
    description: string;
    capabilities: string[];
    past_projects: ProjectCase[];
    team_members: TeamMember[];
    certifications: string[];
    created_at: string;
  }
  
  export interface ProjectCase {
    title: string;
    description: string;
    client: string;
    value: number;
    duration: string;
    outcomes: string[];
  }
  
  export interface TeamMember {
    name: string;
    role: string;
    bio: string;
    skills: string[];
  }
  
  export interface Template {
    id: string;
    workspace_id: string;
    name: string;
    type: 'government' | 'enterprise' | 'technical' | 'consulting';
    sections: TemplateSection[];
    created_at: string;
  }
  
  export interface TemplateSection {
    title: string;
    content: string;
    order: number;
    required: boolean;
  }