import type { Candidate, CandidateFile, CvStatus } from "@/lib/types";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockService = {
  async listCandidates(candidates: Candidate[]) {
    await wait();
    return candidates;
  },
  async updateCandidate(candidate: Candidate, patch: Partial<Candidate>) {
    await wait();
    return {
      ...candidate,
      ...patch,
      cvStatus: patch.cvStatus ?? "stale",
      updatedAt: new Date().toISOString()
    };
  },
  async triggerCv(candidate: Candidate, status: CvStatus = "processing") {
    await wait();
    return {
      ...candidate,
      cvStatus: status,
      updatedAt: new Date().toISOString()
    };
  },
  async addFile(candidateId: number, type: CandidateFile["type"]) {
    await wait();
    const now = new Date().toISOString();
    return {
      id: Math.floor(Date.now() / 1000),
      candidateId,
      type,
      name: `${type.toUpperCase()} kandidat ${candidateId}`,
      url: `#${type}-${candidateId}-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    } satisfies CandidateFile;
  }
};
