"use client";

import { RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Candidate, CvJob, CvStatus } from "@/lib/types";
import { CvBadge, cvLabels } from "./status";
import { EmptyState, TableHead, TableShell, formatDate } from "./shared";

export function CvJobsPage({
  candidates,
  cvJobs,
  onOpenCandidate,
  onRetry
}: {
  candidates: Candidate[];
  cvJobs: CvJob[];
  onOpenCandidate: (id: number) => void;
  onRetry: (candidate: Candidate) => void | Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CvStatus>("all");
  const candidateById = useMemo(() => Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate])), [candidates]);
  const filtered = cvJobs.filter((job) => {
    const candidate = candidateById[job.candidateId];
    const text = [candidate?.name, candidate?.email, job.outputLanguage, job.status].join(" ").toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (status === "all" || job.status === status);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kandidat, bahasa, status..." />
        </label>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="all">Semua status</option>
          {Object.entries(cvLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {!cvJobs.length ? (
        <EmptyState title="Belum ada CV job" description="Job akan muncul setelah Generate CV dijalankan dari kandidat." />
      ) : filtered.length ? (
        <TableShell minWidth={860}>
          <TableHead>
            <tr><th className="px-3 py-3">Candidate</th><th className="px-3 py-3">Output</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Retry</th><th className="px-3 py-3">Updated</th><th className="px-3 py-3">Actions</th></tr>
          </TableHead>
          <tbody>
            {filtered.map((job) => {
              const candidate = candidateById[job.candidateId];
              return (
                <tr key={job.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3">
                    <button className="font-semibold hover:text-primary" onClick={() => onOpenCandidate(job.candidateId)}>{candidate?.name ?? `Candidate #${job.candidateId}`}</button>
                    <div className="text-xs text-muted-foreground">{candidate?.email ?? "-"}</div>
                  </td>
                  <td className="px-3 py-3 uppercase">{job.outputLanguage}</td>
                  <td className="px-3 py-3"><CvBadge status={job.status} /></td>
                  <td className="px-3 py-3">{job.retryCount}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(job.updatedAt)}</td>
                  <td className="px-3 py-3">
                    {candidate ? <Button size="sm" variant="outline" onClick={() => onRetry(candidate)}><RotateCcw className="h-4 w-4" /> Retry</Button> : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      ) : (
        <EmptyState title="Tidak ada CV job" description="Ubah pencarian atau filter status untuk melihat job lain." />
      )}
    </div>
  );
}

