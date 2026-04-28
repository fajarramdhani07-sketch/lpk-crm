import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, getIp, readJson, requireSession, toAuditJson } from "@/lib/server/api";
import { parseCvStatus } from "@/lib/server/candidate-data";
import { prisma } from "@/lib/server/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (!canManageCandidates(session)) return forbidden();

  const { id } = await context.params;
  const jobId = Number(id);
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const before = await prisma.cvJob.findFirst({ where: { id: jobId, deletedAt: null } });
  if (!before) return NextResponse.json({ error: "CV job not found" }, { status: 404 });

  const job = await prisma.cvJob.update({
    where: { id: jobId },
    data: {
      status: body.status ? parseCvStatus(body.status) : undefined,
      fileUrl: body.fileUrl ? String(body.fileUrl) : undefined,
      storageKey: body.storageKey ? String(body.storageKey) : undefined,
      errorMessage: body.errorMessage ? String(body.errorMessage) : undefined,
      retryCount: body.retryCount === undefined ? undefined : Number(body.retryCount)
    }
  });

  if (job.status === "DONE" || job.status === "FAILED" || job.status === "STALE") {
    await prisma.candidate.update({
      where: { id: job.candidateId },
      data: { cvStatus: job.status }
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "update_cv_job",
      entityType: "cv_job",
      entityId: job.id,
      oldValue: toAuditJson(before),
      newValue: toAuditJson(job),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: job });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (!canManageCandidates(session)) return forbidden();

  const { id } = await context.params;
  const jobId = Number(id);
  const before = await prisma.cvJob.findFirst({ where: { id: jobId, deletedAt: null } });
  if (!before) return NextResponse.json({ error: "CV job not found" }, { status: 404 });

  const job = await prisma.cvJob.update({ where: { id: jobId }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "soft_delete_cv_job",
      entityType: "cv_job",
      entityId: job.id,
      oldValue: toAuditJson(before),
      newValue: toAuditJson(job),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: job });
}
