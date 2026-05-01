import { createNextHandler } from "@/src/lib/auth/adapters/next/next";
import { auth } from "@/src/lib/auth/server";

export const { GET, PUT, DELETE, POST } = createNextHandler(auth);
