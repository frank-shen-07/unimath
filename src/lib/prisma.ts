import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const authDatabaseUrl = process.env.AUTH_DATABASE_URL;

if (!authDatabaseUrl) {
  throw new Error("Missing AUTH_DATABASE_URL.");
}

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: authDatabaseUrl,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
