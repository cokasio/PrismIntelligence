import { defineConfig } from "drizzle-kit";

// For Windows, set DATABASE_URL environment variable before running
// or update this directly with your Supabase connection string
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres";

if (!databaseUrl || databaseUrl.includes("[YOUR-PASSWORD]")) {
  throw new Error("DATABASE_URL must be set with your actual Supabase connection string");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});