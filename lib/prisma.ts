import { PrismaClient } from "../app/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Fix hot reload in Next.js dev mode
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Create instance (reuses in dev)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
