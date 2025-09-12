# Socket Cross-Domain Connection Fix

## Problem
The chatbot widget was trying to connect to WebSocket on the same domain where it's embedded (`resume.vertexit.xyz`) instead of connecting to the actual chatbot server (`chat.vertexit.xyz`).

**Error message:**
```
WebSocket connection to 'wss://resume.vertexit.xyz/socket.io/?websiteId=307028&visitorId=visitor_ifvn2iw9f&visitorIP=79.117.136.62&type=visitor&EIO=4&transport=websocket' failed:
```

## Root Cause
In `public/fa.js` line 869, the production socket URL was constructed using:
```javascript
return `${protocol}//${window.location.hostname}`;
```

This caused the widget to connect to the hostname where it's embedded, not where the chatbot server is hosted.

## Additional Issue: Status Indicator Not Updating
After fixing the socket connection, we discovered that the status indicator (red/green dot) wasn't changing from red to green when connected. This was because:
1. The socket connection handlers were looking for a non-existent `.fa-widget-status` element
2. Status elements only existed in the chat view, but socket connection happens before entering chat
3. The `updateAgentStatus` function wasn't being called properly

## Solution
Updated the socket URL generation to use the `apiUrl` domain instead of the current page's hostname:

### Before (Line 869):
```javascript
return `${protocol}//${window.location.hostname}`;
```

### After (Lines 869-870):
```javascript
const apiURL = new URL(apiUrl);
return `${apiURL.protocol}//${apiURL.hostname}`;
```

### Status Indicator Fix:
**Before:** Socket handlers tried to update non-existent `.fa-widget-status` element
**After:** 
1. Added status indicator to home view HTML structure
2. Updated `updateAgentStatus` function to handle both home and chat view
3. Changed socket event handlers to call `updateAgentStatus(true/false)` instead of direct DOM manipulation

## How It Works
1. **Widget embedded on `resume.vertexit.xyz`** with this embed code:
   ```html
   <script 
       src="https://chat.vertexit.xyz/fa.js" 
       data-website-id="307028" 
       data-api-url="https://chat.vertexit.xyz/"
       async>
   </script>
   ```

2. **Widget now connects to:** `wss://chat.vertexit.xyz/socket.io/` (correct)
3. **Instead of:** `wss://resume.vertexit.xyz/socket.io/` (wrong)

## Production Deployment Steps

### 1. Environment Variables
Ensure your production environment has:
```bash
SOCKET_MODE=production
SOCKET_PORT=3001
NEXT_PUBLIC_APP_URL=https://chat.vertexit.xyz/
```

### 2. Reverse Proxy Configuration
On `chat.vertexit.xyz`, configure Nginx to handle WebSocket connections:

```nginx
server {
    listen 443 ssl;
    server_name chat.vertexit.xyz;
    
    # Regular HTTP requests
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket connections for socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Generate New Embed Code
For any website (including `resume.vertexit.xyz`), use this embed code:

```html
<script 
    src="https://chat.vertexit.xyz/fa.js" 
    data-website-id="307028" 
    data-api-url="https://chat.vertexit.xyz/"
    async>
</script>
```

Key points:
- `src` always points to `https://chat.vertexit.xyz/fa.js`
- `data-api-url` always points to `https://chat.vertexit.xyz/`
- This ensures all API calls and socket connections go to the correct server

## Testing the Fix

### 1. Check Console Messages
After deployment, you should see in the browser console:
```
🔧 Socket configuration received: {mode: "production", isDevelopment: false, port: "3001"}
🚀 Using production socket configuration
🔌 Connecting to socket server: https://chat.vertexit.xyz
```

### 2. Network Tab
In browser developer tools Network tab, look for successful WebSocket connection to:
`wss://chat.vertexit.xyz/socket.io/...`

### 3. Test Widget Functionality
- Widget should load properly on `resume.vertexit.xyz`
- Messages should send/receive correctly
- Admin panel should show visitor connections
- Real-time chat should work
- **Status indicator should turn green when connected**

## Files Modified
1. `public/fa.js` - Lines 866-870: Fixed socket URL generation logic
2. `public/fa.js` - Lines 487-501: Added status indicator to home view
3. `public/fa.js` - Lines 822-859: Updated status function to handle both views
4. `public/fa.js` - Lines 897-932: Fixed socket event handlers to use proper status function

## Files NOT Modified (but related)
- `app/api/socket-config/route.js` - Environment configuration endpoint
- `app/dashboard/page.jsx` - Embed code generation (already correct)
- `app/contexts/ChatContext.jsx` - Admin socket connection (already correct)

## Security Notes
- CORS configuration on socket server should allow connections from all domains where widgets are embedded
- Consider implementing proper origin validation for production
- Monitor socket connections for any unusual activity

## Troubleshooting
If the fix doesn't work:
1. Clear browser cache and hard refresh
2. Check that `SOCKET_MODE=production` in production environment
3. Verify Nginx configuration is active
4. Test direct WebSocket connection: `wscat -c wss://chat.vertexit.xyz/socket.io/?EIO=4&transport=websocket`
5. Check server logs for any CORS or connection errors