require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsage() {
  try {
    console.log('🔍 Checking customer usage limits...\n');
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (!customers || customers.length === 0) {
      console.log('No customers found');
      return;
    }
    
    customers.forEach(customer => {
      console.log('📊 Customer:', customer.email);
      console.log('   Plan:', customer.plan_type || 'free');
      console.log('   Usage:', (customer.analyses_used || 0) + '/' + (customer.analyses_limit || 3));
      console.log('   Remaining:', (customer.analyses_limit || 3) - (customer.analyses_used || 0));
      console.log('   Status:', customer.subscription_status || 'active');
      console.log('   Created:', customer.created_at);
      console.log('');
    });
    
    // Test usage limit check for a specific user
    console.log('🧪 Testing usage limit check for algomind6@gmail.com...');
    
    // Import the analytics service
    const { AnalyticsService } = require('./src/lib/analytics.ts');
    
    const usageCheck = await AnalyticsService.checkUsageLimit('algomind6@gmail.com', 'rfp_analysis');
    console.log('Usage check result:', usageCheck);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsage(); 