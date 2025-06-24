import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🚀 Starting Vercel-compatible database setup...');

    // Test database connection first
    const { data: testData, error: testError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed: ' + testError.message 
      }, { status: 500 });
    }

    console.log('✅ Database connection successful');

    // Check if tables exist by trying to select from them
    const tableChecks = {
      rfps: false,
      proposals: false,
      usage_logs: false
    };

    // Check RFPs table
    const { error: rfpCheck } = await supabaseAdmin
      .from('rfps')
      .select('id')
      .limit(1);
    tableChecks.rfps = !rfpCheck || rfpCheck.code !== '42P01';

    // Check Proposals table  
    const { error: proposalCheck } = await supabaseAdmin
      .from('proposals')
      .select('id')
      .limit(1);
    tableChecks.proposals = !proposalCheck || proposalCheck.code !== '42P01';

    // Check Usage Logs table
    const { error: usageCheck } = await supabaseAdmin
      .from('usage_logs')
      .select('id')
      .limit(1);
    tableChecks.usage_logs = !usageCheck || usageCheck.code !== '42P01';

    console.log('📊 Table status:', tableChecks);

    // If tables don't exist, provide instructions
    const missingTables = Object.entries(tableChecks)
      .filter(([_, exists]) => !exists)
      .map(([table, _]) => table);

    if (missingTables.length > 0) {
      const sqlScript = `
-- Run this SQL script in your Supabase SQL Editor:

-- Create RFPs table
CREATE TABLE IF NOT EXISTS public.rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID REFERENCES public.rfps(id),
  customer_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  estimated_value DECIMAL(12,2),
  win_probability INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Usage Logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id BIGINT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add test data
INSERT INTO public.rfps (customer_id, title, description, requirements, budget_range, status) 
VALUES 
  (1, 'Cloud Infrastructure Migration', 'Migrate legacy systems to cloud', 'AWS expertise required', '$50,000 - $100,000', 'open'),
  (1, 'Mobile App Development', 'Build cross-platform mobile app', 'React Native skills needed', '$25,000 - $50,000', 'open'),
  (1, 'Data Analytics Platform', 'Business intelligence dashboard', 'Python and SQL expertise', '$75,000 - $150,000', 'pending')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on rfps" ON public.rfps FOR ALL USING (true);
CREATE POLICY "Allow all operations on proposals" ON public.proposals FOR ALL USING (true);
CREATE POLICY "Allow all operations on usage_logs" ON public.usage_logs FOR ALL USING (true);
      `;

      return NextResponse.json({ 
        success: false, 
        message: 'Missing database tables detected',
        missingTables,
        tableStatus: tableChecks,
        instructions: 'Please run the provided SQL script in your Supabase dashboard',
        sqlScript,
        supabaseUrl: 'https://supabase.com/dashboard/project'
      });
    }

    // All tables exist - add some test data if needed
    const { data: existingRfps } = await supabaseAdmin
      .from('rfps')
      .select('id')
      .limit(1);

    if (!existingRfps || existingRfps.length === 0) {
      // Add test data
      const { error: insertError } = await supabaseAdmin
        .from('rfps')
        .insert([
          {
            customer_id: 1,
            title: 'Cloud Infrastructure Migration',
            description: 'Migrate legacy systems to cloud',
            requirements: 'AWS expertise required',
            budget_range: '$50,000 - $100,000',
            status: 'open'
          },
          {
            customer_id: 1,
            title: 'Mobile App Development',
            description: 'Build cross-platform mobile app',
            requirements: 'React Native skills needed',
            budget_range: '$25,000 - $50,000',
            status: 'open'
          }
        ]);

      if (insertError) {
        console.log('Note: Could not insert test data:', insertError.message);
      } else {
        console.log('✅ Test data added successfully');
      }
    }

    console.log('✅ Database setup completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database is ready! All tables exist and are accessible.',
      tableStatus: tableChecks,
      environment: process.env.VERCEL_ENV || 'local'
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.VERCEL_ENV || 'local'
    }, { status: 500 });
  }
} 