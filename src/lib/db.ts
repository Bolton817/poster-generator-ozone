import { PrismaClient } from "@prisma/client";

// Guard against client-side execution in Next.js browser bundles
if (typeof window !== "undefined") {
  throw new Error("Database client cannot be imported in client-side code.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
