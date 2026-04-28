import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, getIp, readJson, requireSession, toAuditJson } from "@/lib/server/api";
import { parseFileType } from "@/lib/server/candidate-data";
import { prisma } from "@/lib/server/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;

  const { id } = await context.params;
  const fileId = Number(id);
  const before = await prisma.candidateFile.findFirst({ where: { id: fileId, deletedAt: null } });
  if (!before) return NextResponse.json({ error: "File not found" }, { status: 404 });
  if (!canManageCandidates(session) && session.user.candidateId !== before.candidateId) return forbidden();

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const file = await prisma.candidateFile.update({
    where: { id: fileId },
    data: {
      type: body.type ? parseFileType(body.type) : undefined,
      name: body.name ? String(body.name) : undefined,
      url: body.url ? String(body.url) : undefined,
      storageKey: body.storageKey ? String(body.storageKey) : undefined,
      mimeType: body.mimeType ? String(body.mimeType) : undefined,
      sizeBytes: body.sizeBytes === undefined ? undefined : Number(body.sizeBytes)
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "update_file",
      entityType: "file",
      entityId: file.id,
      oldValue: toAuditJson(before),
      newValue: toAuditJson(file),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: file });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { session, response } = await requireSession();
  if (response) return response;

  const { id } = await context.params;
  const fileId = Number(id);
  const before = await prisma.candidateFile.findFirst({ where: { id: fileId, deletedAt: null } });
  if (!before) return NextResponse.json({ error: "File not found" }, { status: 404 });
  if (!canManageCandidates(session) && session.user.candidateId !== before.candidateId) return forbidden();

  const file = await prisma.candidateFile.update({ where: { id: fileId }, data: { deletedAt: new Date() } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "soft_delete_file",
      entityType: "file",
      entityId: file.id,
      oldValue: toAuditJson(before),
      newValue: toAuditJson(file),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: file });
}
