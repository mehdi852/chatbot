# Stats Tracking System

This document describes the conversation and AI response tracking system implemented in the chatbot application.

## Features Added

### 1. Database Schema Updates

#### Users Table
The `Users` table now includes tracking fields:
- `number_of_conversations` (integer, default: 0) - Total conversations initiated by visitors
- `number_of_ai_responses` (integer, default: 0) - Total AI responses generated

#### DashboardStats Table
The `DashboardStats` table now includes:
- `total_conversations` (integer, default: 0) - Global conversation count
- `total_ai_responses` (integer, default: 0) - Global AI response count

### 2. API Endpoints

#### Increment User Stats
**Endpoint:** `GET /api/user/increment-stats`
**Parameters:**
- `userId` - The user ID to increment stats for
- `stat` - The stat type to increment (`conversations`, `ai_responses`, or `websites`)

**Example:**
```javascript
fetch('/api/user/increment-stats?userId=1&stat=conversations')
```

#### Get User Usage
**Endpoint:** `GET /api/user/get_user_usage`
**Parameters:**
- `userId` - The user ID to get stats for

**Returns:**
```json
{
  "number_of_conversations": 15,
  "number_of_ai_responses": 42,
  "number_of_websites": 3
}
```

#### Admin Dashboard Stats
**Endpoint:** `POST /api/admin/add-dashboard-stats`
**Body:**
```json
{
  "total_websites": 100,
  "total_paths": 250,
  "total_popups": 500,
  "total_conversations": 1500,
  "total_ai_responses": 3000
}
```

### 3. Automatic Stats Tracking

#### Conversation Tracking
- **When:** Automatically incremented when a new conversation is created
- **Where:** `lib/socket/db.js` in the `getOrCreateConversation` function
- **Process:**
  1. Check if conversation already exists
  2. If new conversation, create it in database
  3. Get website owner's user ID
  4. Increment user's `number_of_conversations` by 1

#### AI Response Tracking
- **When:** Automatically incremented when an AI response is generated and saved
- **Where:** `lib/socket/handlers/visitorHandler.js` in the `handleAIResponse` function
- **Process:**
  1. Generate AI response
  2. Save message to database
  3. Get website owner's user ID
  4. Increment user's `number_of_ai_responses` by 1

### 4. Dashboard Integration

#### Main Dashboard (`app/dashboard/page.jsx`)
- Displays real-time stats for:
  - Total Conversations
  - Total AI Responses
  - Total Websites
- Auto-refreshes stats every 30 seconds
- Fetches user stats on page load and updates

#### Chat Dashboard (`app/dashboard/chat/page.jsx`)
- Monitors chat activity in real-time
- Updates usage stats when new conversations or AI responses are detected
- Debounced refresh (2-second delay) to avoid excessive API calls

### 5. Real-time Updates

The system provides real-time stats updates through:
- **Automatic refresh intervals** - Dashboard refreshes stats every 30 seconds
- **Event-driven updates** - Chat page monitors conversation changes
- **Debounced API calls** - Prevents excessive server requests

## Implementation Flow

### New Conversation Flow
1. Visitor sends first message to website
2. `getOrCreateConversation` function is called
3. If conversation doesn't exist:
   - Create new conversation in `ChatConversations` table
   - Get website info to find owner user ID
   - Call `/api/user/increment-stats?stat=conversations`
   - User's `number_of_conversations` is incremented by 1

### AI Response Flow
1. AI response is triggered (if website has AI enabled)
2. `generateAIResponse` creates the response
3. Response is saved to `ChatMessages` table
4. Get website info to find owner user ID
5. Call `/api/user/increment-stats?stat=ai_responses`
6. User's `number_of_ai_responses` is incremented by 1

## Testing

Use the provided test script to verify the system:

```bash
# Test with default user ID (1)
node test-stats-tracking.js

# Test with specific user ID
node test-stats-tracking.js 5

# Show help
node test-stats-tracking.js --help
```

The test script will:
1. Get initial user stats
2. Increment conversation count
3. Increment AI response count
4. Verify the increments worked correctly
5. Test dashboard stats update (if admin privileges available)

## Files Modified

### Database Schema
- `configs/schema.js` - Added new fields to Users and DashboardStats tables

### API Endpoints
- `app/api/user/increment-stats/route.js` - Increment user stats
- `app/api/user/get_user_usage/route.js` - Get user usage stats
- `app/api/admin/add-dashboard-stats/route.js` - Update dashboard stats

### Core Logic
- `lib/socket/db.js` - Added conversation count tracking
- `lib/socket/handlers/visitorHandler.js` - AI response count tracking already exists

### Frontend Components
- `app/dashboard/page.jsx` - Display real-time stats
- `app/dashboard/chat/page.jsx` - Monitor and refresh stats

### Test Files
- `test-stats-tracking.js` - Verification script for stats tracking
- `test-ai-counting.js` - Existing AI response testing script

## Error Handling

The system includes comprehensive error handling:
- Failed API calls are logged but don't interrupt the user experience
- Database connection errors are caught and reported
- Missing website information falls back gracefully
- Invalid user IDs return appropriate error responses

## Performance Considerations

- **Debounced updates** - Frontend updates are debounced to prevent excessive API calls
- **Non-blocking increments** - Stats increments don't block the main conversation flow
- **Error resilience** - Failed stat updates don't affect chat functionality
- **Efficient queries** - Uses existing database indexes for fast lookups
