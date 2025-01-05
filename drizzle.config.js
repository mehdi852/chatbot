import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dialect: 'postgresql',
    schema: './configs/schema.js',
    out: './drizzle',
    dbCredentials: {
        url: 'postgresql://neondb_owner:xdHV79qIhnfr@ep-muddy-sun-a5rtfwc4.us-east-2.aws.neon.tech/neondb?sslmode=require',
    },
});
