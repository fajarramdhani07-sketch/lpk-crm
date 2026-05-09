"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { AuditLog, Candidate } from "@/lib/types";
import { EmptyState, TableHead, TableShell, formatDate } from "./shared";

export function AuditLogsPage({
  candidates,
  auditLogs,
  onOpenCandidate
}: {
  candidates: Candidate[];
  auditLogs: AuditLog[];
  onOpenCandidate: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const candidateById = useMemo(() => Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate])), [candidates]);
  const filtered = auditLogs.filter((log) => {
    const candidate = log.entityType === "candidate" ? candidateById[log.entityId] : undefined;
    const text = [log.action, log.entityType, log.entityId, log.userId, log.ipAddress, candidate?.name].join(" ").toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <label className="relative block max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari action, entity, user, IP..." />
      </label>

      {!auditLogs.length ? (
        <EmptyState title="Belum ada audit log" description="Aktivitas perubahan data akan muncul di sini." />
      ) : filtered.length ? (
        <TableShell minWidth={920}>
          <TableHead>
            <tr><th className="px-3 py-3">Timestamp</th><th className="px-3 py-3">User</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Entity</th><th className="px-3 py-3">Reference</th><th className="px-3 py-3">IP</th></tr>
          </TableHead>
          <tbody>
            {filtered.map((log) => {
              const candidate = log.entityType === "candidate" ? candidateById[log.entityId] : undefined;
              return (
                <tr key={log.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td>
                  <td className="px-3 py-3">#{log.userId}</td>
                  <td className="px-3 py-3 font-semibold">{log.action}</td>
                  <td className="px-3 py-3">{log.entityType}</td>
                  <td className="px-3 py-3">
                    {candidate ? <button className="font-medium hover:text-primary" onClick={() => onOpenCandidate(candidate.id)}>{candidate.name}</button> : `#${log.entityId}`}
                  </td>
                  <td className="px-3 py-3">{log.ipAddress}</td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      ) : (
        <EmptyState title="Tidak ada audit log" description="Ubah pencarian untuk melihat aktivitas lain." />
      )}
    </div>
  );
}

