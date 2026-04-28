import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, requireSession } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET(request: Request) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (!canManageCandidates(session)) return forbidden();

  const url = new URL(request.url);
  const entityType = url.searchParams.get("entityType") ?? undefined;
  const entityId = url.searchParams.get("entityId");

  const data = await prisma.auditLog.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId: Number(entityId) } : {})
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return NextResponse.json({ data });
}
