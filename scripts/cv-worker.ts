import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { generateCandidateCvHtml } from "../lib/cv/generate-cv-html.ts";

const prisma = new PrismaClient();

async function main() {
  const job = await prisma.cvJob.findFirst({
    where: { status: "PENDING", deletedAt: null },
    orderBy: { createdAt: "asc" }
  });

  if (!job) {
    console.log("No pending CV job found.");
    return;
  }

  console.log(`Processing CV job ${job.id} for candidate ${job.candidateId} (${job.outputLanguage}).`);

  await prisma.$transaction([
    prisma.cvJob.update({
      where: { id: job.id },
      data: { status: "PROCESSING", errorMessage: null }
    }),
    prisma.candidate.update({
      where: { id: job.candidateId },
      data: { cvStatus: "PROCESSING" }
    })
  ]);

  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: job.candidateId, deletedAt: null }
    });
    if (!candidate) throw new Error(`Candidate ${job.candidateId} not found`);

    const latestTestResult = await prisma.testResult.findFirst({
      where: { candidateId: candidate.id, deletedAt: null },
      orderBy: [{ isLatest: "desc" }, { attemptNumber: "desc" }, { createdAt: "desc" }]
    });

    const html = generateCandidateCvHtml(candidate, latestTestResult);
    const outputDir = path.join(process.cwd(), ".generated", "cv", `candidate-${candidate.id}`);
    const outputFile = path.join(outputDir, `cv-job-${job.id}-${job.outputLanguage.toLowerCase()}.html`);
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputFile, html, "utf8");

    const storageKey = path.relative(process.cwd(), outputFile).replaceAll(path.sep, "/");

    await prisma.$transaction([
      prisma.cvJob.update({
        where: { id: job.id },
        data: {
          status: "DONE",
          fileUrl: `/admin/cv-preview/${candidate.id}`,
          storageKey,
          errorMessage: null
        }
      }),
      prisma.candidate.update({
        where: { id: candidate.id },
        data: { cvStatus: "DONE" }
      })
    ]);

    console.log(`CV job ${job.id} done. HTML written to ${storageKey}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CV worker error";
    await prisma.$transaction([
      prisma.cvJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          errorMessage: message.slice(0, 500)
        }
      }),
      prisma.candidate.update({
        where: { id: job.candidateId },
        data: { cvStatus: "FAILED" }
      })
    ]);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
