import { PrismaClient } from "@prisma/client";

//Singleton = uma única conexão para toda a app.
//Em desenvolvimento, o hot reload pode criar múltiplas conexões.

declare global {
    var _prisma: PrismaClient | undefined;
}

export const prisma = globalThis._prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
    globalThis._prisma = prisma
}