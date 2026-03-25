import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// We use a mock connection string if none is provided so the build doesn't crash
const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/nakshatra";

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
