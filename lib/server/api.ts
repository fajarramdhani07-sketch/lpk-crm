import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth, type AuthSession } from "@/lib/server/auth";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }
  return { session, response: null };
}

export function canManageCandidates(session: AuthSession) {
  const role = session?.user.role;
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function readJson<T>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function getIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function toAuditJson(value: unknown) {
  if (value === null || value === undefined) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
