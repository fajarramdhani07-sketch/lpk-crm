"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { backendService } from "@/lib/backend-service";
import type { AuditLog, Candidate, CandidateFile, CvJob, TestResult, UserRole } from "@/lib/types";
import { AppShell, type AdminPage } from "./app-shell";
import { AuditLogsPage } from "./audit-logs-page";
import { CandidatesPage } from "./candidates-page";
import { CvJobsPage } from "./cv-jobs-page";
import { DashboardPage } from "./dashboard-page";
import { FilesPage } from "./files-page";
import { SettingsPage } from "./settings-page";

export function AdminWorkspace({
  role,
  userName,
  loading,
  candidates,
  testResults,
  files,
  cvJobs,
  auditLogs,
  onRefresh,
  onLogout
}: {
  role: UserRole;
  userName: string;
  loading: boolean;
  candidates: Candidate[];
  testResults: TestResult[];
  files: CandidateFile[];
  cvJobs: CvJob[];
  auditLogs: AuditLog[];
  onRefresh: () => Promise<void>;
  onLogout: () => void;
}) {
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [createMode, setCreateMode] = useState(false);

  function openCandidate(id: number) {
    setPage("candidates");
    setCreateMode(false);
    setSelectedCandidateId(id);
  }

  function startCreate() {
    setPage("candidates");
    setSelectedCandidateId(null);
    setCreateMode(true);
  }

  function backToCandidateList() {
    setCreateMode(false);
    setSelectedCandidateId(null);
  }

  async function triggerCv(candidate: Candidate) {
    if (!candidate.id) return;
    await backendService.createCvJobs(candidate.id);
    await onRefresh();
  }

  async function completeCv(candidate: Candidate) {
    if (!candidate.id) return;
    await backendService.updateCandidate(candidate.id, { cvStatus: "DONE" });
    await onRefresh();
  }

  async function addFile(candidate: Candidate, type: "photo" | "document" | "video" | "cv") {
    if (!candidate.id) return;
    await backendService.addFile(candidate.id, {
      type,
      name: `${type}-${candidate.id}-${Date.now()}`,
      url: `#mock-${type}-${candidate.id}`
    });
    await onRefresh();
  }

  const contextualAction = page === "candidates"
    ? <Button size="sm" onClick={startCreate}><Plus className="h-4 w-4" /> Add Candidate</Button>
    : undefined;

  return (
    <AppShell
      page={page}
      setPage={(nextPage) => {
        setPage(nextPage);
        if (nextPage !== "candidates") backToCandidateList();
      }}
      userName={userName}
      role={role}
      loading={loading}
      onLogout={onLogout}
      contextualAction={contextualAction}
    >
      {page === "dashboard" ? (
        <DashboardPage candidates={candidates} cvJobs={cvJobs} auditLogs={auditLogs} onNavigate={setPage} onOpenCandidate={openCandidate} />
      ) : null}
      {page === "candidates" ? (
        <CandidatesPage
          candidates={candidates}
          testResults={testResults}
          files={files}
          cvJobs={cvJobs}
          auditLogs={auditLogs}
          selectedId={selectedCandidateId}
          createMode={createMode}
          onSelectCandidate={openCandidate}
          onStartCreate={startCreate}
          onBackToList={backToCandidateList}
          onRefresh={onRefresh}
          onTriggerCv={triggerCv}
          onCompleteCv={completeCv}
          onAddFile={addFile}
          isSuperadmin={role === "superadmin"}
        />
      ) : null}
      {page === "cv-jobs" ? <CvJobsPage candidates={candidates} cvJobs={cvJobs} onOpenCandidate={openCandidate} onRetry={triggerCv} /> : null}
      {page === "files" ? <FilesPage candidates={candidates} files={files} onOpenCandidate={openCandidate} /> : null}
      {page === "audit-logs" ? <AuditLogsPage candidates={candidates} auditLogs={auditLogs} onOpenCandidate={openCandidate} /> : null}
      {page === "settings" ? <SettingsPage userName={userName} role={role} /> : null}
    </AppShell>
  );
}

