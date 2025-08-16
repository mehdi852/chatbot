// This file should only be imported in server-side code
// API routes, getServerSideProps, getStaticProps, middleware, etc.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create the connection with connection limits for Supabase
const connectionString = process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL;
const sql = postgres(connectionString, {
  max: 1, // Maximum number of connections
  idle_timeout: 20, // Close connections after 20 seconds of inactivity
  connect_timeout: 10, // Connection timeout in seconds
});
export const db = drizzle(sql);
