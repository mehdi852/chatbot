# Socket.IO Deployment Guide

## Issue Fixed
The "Invalid namespace" error was caused by:
1. **Socket.IO version mismatch** between client (4.5.4) and server (4.8.1)
2. **Production URL resolution** issues
3. **Missing explicit namespace handling**

## Changes Made

### 1. Version Alignment
- Updated widget CDN to use Socket.IO v4.8.1 to match server version
- Added explicit `autoConnect: true` for better connection handling

### 2. Production URL Configuration
- Modified socket URL resolution for production environments
- Removed hardcoded port 3001 for production (assumes reverse proxy)
- Updated both widget and admin panel connections

### 3. Improved Error Handling
- Added detailed error logging for connection issues
- Added specific detection for namespace errors
- Enhanced debugging information

## Production Deployment Options

### Option 1: Reverse Proxy (Recommended)
Configure your web server (Nginx/Apache) to proxy WebSocket connections:

```nginx
# Nginx configuration
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
```

### Option 2: Direct Port Access
If you can't use reverse proxy, ensure port 3001 is open and accessible:
- Set `SOCKET_PORT=3001` in your environment variables
- Make sure firewall allows connections to port 3001
- Update DNS/load balancer to route traffic to port 3001

## Environment Variables
Add to your production environment:
```bash
SOCKET_PORT=3001  # or your preferred port
```

## Testing the Fix
1. Deploy the updated code
2. Open browser developer console
3. Look for:
   - "Widget connected to socket server" message
   - No "Invalid namespace" errors
   - Successful WebSocket connection in Network tab

## Troubleshooting
If you still get namespace errors:
1. Check browser console for detailed error information
2. Verify Socket.IO server is running on the expected port
3. Test WebSocket connection directly: `wscat -c ws://your-domain/socket.io/?EIO=4&transport=websocket`
4. Ensure CORS configuration allows your domain

## Security Note
The current CORS configuration allows all origins (`origin: '*'`). For production, consider restricting to your specific domains:

```javascript
cors: {
    origin: ["https://your-domain.com", "https://www.your-domain.com"],
    methods: ['GET', 'POST'],
    credentials: true,
},
```