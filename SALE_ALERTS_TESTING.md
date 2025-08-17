# Sale Alerts System - Testing Guide

## Overview
The Sale Alerts system automatically detects potential sales opportunities in chat conversations using AI analysis and sends real-time notifications to the dashboard.

## What's Been Implemented

### ✅ Completed Features
1. **Database Schema**: Added `sale_alerts` and `leads` tables with all necessary fields
2. **AI Detection System**: Smart analysis of conversations to identify purchase intent
3. **Email Capture System**: Automatic detection and extraction of email addresses from messages
4. **Lead Management**: Complete lead capture, storage, and management system
5. **API Endpoints**: Full CRUD operations for managing sale alerts and leads
6. **Real-time Notifications**: Socket-based notifications to dashboard for both alerts and leads
7. **Dashboard UI**: Complete sale alerts and leads pages with filtering and management
8. **Integration**: Fully integrated with existing chat system and AI prompts

### 🔧 System Components
- **Backend**: AI analysis, database storage, socket notifications, email extraction
- **Frontend**: Sale alerts and leads dashboards, navigation integration
- **AI Engine**: Purchase intent detection with confidence scoring and email capture prompts
- **Lead System**: Automatic lead creation when emails are provided in chat
- **Real-time**: Live notifications for both sale alerts and captured leads

## Testing Instructions

### Step 1: Initialize the System
1. Start your development server: `npm run dev`
2. Verify the sale alerts table was created successfully
3. Navigate to the dashboard and confirm "Sale Alerts" appears in the sidebar

### Step 2: Configure AI Agent (Optional but Recommended)
1. Go to `/dashboard/ai-agent`
2. Select your website
3. Add business information including:
   - Business name (e.g., "Bichop Proxy Services")
   - Products/services (e.g., "High-speed proxies, residential proxies, datacenter proxies")
   - Special offers (e.g., "20% off first purchase, bulk discounts available")
   - Pricing information if available

### Step 3: Test Sale Detection and Email Capture
Open your website's chat widget and test these conversation scenarios:

#### Scenario 1: High Priority - Direct Purchase Intent with Email Capture
```
Visitor: "Hi, I want to buy some proxies for my business"
AI: [Responds with product info]
Visitor: "How much for 100 residential proxies?"
AI: [Responds with pricing]
Visitor: "Yes, I want to proceed"
AI: [Should ask for email address]
Visitor: "My email is john@company.com"
```
**Expected**: 
- High priority sale alert with "purchase_intent" type
- Lead created with email john@company.com
- High-priority notification: "🎯 New Lead Captured!"
- Real-time dashboard notifications

#### Scenario 2: Email Provided Early in Conversation
```
Visitor: "What are your proxy prices?"
AI: [Responds with pricing]
Visitor: "Please send me more info to sarah@email.com"
```
**Expected**: 
- Medium priority sale alert with "price_inquiry" type
- Lead created with email sarah@email.com
- Lead notification in dashboard

#### Scenario 3: Medium Priority - Product Research
```
Visitor: "I'm looking for datacenter proxies for web scraping"
AI: [Responds with product details]
Visitor: "What's the difference between residential and datacenter proxies?"
```
**Expected**: Medium priority sale alert with "potential_sale" type (no lead without email)

#### Scenario 4: Low Priority - General Questions
```
Visitor: "Hi"
AI: "Hello! How can I help you today?"
Visitor: "Tell me about your company"
```
**Expected**: No sale alert (confidence score too low)

### Step 4: Monitor Sale Alerts
1. Navigate to `/dashboard/sale-alerts`
2. Check that alerts appear with correct:
   - Priority levels (high/medium/low)
   - Confidence scores (displayed as percentage)
   - Product mentions
   - Conversation context
   - Timestamps

### Step 5: Monitor Leads
1. Navigate to `/dashboard/leads`
2. Check that leads appear with correct:
   - Email addresses
   - Lead status (new/contacted/qualified/converted/lost)
   - Product interest
   - Estimated values
   - Source (chat)
   - Creation timestamps

### Step 6: Test Lead Management
1. Use the dropdown menu on each lead to:
   - Mark as "Contacted"
   - Mark as "Qualified"
   - Mark as "Converted"
   - Mark as "Lost"
2. Verify status updates correctly
3. Test filtering by different statuses
4. Test search functionality (email, name, company, product)

### Step 7: Test Real-time Notifications
1. Open the dashboard in one browser tab
2. Open your website chat in another tab/device
3. Start a sales-oriented conversation with email
4. Verify both sale alert AND lead notifications appear immediately
5. Check notification bell shows new notifications

## Expected Behavior

### AI Detection Triggers
The system looks for these signals:
- **Purchase keywords**: "buy", "purchase", "order", "how much", "price", "cost"
- **Product inquiries**: Specific product questions, feature requests
- **Decision-making language**: "I'm looking for", "I need", "considering"
- **Quantity mentions**: "bulk", numbers, volume requests
- **Timeline questions**: "when can I get", "how soon", "delivery time"
- **Purchase confirmation**: "yes", "okay", "proceed", "sure" (triggers email request)

### Email Capture Behavior
- When customers say "yes" to purchase, AI asks for email before providing contact info
- Emails are automatically detected using regex pattern
- Leads are created immediately when valid email is found
- High-priority notification sent to dashboard about lead capture

### Confidence Scoring
- **0.7-1.0**: High confidence (direct purchase intent)
- **0.4-0.6**: Medium confidence (strong interest, research phase)
- **0.3-0.4**: Low confidence (mild interest)
- **Below 0.3**: No alert created

### Priority Assignment
- **High**: Direct purchase intent, pricing discussions, ready to buy
- **Medium**: Product inquiries, comparison questions, timeline discussions
- **Low**: General questions, early research phase

## Troubleshooting

### No Alerts Generated
1. Check AI agent configuration is saved
2. Verify websiteId is being passed correctly
3. Ensure conversation has sufficient context
4. Check confidence score threshold (must be > 0.3)

### Alerts Not Appearing in Dashboard
1. Verify database connection
2. Check API endpoints are responding
3. Ensure socket connections are established
4. Check browser console for errors

### Incorrect Priority/Confidence
1. Review AI agent data configuration
2. Test with more explicit purchase language
3. Check conversation history context
4. Verify AI response quality

## Database Verification

To manually check the database:
```sql
SELECT * FROM sale_alerts 
WHERE user_id = [YOUR_USER_ID] 
ORDER BY created_at DESC;
```

## API Testing

Test the endpoints directly:
```bash
# Get alerts
GET /api/sale-alerts?userId=[USER_ID]

# Update alert status
PUT /api/sale-alerts
{
  "alertId": [ALERT_ID],
  "status": "contacted",
  "read": true
}
```

## Success Metrics
- ✅ Sale alerts generated for purchase-intent conversations
- ✅ Correct priority and confidence scoring
- ✅ Email addresses automatically detected and extracted
- ✅ Leads created when emails are provided
- ✅ Real-time notifications working for both alerts and leads
- ✅ Dashboard displays alerts and leads with proper formatting
- ✅ Status management works correctly for both systems
- ✅ Filtering and search functionality working
- ✅ No false positives for basic greetings or support questions
- ✅ AI asks for email when customers are ready to purchase
- ✅ High-priority notifications sent for lead capture

## Next Steps
After successful testing, consider:
1. Training the AI with your specific business terminology
2. Adjusting confidence thresholds based on your needs  
3. Customizing alert priorities for your business model
4. Adding email notifications for high-priority alerts
5. Integrating with CRM systems
6. Adding conversion tracking and analytics
