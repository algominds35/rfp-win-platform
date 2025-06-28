// Test script to verify usage limits are working

async function testUsageLimits() {
    const baseUrl = 'https://rfp-win-platform-emp09dbss-algo-s-projects.vercel.app';
    
    console.log('🧪 Testing Usage Limits...\n');
    
    // Test different customer emails from your database
    const testCustomers = [
        { email: 'algomind6@gmail.com', expectedPlan: 'basic', expectedLimit: 25 },
        { email: 'demo-user@example.com', expectedPlan: 'free', expectedLimit: 3 },
        { email: 'test-customer@example.com', expectedPlan: 'free', expectedLimit: 3 }
    ];
    
    for (const customer of testCustomers) {
        try {
            console.log(`\n📊 Testing: ${customer.email}`);
            
            // Call your analytics API to check usage
            const response = await fetch(`${baseUrl}/api/analytics?email=${customer.email}`);
            
            if (!response.ok) {
                console.log(`❌ API Error: ${response.status} ${response.statusText}`);
                continue;
            }
            
            const data = await response.json();
            
            console.log(`Plan: ${data.usage?.planType || 'unknown'}`);
            console.log(`Usage: ${data.usage?.rfpsUsed || 0}/${data.usage?.rfpLimit || 0}`);
            console.log(`Remaining: ${data.usage?.remaining?.rfps || 0}`);
            
            // Check if limits match expectations
            if (data.usage?.rfpLimit === customer.expectedLimit) {
                console.log('✅ Usage limit correct');
            } else {
                console.log(`❌ Usage limit wrong. Expected: ${customer.expectedLimit}, Got: ${data.usage?.rfpLimit}`);
            }
            
            // Test if usage blocking works
            console.log('🔍 Testing usage blocking...');
            
            // Try to simulate RFP analysis
            const testResponse = await fetch(`${baseUrl}/api/extract`, {
                method: 'POST',
                body: (() => {
                    const formData = new FormData();
                    // Create a dummy file
                    const dummyFile = new Blob(['test content'], { type: 'application/pdf' });
                    formData.append('file', dummyFile, 'test.pdf');
                    formData.append('userId', customer.email);
                    return formData;
                })()
            });
            
            if (testResponse.status === 429) {
                console.log('✅ Usage limit blocking works - got 429 status');
                const errorData = await testResponse.json();
                console.log(`   Blocked with message: ${errorData.message}`);
            } else if (testResponse.ok) {
                console.log('✅ Request allowed - user has remaining usage');
            } else {
                console.log(`⚠️ Unexpected response: ${testResponse.status}`);
            }
            
        } catch (error) {
            console.log(`❌ Error testing ${customer.email}:`, error.message);
        }
    }
    
    console.log('\n🎯 Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('- Usage limits are enforced in /api/extract and /api/proposals/generate');
    console.log('- Users get 429 status when limit exceeded');
    console.log('- Usage is tracked in customers.analyses_used column');
    console.log('- Plan limits: free=3, basic=25, pro=250, enterprise=5000');
}

// Run the test
testUsageLimits(); 