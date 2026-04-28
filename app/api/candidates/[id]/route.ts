import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, getIp, readJson, requireSession, toAuditJson } from "@/lib/server/api";
import { normalizeCandidateInput } from "@/lib/server/candidate-data";
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

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, deletedAt: null },
    include: {
      testResults: { where: { deletedAt: null }, orderBy: { attemptNumber: "desc" } },
      cvJobs: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" } },
      files: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }
    }
  });
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  return NextResponse.json({ data: candidate });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  const { id } = await context.params;
  const candidateId = Number(id);
  if (!canManageCandidates(session) && session.user.candidateId !== candidateId) return forbidden();

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const before = await prisma.candidate.findFirst({ where: { id: candidateId, deletedAt: null } });
  if (!before) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  const candidateData = normalizeCandidateInput(body);
  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      ...candidateData,
      ...("cvStatus" in body ? {} : { cvStatus: "STALE" as const })
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "update_candidate",
      entityType: "candidate",
      entityId: candidate.id,
      oldValue: toAuditJson(before),
      newValue: toAuditJson(candidate),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: candidate });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (!canManageCandidates(session)) return forbidden();
  const { id } = await context.params;
  const candidateId = Number(id);
  const before = await prisma.candidate.findFirst({ where: { id: candidateId, deletedAt: null } });
  if (!before) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { deletedAt: new Date(), profileStatus: "ARCHIVED" }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "soft_delete_candidate",
      entityType: "candidate",
      entityId: candidate.id,
      oldValue: toAuditJson(before),
      newValue: toAuditJson(candidate),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: candidate });
}
