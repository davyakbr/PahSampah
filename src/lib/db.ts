import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

const isLocal = !connectionString || connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const poolConfig: pg.PoolConfig = {
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

if (!globalForPrisma.pool) {
  const pool = new pg.Pool(poolConfig);
  pool.on("error", (err) => {
    console.error("Unexpected error on idle pg client:", err);
  });
  globalForPrisma.pool = pool;
}

const poolInstance = globalForPrisma.pool;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(poolInstance);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma;

