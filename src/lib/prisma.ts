import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function resolveAuthDatabaseUrl() {
  const fromEnv = process.env.AUTH_DATABASE_URL;
  if (fromEnv) {
    return fromEnv;
  }

  // `next build` imports modules that reference Prisma; no DB connection runs during the build.
  const lifecycleScript = process.env.npm_lifecycle_script ?? "";
  const isAppBuild =
    process.env.NODE_ENV === "production" &&
    (process.env.npm_lifecycle_event === "build" ||
      lifecycleScript.includes("next build"));

  if (isAppBuild) {
    return "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";
  }

  return null;
}

const authDatabaseUrl = resolveAuthDatabaseUrl();

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
