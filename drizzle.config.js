import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dialect: 'postgresql',
    schema: './configs/schema.js',
    out: './drizzle',
    dbCredentials: {
        url: 'postgresql://invoiceDb_owner:3Iw9toafUKST@ep-restless-scene-a5azmhl3.us-east-2.aws.neon.tech/invoiceDb?sslmode=require',
    },
});
