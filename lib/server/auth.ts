import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { prisma } from "@/lib/server/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    transaction: true
  }),
  emailAndPassword: {
    enabled: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false
      },
      candidateId: {
        type: "number",
        required: false,
        input: false
      }
    }
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
