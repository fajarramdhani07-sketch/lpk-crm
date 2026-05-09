"use client";

import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { AuditLog, Candidate, CandidateFile, CvJob, CvStatus, ProfileStatus, TestResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CandidateDetail } from "./candidate-detail";
import { CvBadge, ProfileBadge, cvLabels, profileLabels } from "./status";
import { EmptyState, TableHead, TableShell, calculateAge, formatDate } from "./shared";

const emptyFilters = {
  query: "",
  profileStatus: "all" as "all" | ProfileStatus,
  cvStatus: "all" as "all" | CvStatus,
  education: "all",
  minScore: 0,
  sort: "updated-desc" as "updated-desc" | "name-asc" | "completeness-asc" | "score-desc"
};

export function CandidatesPage({
  candidates,
  testResults,
  files,
  auditLogs,
  selectedId,
  createMode,
  onSelectCandidate,
  onStartCreate,
  onBackToList,
  onRefresh,
  onTriggerCv,
  onCompleteCv,
  onAddFile,
  isSuperadmin
}: {
  candidates: Candidate[];
  testResults: TestResult[];
  files: CandidateFile[];
  auditLogs: AuditLog[];
  cvJobs: CvJob[];
  selectedId: number | null;
  createMode: boolean;
  onSelectCandidate: (id: number) => void;
  onStartCreate: () => void;
  onBackToList: () => void;
  onRefresh: () => Promise<void>;
  onTriggerCv: (candidate: Candidate) => void | Promise<void>;
  onCompleteCv: (candidate: Candidate) => void | Promise<void>;
  onAddFile: (candidate: Candidate, type: "photo" | "document" | "video" | "cv") => void | Promise<void>;
  isSuperadmin: boolean;
}) {
  const [filters, setFilters] = useState(emptyFilters);
  const latestScores = useMemo(() => buildLatestScores(testResults), [testResults]);
  const educations = useMemo(() => Array.from(new Set(candidates.map((candidate) => candidate.education).filter(Boolean))), [candidates]);
  const filtered = useMemo(() => applyFilters(candidates, latestScores, filters), [candidates, filters, latestScores]);
  const selectedCandidate = createMode ? buildNewCandidate() : candidates.find((candidate) => candidate.id === selectedId);

  if (selectedCandidate) {
    return (
      <CandidateDetail
        candidate={selectedCandidate}
        candidates={candidates}
        files={files.filter((file) => file.candidateId === selectedCandidate.id)}
        tests={testResults.filter((test) => test.candidateId === selectedCandidate.id)}
        logs={auditLogs.filter((log) => log.entityId === selectedCandidate.id || log.entityType === "file").slice(0, 20)}
        isSuperadmin={isSuperadmin}
        createMode={createMode}
        onBack={onBackToList}
        onRefresh={onRefresh}
        onEditDone={onBackToList}
        onTriggerCv={() => onTriggerCv(selectedCandidate)}
        onCompleteCv={() => onCompleteCv(selectedCandidate)}
        onAddFile={(type) => onAddFile(selectedCandidate, type)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(260px,1.2fr)_repeat(4,minmax(150px,0.7fr))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} className="pl-9" placeholder="Cari nama, email, kota, skill..." />
          </label>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.profileStatus} onChange={(event) => setFilters({ ...filters, profileStatus: event.target.value as typeof filters.profileStatus })}>
            <option value="all">Semua profil</option>
            {Object.entries(profileLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.cvStatus} onChange={(event) => setFilters({ ...filters, cvStatus: event.target.value as typeof filters.cvStatus })}>
            <option value="all">Semua CV</option>
            {Object.entries(cvLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.education} onChange={(event) => setFilters({ ...filters, education: event.target.value })}>
            <option value="all">Pendidikan</option>
            {educations.map((education) => <option key={education} value={education}>{education}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as typeof filters.sort })}>
            <option value="updated-desc">Updated terbaru</option>
            <option value="name-asc">Nama A-Z</option>
            <option value="completeness-asc">Kelengkapan rendah</option>
            <option value="score-desc">Skor tertinggi</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilters(emptyFilters)}>
            <SlidersHorizontal className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={onStartCreate}>
            <Plus className="h-4 w-4" /> Add Candidate
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["complete", "incomplete", "draft"] as ProfileStatus[]).map((status) => (
          <button key={status} className={cn("rounded-md border px-3 py-1 text-xs font-medium", filters.profileStatus === status ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")} onClick={() => setFilters({ ...filters, profileStatus: filters.profileStatus === status ? "all" : status })}>
            {profileLabels[status]} {candidates.filter((candidate) => candidate.profileStatus === status).length}
          </button>
        ))}
        {(["failed", "stale", "processing"] as CvStatus[]).map((status) => (
          <button key={status} className={cn("rounded-md border px-3 py-1 text-xs font-medium", filters.cvStatus === status ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")} onClick={() => setFilters({ ...filters, cvStatus: filters.cvStatus === status ? "all" : status })}>
            CV {cvLabels[status]} {candidates.filter((candidate) => candidate.cvStatus === status).length}
          </button>
        ))}
      </div>

      {!candidates.length ? (
        <EmptyState title="Belum ada kandidat" description="Tambahkan kandidat pertama untuk mulai mengelola data, dokumen, dan CV." action={<Button onClick={onStartCreate}><Plus className="h-4 w-4" /> Add Candidate</Button>} />
      ) : filtered.length ? (
        <TableShell minWidth={980}>
          <TableHead>
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Age</th>
              <th className="px-3 py-3">Education</th>
              <th className="px-3 py-3">Score</th>
              <th className="px-3 py-3">Completeness</th>
              <th className="px-3 py-3">Profile</th>
              <th className="px-3 py-3">CV</th>
              <th className="px-3 py-3">Updated</th>
            </tr>
          </TableHead>
          <tbody>
            {filtered.map((candidate) => (
              <tr key={candidate.id} className="cursor-pointer border-b hover:bg-muted/50" onClick={() => onSelectCandidate(candidate.id)}>
                <td className="px-3 py-3">
                  <div className="font-semibold">{candidate.name || "Tanpa nama"}</div>
                  <div className="text-xs text-muted-foreground">{candidate.email || "-"} • {candidate.city || "-"}</div>
                </td>
                <td className="px-3 py-3">{calculateAge(candidate.birthDate)}</td>
                <td className="px-3 py-3">{candidate.education || "-"}</td>
                <td className="px-3 py-3 font-semibold">{latestScores[candidate.id] ?? "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex min-w-32 items-center gap-2">
                    <Progress value={candidate.completeness} className="w-24" />
                    <span className="text-xs font-medium">{candidate.completeness}%</span>
                  </div>
                </td>
                <td className="px-3 py-3"><ProfileBadge status={candidate.profileStatus} /></td>
                <td className="px-3 py-3"><CvBadge status={candidate.cvStatus} /></td>
                <td className="px-3 py-3 text-muted-foreground">{formatDate(candidate.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      ) : (
        <EmptyState title="Tidak ada hasil" description="Ubah pencarian atau filter untuk melihat kandidat lain." action={<Button variant="outline" onClick={() => setFilters(emptyFilters)}>Reset filter</Button>} />
      )}
    </div>
  );
}

function buildLatestScores(testResults: TestResult[]) {
  return testResults.reduce<Record<number, number>>((acc, test) => {
    if (test.isLatest) acc[test.candidateId] = test.totalScore;
    return acc;
  }, {});
}

function applyFilters(candidates: Candidate[], scores: Record<number, number>, filters: typeof emptyFilters) {
  const query = filters.query.trim().toLowerCase();
  const filtered = candidates.filter((candidate) => {
    const text = [candidate.name, candidate.email, candidate.phone, candidate.city, candidate.education, candidate.experience, ...candidate.skills, ...candidate.habits].join(" ").toLowerCase();
    return (
      (!query || text.includes(query)) &&
      (filters.profileStatus === "all" || candidate.profileStatus === filters.profileStatus) &&
      (filters.cvStatus === "all" || candidate.cvStatus === filters.cvStatus) &&
      (filters.education === "all" || candidate.education === filters.education) &&
      ((scores[candidate.id] ?? 0) >= filters.minScore)
    );
  });

  return [...filtered].sort((a, b) => {
    if (filters.sort === "name-asc") return a.name.localeCompare(b.name);
    if (filters.sort === "completeness-asc") return a.completeness - b.completeness;
    if (filters.sort === "score-desc") return (scores[b.id] ?? 0) - (scores[a.id] ?? 0);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function buildNewCandidate(): Candidate {
  const now = new Date().toISOString();
  return {
    id: 0,
    name: "",
    birthDate: "2000-01-01",
    gender: "Laki-laki",
    height: 160,
    weight: 55,
    address: "",
    city: "",
    education: "",
    experience: "",
    family: "",
    habits: [],
    skills: [],
    medicalHistory: "",
    phone: "",
    email: "",
    additionalFields: {},
    profileStatus: "draft",
    cvStatus: "pending",
    completeness: 0,
    createdAt: now,
    updatedAt: now
  };
}

