import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const u = new URL(url);
  return new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1) || undefined,
  });
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: getAdapter(),
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = db;
