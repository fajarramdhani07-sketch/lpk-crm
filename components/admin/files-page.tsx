"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Candidate, CandidateFile, FileType } from "@/lib/types";
import { FileBadge, fileLabels } from "./status";
import { EmptyState, TableHead, TableShell, formatDate } from "./shared";

export function FilesPage({
  candidates,
  files,
  onOpenCandidate
}: {
  candidates: Candidate[];
  files: CandidateFile[];
  onOpenCandidate: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | FileType>("all");
  const candidateById = useMemo(() => Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate])), [candidates]);
  const filtered = files.filter((file) => {
    const candidate = candidateById[file.candidateId];
    const text = [file.name, file.type, candidate?.name, candidate?.email].join(" ").toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (type === "all" || file.type === type);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari file, kandidat, tipe..." />
        </label>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
          <option value="all">Semua tipe</option>
          {Object.entries(fileLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {!files.length ? (
        <EmptyState title="Belum ada file" description="File kandidat akan muncul setelah upload dokumen, foto, video, atau CV." />
      ) : filtered.length ? (
        <TableShell minWidth={860}>
          <TableHead>
            <tr><th className="px-3 py-3">File</th><th className="px-3 py-3">Candidate</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">CV Job</th><th className="px-3 py-3">Updated</th><th className="px-3 py-3">Action</th></tr>
          </TableHead>
          <tbody>
            {filtered.map((file) => {
              const candidate = candidateById[file.candidateId];
              return (
                <tr key={file.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3 font-semibold">{file.name}</td>
                  <td className="px-3 py-3">
                    <button className="font-medium hover:text-primary" onClick={() => onOpenCandidate(file.candidateId)}>{candidate?.name ?? `Candidate #${file.candidateId}`}</button>
                    <div className="text-xs text-muted-foreground">{candidate?.email ?? "-"}</div>
                  </td>
                  <td className="px-3 py-3"><FileBadge type={file.type} /></td>
                  <td className="px-3 py-3">{file.cvJobId ? `#${file.cvJobId}` : "-"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(file.updatedAt)}</td>
                  <td className="px-3 py-3"><Button size="sm" variant="outline" asChild><a href={file.url}>Buka</a></Button></td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      ) : (
        <EmptyState title="Tidak ada file" description="Ubah pencarian atau filter tipe untuk melihat file lain." />
      )}
    </div>
  );
}

