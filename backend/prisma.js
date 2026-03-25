import { PrismaClient } from "@prisma/client";

// Explicitly ensure the client is initialized for SQLite
const prisma = new PrismaClient();

export default prisma;
