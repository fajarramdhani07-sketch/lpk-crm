"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auditLogs, candidates, cvJobs, files, testResults, users } from "@/lib/mock-data";
import type { AuditLog, Candidate, CandidateFile, CvJob, TestResult, User, UserRole } from "@/lib/types";

interface CrmState {
  users: User[];
  activeUserId: number;
  candidates: Candidate[];
  testResults: TestResult[];
  cvJobs: CvJob[];
  files: CandidateFile[];
  auditLogs: AuditLog[];
  setRole: (role: UserRole) => void;
  updateCandidate: (candidate: Candidate, action?: string) => void;
  triggerCvGeneration: (candidateId: number) => void;
  completeCvGeneration: (candidateId: number) => void;
  addFile: (file: CandidateFile) => void;
}

const nextId = () => Math.floor(Date.now() + Math.random() * 1000);

export const useCrmStore = create<CrmState>()(
  persist(
    (set, get) => ({
      users,
      activeUserId: 1,
      candidates,
      testResults,
      cvJobs,
      files,
      auditLogs,
      setRole: (role) =>
        set((state) => ({
          activeUserId: state.users.find((user) => user.role === role)?.id ?? state.activeUserId
        })),
      updateCandidate: (candidate, action = "update_candidate") =>
        set((state) => {
          const oldCandidate = state.candidates.find((item) => item.id === candidate.id);
          const currentUser = state.users.find((user) => user.id === state.activeUserId) ?? state.users[0];
          const log: AuditLog = {
            id: nextId(),
            userId: currentUser.id,
            action,
            entityType: "candidate",
            entityId: candidate.id,
            oldValue: oldCandidate ? { profileStatus: oldCandidate.profileStatus, cvStatus: oldCandidate.cvStatus } : null,
            newValue: { profileStatus: candidate.profileStatus, cvStatus: candidate.cvStatus },
            ipAddress: "127.0.0.1",
            createdAt: new Date().toISOString()
          };

          return {
            candidates: state.candidates.map((item) => (item.id === candidate.id ? candidate : item)),
            auditLogs: [log, ...state.auditLogs]
          };
        }),
      triggerCvGeneration: (candidateId) =>
        set((state) => {
          const currentUser = state.users.find((user) => user.id === state.activeUserId) ?? state.users[0];
          const now = new Date().toISOString();
          const updatedCandidates = state.candidates.map((candidate) =>
            candidate.id === candidateId ? { ...candidate, cvStatus: "processing" as const, updatedAt: now } : candidate
          );
          const jobs: CvJob[] = ["id", "ja"].map((language) => ({
            id: nextId(),
            candidateId,
            status: "processing",
            retryCount: 0,
            outputLanguage: language as "id" | "ja",
            createdAt: now,
            updatedAt: now
          }));
          const log: AuditLog = {
            id: nextId(),
            userId: currentUser.id,
            action: "trigger_cv_generation",
            entityType: "cv_job",
            entityId: candidateId,
            oldValue: null,
            newValue: { status: "processing" },
            ipAddress: "127.0.0.1",
            createdAt: now
          };

          return {
            candidates: updatedCandidates,
            cvJobs: [...jobs, ...state.cvJobs],
            auditLogs: [log, ...state.auditLogs]
          };
        }),
      completeCvGeneration: (candidateId) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            candidates: state.candidates.map((candidate) =>
              candidate.id === candidateId ? { ...candidate, cvStatus: "done" as const, updatedAt: now } : candidate
            ),
            cvJobs: state.cvJobs.map((job) =>
              job.candidateId === candidateId && job.status === "processing"
                ? { ...job, status: "done" as const, fileUrl: `#cv-${job.outputLanguage}-${candidateId}`, updatedAt: now }
                : job
            )
          };
        }),
      addFile: (file) =>
        set((state) => {
          const currentUser = state.users.find((user) => user.id === state.activeUserId) ?? state.users[0];
          const log: AuditLog = {
            id: nextId(),
            userId: currentUser.id,
            action: "upload_file",
            entityType: "file",
            entityId: file.id,
            oldValue: null,
            newValue: { type: file.type, name: file.name },
            ipAddress: "127.0.0.1",
            createdAt: new Date().toISOString()
          };

          return {
            files: [file, ...state.files],
            auditLogs: [log, ...state.auditLogs]
          };
        })
    }),
    {
      name: "lpk-crm-prototype"
    }
  )
);

export function useActiveUser() {
  return useCrmStore((state) => state.users.find((user) => user.id === state.activeUserId) ?? getFallbackUser());
}

function getFallbackUser() {
  return getStaticUsers()[0];
}

function getStaticUsers() {
  return getInitialStateUsers();
}

function getInitialStateUsers() {
  return users;
}
