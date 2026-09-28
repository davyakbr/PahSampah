import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

let prismaInstance: PrismaClient;
let poolInstance: pg.Pool;

if (process.env.NODE_ENV === "production") {
  poolInstance = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(poolInstance);
  prismaInstance = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg.Pool({ connectionString });
  }
  poolInstance = globalForPrisma.pool;

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(poolInstance);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prismaInstance = globalForPrisma.prisma;
}

export const db = prismaInstance;
