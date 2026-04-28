import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, getIp, readJson, requireSession, toAuditJson } from "@/lib/server/api";
import { parseCvLanguage } from "@/lib/server/candidate-data";
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

  const data = await prisma.cvJob.findMany({
    where: { candidateId, deletedAt: null },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (!canManageCandidates(session)) return forbidden();
  const { id } = await context.params;
  const candidateId = Number(id);
  const body = await readJson<Record<string, unknown>>(request) ?? {};
  const languages = Array.isArray(body.languages) ? body.languages : ["ID", "JA"];

  const jobs = await prisma.$transaction(async (tx) => {
    await tx.candidate.update({ where: { id: candidateId }, data: { cvStatus: "PROCESSING" } });
    return Promise.all(languages.map((language) => tx.cvJob.create({
      data: {
        candidateId,
        status: "PENDING",
        outputLanguage: parseCvLanguage(language)
      }
    })));
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "trigger_cv_generation",
      entityType: "cv_job",
      entityId: candidateId,
      oldValue: toAuditJson(null),
      newValue: toAuditJson(jobs),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: jobs }, { status: 201 });
}
