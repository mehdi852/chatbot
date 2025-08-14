# IP Geolocation Setup

This feature adds IP geolocation data to chat conversations, showing visitor location, ISP, and other network information.

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
IPINFO_TOKEN=your_ipinfo_token_here
```

## Getting IPInfo Token

1. Visit [ipinfo.io](https://ipinfo.io/)
2. Sign up for a free account
3. Get your API token from the dashboard
4. Add it to your environment variables

The current token in the code (`ecdd48ecb252de`) is for demo purposes and has limited requests.

## Database Migration

Run the following SQL migration to add IP geolocation fields to your database:

```sql
-- Migration to add IP geolocation fields to chat_conversations table
ALTER TABLE "chat_conversations" ADD COLUMN "visitor_ip" varchar(45) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "asn" varchar(20) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "as_name" varchar(255) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "as_domain" varchar(255) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "country_code" varchar(2) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "country" varchar(100) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "continent_code" varchar(2) DEFAULT '' NOT NULL;
ALTER TABLE "chat_conversations" ADD COLUMN "continent" varchar(50) DEFAULT '' NOT NULL;
```

Or use the migration file at `drizzle/migrations/0001_add_ip_geolocation.sql`.

## Features

- **Country Detection**: Shows visitor's country with country code
- **IP Address**: Displays visitor's IP address
- **ISP Information**: Shows the visitor's Internet Service Provider
- **Continent Info**: Displays continent information
- **ASN Details**: Shows Autonomous System Number and domain

## API Usage Optimization

The IP geolocation lookup is only performed **once** when a new visitor starts a conversation, not on every message. This minimizes API calls and saves costs.

## Data Display

Geolocation data is displayed in the chat interface:

- In the visitor list (country flag)
- In the chat header when a conversation is selected
- Organized with color-coded badges for different information types

## Privacy Considerations

- IP addresses are stored for legitimate business purposes (analytics, security)
- Consider implementing data retention policies
- Ensure compliance with privacy regulations (GDPR, CCPA, etc.)
- Consider informing users about data collection in your privacy policy

## Fallback Handling

If the IPInfo API fails:
- Default empty values are stored
- Chat functionality continues normally
- Error logging helps with debugging

## Rate Limits

IPInfo.io free tier includes:
- 50,000 requests per month
- Rate limiting applies

For higher usage, consider upgrading to a paid plan.
