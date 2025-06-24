import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🚀 Starting automatic database setup...');

    // Create RFPs table
    const { error: rfpsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS rfps (
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
      `
    });

    if (rfpsError) {
      console.log('Creating RFPs table directly...');
      const { error: directRfpsError } = await supabaseAdmin
        .from('rfps')
        .select('id')
        .limit(1);
      
      if (directRfpsError && directRfpsError.code === '42P01') {
        // Table doesn't exist, create it using raw SQL
        const { error: createError } = await supabaseAdmin.rpc('exec', {
          sql: `
            CREATE TABLE rfps (
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
          `
        });
        console.log('RFPs table creation result:', createError);
      }
    }

    // Create Proposals table
    const { error: proposalsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS proposals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          rfp_id UUID,
          customer_id BIGINT NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          status TEXT DEFAULT 'draft',
          estimated_value DECIMAL(12,2),
          win_probability INTEGER DEFAULT 50,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create Usage Logs table
    const { error: usageError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS usage_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          customer_id BIGINT NOT NULL,
          user_email TEXT,
          action TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    // Add test data
    const { error: testDataError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        INSERT INTO rfps (customer_id, title, description, requirements, budget_range, status) 
        VALUES 
        (1, 'Cloud Infrastructure Migration', 'Migrate legacy systems to cloud', 'AWS expertise required', '$50,000 - $100,000', 'open'),
        (1, 'Mobile App Development', 'Build cross-platform mobile app', 'React Native skills needed', '$25,000 - $50,000', 'open'),
        (1, 'Data Analytics Platform', 'Business intelligence dashboard', 'Python and SQL expertise', '$75,000 - $150,000', 'pending')
        ON CONFLICT DO NOTHING;
      `
    });

    console.log('✅ Database setup completed!');
    console.log('Errors:', { rfpsError, proposalsError, usageError, testDataError });

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully!',
      tables: ['rfps', 'proposals', 'usage_logs'],
      errors: { rfpsError, proposalsError, usageError, testDataError }
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 