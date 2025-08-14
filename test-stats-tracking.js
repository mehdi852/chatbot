#!/usr/bin/env node

// Test script to verify conversation and AI response stats tracking
// Usage: node test-stats-tracking.js [userId]

async function testStatsTracking(userId = 1) {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🧪 Testing Stats Tracking System...');
    console.log(`📝 UserId: ${userId}`);
    
    try {
        // 1. Get initial user stats
        console.log('\n📊 Getting initial user stats...');
        const initialStatsResponse = await fetch(`${baseUrl}/api/user/get_user_usage?userId=${userId}`);
        if (!initialStatsResponse.ok) {
            throw new Error('Failed to get initial user stats');
        }
        const initialStats = await initialStatsResponse.json();
        console.log('Initial stats:', {
            conversations: initialStats.number_of_conversations || 0,
            aiResponses: initialStats.number_of_ai_responses || 0
        });
        
        // 2. Test incrementing conversation count
        console.log('\n💬 Testing conversation count increment...');
        const conversationResponse = await fetch(`${baseUrl}/api/user/increment-stats?userId=${userId}&stat=conversations`);
        if (!conversationResponse.ok) {
            throw new Error('Failed to increment conversation count');
        }
        const conversationResult = await conversationResponse.json();
        console.log(`✅ Conversation count incremented. New value: ${conversationResult.newValue}`);
        
        // 3. Test incrementing AI response count
        console.log('\n🤖 Testing AI response count increment...');
        const aiResponse = await fetch(`${baseUrl}/api/user/increment-stats?userId=${userId}&stat=ai_responses`);
        if (!aiResponse.ok) {
            throw new Error('Failed to increment AI response count');
        }
        const aiResult = await aiResponse.json();
        console.log(`✅ AI response count incremented. New value: ${aiResult.newValue}`);
        
        // 4. Verify final stats
        console.log('\n🔍 Verifying final stats...');
        const finalStatsResponse = await fetch(`${baseUrl}/api/user/get_user_usage?userId=${userId}`);
        if (!finalStatsResponse.ok) {
            throw new Error('Failed to get final user stats');
        }
        const finalStats = await finalStatsResponse.json();
        
        console.log('Final stats:', {
            conversations: finalStats.number_of_conversations || 0,
            aiResponses: finalStats.number_of_ai_responses || 0
        });
        
        // 5. Verify increments worked correctly
        const conversationIncrease = (finalStats.number_of_conversations || 0) - (initialStats.number_of_conversations || 0);
        const aiResponseIncrease = (finalStats.number_of_ai_responses || 0) - (initialStats.number_of_ai_responses || 0);
        
        if (conversationIncrease === 1 && aiResponseIncrease === 1) {
            console.log('\n🎉 SUCCESS: All stats tracking is working correctly!');
            console.log(`   - Conversations increased by: ${conversationIncrease}`);
            console.log(`   - AI Responses increased by: ${aiResponseIncrease}`);
        } else {
            console.log('\n❌ ERROR: Stats increments were not as expected');
            console.log(`   - Expected conversation increase: 1, got: ${conversationIncrease}`);
            console.log(`   - Expected AI response increase: 1, got: ${aiResponseIncrease}`);
        }
        
        // 6. Test dashboard stats update (if admin)
        console.log('\n📈 Testing dashboard stats update...');
        try {
            const dashboardStatsResponse = await fetch(`${baseUrl}/api/admin/add-dashboard-stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token' // You may need to adjust this
                },
                body: JSON.stringify({
                    total_conversations: finalStats.number_of_conversations || 0,
                    total_ai_responses: finalStats.number_of_ai_responses || 0
                }),
            });
            
            if (dashboardStatsResponse.ok) {
                console.log('✅ Dashboard stats updated successfully');
            } else {
                console.log('⚠️ Dashboard stats update failed (may need admin privileges)');
            }
        } catch (error) {
            console.log('⚠️ Dashboard stats update skipped (admin endpoint)');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
    
    return true;
}

// Parse command line arguments
const args = process.argv.slice(2);
const userId = args[0] || '1'; // default to userId 1

if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node test-stats-tracking.js [userId]');
    console.log('Example: node test-stats-tracking.js 1');
    process.exit(0);
}

// Run the test
testStatsTracking(userId).then((success) => {
    console.log('\n🏁 Test completed');
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
