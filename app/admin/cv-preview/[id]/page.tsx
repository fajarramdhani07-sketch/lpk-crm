import { CandidateCvTemplate } from "@/components/cv/candidate-cv-template";
import { buildCandidateCvViewModel } from "@/lib/cv/build-cv-view-model";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateCvPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const candidateId = Number(id);
  if (!Number.isInteger(candidateId)) notFound();

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, deletedAt: null }
  });
  if (!candidate) notFound();

  const latestTestResult = await prisma.testResult.findFirst({
    where: { candidateId, deletedAt: null },
    orderBy: [{ isLatest: "desc" }, { attemptNumber: "desc" }, { createdAt: "desc" }]
  });

  const cv = buildCandidateCvViewModel(candidate, latestTestResult);
  return <CandidateCvTemplate cv={cv} />;
}
