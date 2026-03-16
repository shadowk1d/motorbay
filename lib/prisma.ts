import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

export const prisma = prismaClient as unknown as any;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}
