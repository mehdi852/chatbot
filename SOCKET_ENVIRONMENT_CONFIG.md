# Socket Environment Configuration Guide

## Overview
Your chat widget now supports environment-based socket configuration! You can easily switch between development and production socket connections using the `SOCKET_MODE` environment variable.

## Environment Variables

### SOCKET_MODE
Controls how socket connections are established:
- `development`: Uses `http://localhost:3001` for socket connections
- `production`: Uses the same origin as your website (requires reverse proxy)

### SOCKET_PORT
The port your socket server runs on (default: 3001)

## Configuration Files

### Development (.env.local)
```bash
SOCKET_MODE=development
SOCKET_PORT=3001
```

### Production
Set these in your production environment:
```bash
SOCKET_MODE=production
SOCKET_PORT=3001
```

## How It Works

### Development Mode (`SOCKET_MODE=development`)
- Widget connects to: `http://localhost:3001`
- Admin panel connects to: `http://localhost:3001`
- Perfect for local development

### Production Mode (`SOCKET_MODE=production`)
- Widget connects to: `https://your-domain.com` (same origin)
- Admin panel connects to: `https://your-domain.com` (same origin)
- Requires reverse proxy to route socket.io requests to port 3001

## Setting Up Each Environment

### For Development
1. Your `.env.local` is already configured with:
   ```bash
   SOCKET_MODE=development
   SOCKET_PORT=3001
   ```
2. Start your development server with `npm run dev`
3. Socket server will run on `http://localhost:3001`
4. Widget will automatically connect to localhost

### For Production
1. Set environment variables in your production environment:
   ```bash
   SOCKET_MODE=production
   SOCKET_PORT=3001
   ```
2. Configure reverse proxy (Nginx example):
   ```nginx
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
3. Deploy your application
4. Widget will automatically connect to your domain

## Debugging

### Console Messages
Look for these messages in the browser console:

**Development Mode:**
```
🔧 Socket configuration received: {mode: "development", isDevelopment: true, port: "3001"}
🛠️ Using development socket configuration
🔌 Connecting to socket server: http://localhost:3001
```

**Production Mode:**
```
🔧 Socket configuration received: {mode: "production", isDevelopment: false, port: "3001"}
🚀 Using production socket configuration
🔌 Connecting to socket server: https://your-domain.com
```

### Common Issues

1. **Still seeing localhost connections in production:**
   - Check that `SOCKET_MODE=production` is set in your production environment
   - Verify the `/api/socket-config` endpoint returns the correct mode

2. **Connection refused errors:**
   - In development: Ensure your dev server is running on port 3001
   - In production: Check your reverse proxy configuration

3. **CORS errors:**
   - Ensure your socket server CORS configuration allows your domain

## Testing the Configuration

### Check Current Mode
Visit `/api/socket-config` on your website to see the current configuration:
```json
{
  "success": true,
  "mode": "development",
  "port": "3001",
  "isDevelopment": true
}
```

### Switch Environments
To switch from development to production:
1. Update `SOCKET_MODE=production` in your environment
2. Restart your application
3. Check the console messages to verify the change

## Migration from Previous Setup
If you were using the previous socket configuration:
1. The changes are backward compatible
2. If no `SOCKET_MODE` is set, it defaults to `production` mode
3. Your existing production setup should continue working

## Troubleshooting Commands

### Check if socket server is running
```bash
# Check if port 3001 is open
netstat -an | grep 3001
# or
lsof -i :3001
```

### Test WebSocket connection
```bash
# Install wscat if not already installed
npm install -g wscat

# Test connection
wscat -c ws://localhost:3001/socket.io/?EIO=4&transport=websocket
```

This configuration provides maximum flexibility while maintaining the stability of your production environment!