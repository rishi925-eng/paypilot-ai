import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

// Compute absolute path to root prisma/dev.db to avoid relative path resolution mismatches on Windows
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../../../prisma/dev.db").replace(/\\/g, "/");
const dbUrl = process.env.DATABASE_URL || `file:${dbPath}`;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
