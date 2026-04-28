import { NextResponse } from "next/server";
import { canManageCandidates, forbidden, getIp, readJson, requireSession, toAuditJson } from "@/lib/server/api";
import { normalizeCandidateInput } from "@/lib/server/candidate-data";
import { prisma } from "@/lib/server/prisma";

export async function GET(request: Request) {
  const { session, response } = await requireSession();
  if (response) return response;

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const cvStatus = url.searchParams.get("cvStatus");
  const profileStatus = url.searchParams.get("profileStatus");
  const includeDeleted = url.searchParams.get("includeDeleted") === "true" && canManageCandidates(session);

  const where = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(canManageCandidates(session) ? {} : { id: session.user.candidateId ?? -1 }),
    ...(cvStatus ? { cvStatus: cvStatus.toUpperCase() as never } : {}),
    ...(profileStatus ? { profileStatus: profileStatus.toUpperCase() as never } : {}),
    ...(query ? {
      OR: [
        { fullNameRomaji: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
        { addressCity: { contains: query, mode: "insensitive" as const } },
        { education: { contains: query, mode: "insensitive" as const } }
      ]
    } : {})
  };

  const candidates = await prisma.candidate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      testResults: { where: { deletedAt: null }, orderBy: { attemptNumber: "desc" } },
      cvJobs: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" } },
      files: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }
    }
  });

  return NextResponse.json({ data: candidates });
}

export async function POST(request: Request) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (!canManageCandidates(session)) return forbidden();

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const candidate = await prisma.candidate.create({
    data: normalizeCandidateInput(body)
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "create_candidate",
      entityType: "candidate",
      entityId: candidate.id,
      oldValue: toAuditJson(null),
      newValue: toAuditJson(candidate),
      ipAddress: getIp(request)
    }
  });

  return NextResponse.json({ data: candidate }, { status: 201 });
}
