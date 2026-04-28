import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, getIp, readJson, requireSession, toAuditJson } from "@/lib/server/api";
import { parseFileType } from "@/lib/server/candidate-data";
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

  const data = await prisma.candidateFile.findMany({
    where: { candidateId, deletedAt: null },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;
  const { id } = await context.params;
  const candidateId = Number(id);
  if (!canManageCandidates(session) && session.user.candidateId !== candidateId) return forbidden();

  const body = await readJson<Record<string, unknown>>(request);
  if (!body?.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const file = await prisma.candidateFile.create({
    data: {
      candidateId,
      type: parseFileType(body.type),
      name: String(body.name),
      url: String(body.url ?? `#mock-file-${candidateId}-${Date.now()}`),
      storageKey: body.storageKey ? String(body.storageKey) : null,
      mimeType: body.mimeType ? String(body.mimeType) : null,
      sizeBytes: body.sizeBytes ? Number(body.sizeBytes) : null
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "upload_file",
      entityType: "file",
      entityId: file.id,
      oldValue: toAuditJson(null),
      newValue: toAuditJson(file),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: file }, { status: 201 });
}
