import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load .env.local file
config({ path: '.env.local' });

export default defineConfig({
    dialect: 'postgresql',
    schema: './configs/schema.js',
    out: './drizzle',
    dbCredentials: {
        url: process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL,
    },
});
