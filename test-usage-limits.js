// Test script to verify usage limits are working

async function testUsageLimits() {
    const baseUrl = 'https://rfp-win-platform-7s3xl7l0e-algo-s-projects.vercel.app';
    
    console.log('🧪 Testing Usage Limits...\n');
    
    // Test different customer emails from your database
    const testCustomers = [
        { email: 'ceo@techcorp.com', expectedPlan: 'professional', expectedLimit: 25 },
        { email: 'algomind6@gmail.com', expectedPlan: 'pro', expectedLimit: 250 },
        { email: 'mindalgo065@gmail.com', expectedPlan: 'free', expectedLimit: 3 },
        { email: 'demo-user@example.com', expectedPlan: 'free', expectedLimit: 3 }
    ];
    
    for (const customer of testCustomers) {
        try {
            console.log(`\n📊 Testing: ${customer.email}`);
            
            // Call your analytics API to check usage
            const response = await fetch(`${baseUrl}/api/analytics?userId=${customer.email}`);
            const data = await response.json();
            
            console.log(`Plan: ${data.planType || 'unknown'}`);
            console.log(`Usage: ${data.rfpsUsed}/${data.rfpLimit}`);
            console.log(`Remaining: ${data.remaining?.rfps || 0}`);
            
            // Check if limits match expectations
            if (data.rfpLimit === customer.expectedLimit) {
                console.log('✅ Usage limit correct');
            } else {
                console.log(`❌ Usage limit wrong. Expected: ${customer.expectedLimit}, Got: ${data.rfpLimit}`);
            }
            
        } catch (error) {
            console.log(`❌ Error testing ${customer.email}:`, error.message);
        }
    }
}

// Run the test
testUsageLimits(); 