import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString === "your_supabase_postgresql_connection_string_here") {
    // Dummy string for build-time safety when env vars aren't set yet
    connectionString = "postgresql://postgres:dummy@localhost:5432/postgres";
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
