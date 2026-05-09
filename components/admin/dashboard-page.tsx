"use client";

import { Activity, AlertTriangle, CheckCircle2, Clock, FileText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditLog, Candidate, CvJob } from "@/lib/types";
import type { AdminPage } from "./app-shell";
import { CvBadge, ProfileBadge } from "./status";
import { EmptyState, formatDate, SummaryCard } from "./shared";

export function DashboardPage({
  candidates,
  cvJobs,
  auditLogs,
  onNavigate,
  onOpenCandidate
}: {
  candidates: Candidate[];
  cvJobs: CvJob[];
  auditLogs: AuditLog[];
  onNavigate: (page: AdminPage) => void;
  onOpenCandidate: (id: number) => void;
}) {
  const incomplete = candidates.filter((candidate) => candidate.profileStatus !== "complete");
  const failedJobs = cvJobs.filter((job) => job.status === "failed");
  const staleCandidates = candidates.filter((candidate) => candidate.cvStatus === "stale" || candidate.cvStatus === "failed");
  const urgent = [...staleCandidates, ...incomplete.filter((candidate) => candidate.completeness < 80)].slice(0, 6);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard icon={Users} label="Total kandidat" value={candidates.length} detail="Kandidat aktif" tone="primary" />
        <SummaryCard icon={AlertTriangle} label="Belum lengkap" value={incomplete.length} detail="Perlu follow up" tone={incomplete.length ? "warning" : "success"} />
        <SummaryCard icon={FileText} label="CV selesai" value={cvJobs.filter((job) => job.status === "done").length} detail="Job output siap" tone="success" />
        <SummaryCard icon={Clock} label="Pending/Stale" value={cvJobs.filter((job) => job.status === "pending" || job.status === "stale").length} detail="Antrian CV" tone="warning" />
        <SummaryCard icon={Activity} label="Gagal" value={failedJobs.length} detail="Butuh retry" tone={failedJobs.length ? "danger" : "neutral"} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <Card className="shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Urgent Items</CardTitle>
              <p className="text-sm text-muted-foreground">Kandidat dan CV yang paling perlu aksi.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("candidates")}>Lihat kandidat</Button>
          </CardHeader>
          <CardContent>
            {urgent.length ? (
              <div className="divide-y rounded-md border">
                {urgent.map((candidate) => (
                  <button key={candidate.id} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/60" onClick={() => onOpenCandidate(candidate.id)}>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{candidate.name || "Tanpa nama"}</div>
                      <div className="text-xs text-muted-foreground">{candidate.city || "-"} • {candidate.education || "-"}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ProfileBadge status={candidate.profileStatus} />
                      <CvBadge status={candidate.cvStatus} />
                      <Badge variant={candidate.completeness >= 90 ? "success" : "warning"}>{candidate.completeness}%</Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Tidak ada item urgent" description="Semua kandidat dan CV saat ini tidak membutuhkan perhatian khusus." />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">Aktivitas audit terakhir.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("audit-logs")}>Audit</Button>
          </CardHeader>
          <CardContent>
            {auditLogs.length ? (
              <div className="space-y-3">
                {auditLogs.slice(0, 7).map((log) => (
                  <div key={log.id} className="rounded-md border px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      {log.action}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{log.entityType} #{log.entityId} • {formatDate(log.createdAt)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Belum ada aktivitas" description="Audit log akan muncul setelah ada perubahan data." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

