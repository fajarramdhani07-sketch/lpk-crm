import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, getIp, readJson, requireSession, toAuditJson } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  const { id } = await context.params;
  const candidateId = Number(id);
  if (!canManageCandidates(session) && session.user.candidateId !== candidateId) return forbidden();

  const data = await prisma.testResult.findMany({
    where: { candidateId, deletedAt: null },
    orderBy: { attemptNumber: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (!canManageCandidates(session)) return forbidden();

  const { id } = await context.params;
  const candidateId = Number(id);
  const body = await readJson<{ totalScore?: number }>(request);
  if (!body?.totalScore) return NextResponse.json({ error: "totalScore is required" }, { status: 400 });

  const latest = await prisma.testResult.findFirst({
    where: { candidateId, deletedAt: null },
    orderBy: { attemptNumber: "desc" }
  });

  const result = await prisma.$transaction(async (tx) => {
    await tx.testResult.updateMany({ where: { candidateId }, data: { isLatest: false } });
    return tx.testResult.create({
      data: {
        candidateId,
        totalScore: Number(body.totalScore),
        attemptNumber: (latest?.attemptNumber ?? 0) + 1,
        isLatest: true
      }
    });
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "create_test_result",
      entityType: "test_result",
      entityId: result.id,
      oldValue: toAuditJson(latest),
      newValue: toAuditJson(result),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: result }, { status: 201 });
}
