#!/usr/bin/env node

// Test script to verify AI response counting is working correctly
// Usage: node test-ai-counting.js [websiteId] [userId]

async function testAIResponseCounting(websiteId, userId) {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🧪 Testing AI Response Counting...');
    console.log(`📝 WebsiteId: ${websiteId}, UserId: ${userId}`);
    
    try {
        // 1. Get current count
        console.log('\n📊 Getting current AI response count...');
        const userResponse = await fetch(`${baseUrl}/api/user/get_user_usage?userId=${userId}`);
        if (!userResponse.ok) {
            throw new Error('Failed to get user usage');
        }
        const userData = await userResponse.json();
        const initialCount = userData.user.number_of_ai_responses || 0;
        console.log(`Current count: ${initialCount}`);
        
        // 2. Test increment
        console.log('\n⬆️ Testing increment...');
        const incrementResponse = await fetch(`${baseUrl}/api/user/increment-stats?userId=${userId}&stat=ai_responses`);
        if (!incrementResponse.ok) {
            throw new Error('Failed to increment');
        }
        const incrementResult = await incrementResponse.json();
        console.log(`New count after increment: ${incrementResult.newValue}`);
        
        // 3. Verify the count
        console.log('\n✅ Verifying count...');
        const verifyResponse = await fetch(`${baseUrl}/api/user/get_user_usage?userId=${userId}`);
        if (!verifyResponse.ok) {
            throw new Error('Failed to verify count');
        }
        const verifyData = await verifyResponse.json();
        const finalCount = verifyData.user.number_of_ai_responses || 0;
        console.log(`Verified count: ${finalCount}`);
        
        // 4. Check if increment was correct
        if (finalCount === initialCount + 1) {
            console.log('✅ SUCCESS: AI response counting is working correctly!');
        } else {
            console.log(`❌ ERROR: Expected ${initialCount + 1}, got ${finalCount}`);
        }
        
        // 5. Check limits
        console.log('\n🔍 Checking AI limits...');
        const limitsResponse = await fetch(`${baseUrl}/api/public/check-ai-limits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ websiteId }),
        });
        
        if (limitsResponse.ok) {
            const limitsData = await limitsResponse.json();
            console.log('AI Limits Status:');
            console.log(`- Eligible: ${limitsData.eligible}`);
            console.log(`- Current: ${limitsData.limits?.aiResponses?.current}`);
            console.log(`- Max: ${limitsData.limits?.aiResponses?.max}`);
            console.log(`- Remaining: ${limitsData.limits?.aiResponses?.remaining}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const websiteId = args[0] || '1'; // default to websiteId 1
const userId = args[1] || '1'; // default to userId 1

if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node test-ai-counting.js [websiteId] [userId]');
    console.log('Example: node test-ai-counting.js 1 1');
    process.exit(0);
}

// Run the test
testAIResponseCounting(websiteId, userId).then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
