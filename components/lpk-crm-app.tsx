"use client";

import {
  Activity,
  ClipboardCheck,
  Database,
  Download,
  FileText,
  Filter,
  History,
  LogOut,
  LayoutDashboard,
  Loader2,
  Search,
  Upload,
  UserRound,
  Users
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidatePortalRebuilt } from "@/components/candidate-portal-rebuilt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backendService, mapRole, type BackendSession } from "@/lib/backend-service";
import type { AuditLog, Candidate, CandidateFile, CandidateFilters, CvStatus, ProfileStatus, TestResult, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const initialFilters: CandidateFilters = {
  query: "",
  profileStatus: "all",
  cvStatus: "all",
  minScore: 0,
  education: "all",
  habit: "all"
};

const cvLabels: Record<CvStatus, string> = {
  pending: "Pending",
  processing: "Diproses",
  done: "Selesai",
  failed: "Gagal",
  stale: "Perlu generate ulang"
};

const profileLabels: Record<ProfileStatus, string> = {
  draft: "Draft",
  incomplete: "Belum lengkap",
  complete: "Lengkap",
  archived: "Arsip"
};

const requiredChecklist: Array<{ key: keyof Candidate; label: string }> = [
  { key: "name", label: "Identitas" },
  { key: "height", label: "Data fisik" },
  { key: "address", label: "Alamat" },
  { key: "education", label: "Pendidikan" },
  { key: "experience", label: "Pengalaman kerja" },
  { key: "family", label: "Keluarga" },
  { key: "habits", label: "Kebiasaan" },
  { key: "skills", label: "Skill dan tes" },
  { key: "medicalHistory", label: "Riwayat medis" }
];

export function LpkCrmApp() {
  const [session, setSession] = useState<BackendSession | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [files, setFiles] = useState<CandidateFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = mapRole(session?.user.role);
  const candidateId = session?.user.candidateId ?? candidates[0]?.id ?? 0;

  const refreshBackendData = useCallback(async (activeSession: BackendSession | null) => {
    if (!activeSession) return;
    const candidateResponse = await backendService.listCandidates();
    const nextCandidates = candidateResponse.data;
    const nextTests = candidateResponse.raw.flatMap((candidate) => (candidate.testResults ?? []).map((test) => ({
      id: test.id,
      candidateId: test.candidateId,
      totalScore: test.totalScore,
      attemptNumber: test.attemptNumber,
      isLatest: test.isLatest,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt
    })));
    const nextFiles = candidateResponse.raw.flatMap((candidate) => (candidate.files ?? []).map((file) => ({
      id: file.id,
      candidateId: file.candidateId,
      type: String(file.type ?? "DOCUMENT").toLowerCase() as CandidateFile["type"],
      name: file.name,
      url: file.url,
      cvJobId: file.cvJobId ?? undefined,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    })));
    setCandidates(nextCandidates);
    setTestResults(nextTests);
    setFiles(nextFiles);
    if (mapRole(activeSession.user.role) !== "candidate") {
      const logs = await backendService.listAuditLogs();
      setAuditLogs(logs.data);
    } else {
      setAuditLogs([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      try {
        setLoading(true);
        const currentSession = await backendService.getSession();
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession) {
          await refreshBackendData(currentSession);
        }
        setError("");
      } catch (err) {
        if (mounted) setError(errorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void boot();
    return () => {
      mounted = false;
    };
  }, [refreshBackendData]);

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    setError("");
    try {
      await backendService.signInEmail(email, password);
      const nextSession = await backendService.getSession();
      setSession(nextSession);
      if (nextSession) await refreshBackendData(nextSession);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await backendService.signOut().catch(() => undefined);
    setSession(null);
    setCandidates([]);
    setTestResults([]);
    setFiles([]);
    setAuditLogs([]);
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <LoginScreen loading={loading} error={error} onLogin={handleLogin} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <TopBar role={role} userName={session.user.name} onLogout={handleLogout} loading={loading} />
      {error ? <BackendBanner message={error} /> : null}
      {role === "candidate" ? (
        <CandidatePortalRebuilt
          candidateId={candidateId}
          candidate={candidates.find((candidate) => candidate.id === candidateId)}
          candidates={candidates}
          files={files}
          onRefresh={() => refreshBackendData(session)}
          useBackend
        />
      ) : (
        <AdminCrm
          role={role}
          candidates={candidates}
          testResults={testResults}
          files={files}
          auditLogs={auditLogs}
          onRefresh={() => refreshBackendData(session)}
        />
      )}
    </main>
  );
}

function LoginScreen({
  loading,
  error,
  onLogin
}: {
  loading: boolean;
  error: string;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("admin@lpk.local");
  const [password, setPassword] = useState("password123");
  const seededUsers = ["admin@lpk.local", "superadmin@lpk.local", "candidate@lpk.local"];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle>Masuk LPK Candidate CRM</CardTitle>
          <CardDescription>Login memakai akun seed Better Auth setelah database lokal dimigrate dan di-seed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <BackendBanner message={error} compact /> : null}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Password</label>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </div>
          <div className="flex flex-wrap gap-2">
            {seededUsers.map((item) => (
              <Button key={item} type="button" variant="outline" size="sm" onClick={() => setEmail(item)}>
                {item.split("@")[0]}
              </Button>
            ))}
          </div>
          <Button className="w-full" disabled={loading} onClick={() => void onLogin(email, password)}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Masuk
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BackendBanner({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4", compact ? "px-0" : "py-4 lg:px-6")}>
      <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {message}
      </div>
    </div>
  );
}

function TopBar({
  role,
  userName,
  onLogout,
  loading
}: {
  role: UserRole;
  userName: string;
  onLogout: () => void;
  loading: boolean;
}) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">LPK Candidate CRM</h1>
            <p className="text-sm text-muted-foreground">{userName} - {roleLabel(role)}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Keluar
        </Button>
      </div>
    </header>
  );
}

function AdminCrm({
  role,
  candidates,
  testResults,
  files,
  auditLogs,
  onRefresh
}: {
  role: UserRole;
  candidates: Candidate[];
  testResults: TestResult[];
  files: CandidateFile[];
  auditLogs: AuditLog[];
  onRefresh: () => Promise<void>;
}) {
  const [filters, setFilters] = useState<CandidateFilters>(initialFilters);
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? 0);
  const [detailMode, setDetailMode] = useState<"view" | "edit">("view");

  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];
  const candidateScores = useMemo(() => latestScores(testResults), [testResults]);
  const filteredCandidates = useMemo(
    () => filterCandidates(candidates, filters, candidateScores),
    [candidateScores, candidates, filters]
  );
  const stats = useMemo(() => buildStats(candidates), [candidates]);

  useEffect(() => {
    if (!filteredCandidates.some((candidate) => candidate.id === selectedId)) {
      setSelectedId(filteredCandidates[0]?.id ?? candidates[0]?.id ?? 0);
      setDetailMode("view");
    }
  }, [candidates, filteredCandidates, selectedId]);

  function selectCandidate(id: number) {
    setSelectedId(id);
    setDetailMode("view");
  }

  async function handleAddFile(type: "photo" | "document" | "video" | "cv") {
    if (!selectedCandidate) return;
    await backendService.addFile(selectedCandidate.id, {
      type,
      name: `${type}-${selectedCandidate.id}-${Date.now()}`,
      url: `#mock-${type}-${selectedCandidate.id}`
    });
    await onRefresh();
  }

  async function handleTriggerCv() {
    if (!selectedCandidate) return;
    await backendService.createCvJobs(selectedCandidate.id);
    await onRefresh();
  }

  async function handleCompleteCv() {
    if (!selectedCandidate) return;
    await backendService.updateCandidate(selectedCandidate.id, { cvStatus: "DONE" });
    await onRefresh();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
      <section className="grid stat-grid gap-4">
        <StatCard icon={Users} label="Total kandidat" value={stats.total} tone="primary" />
        <StatCard icon={ClipboardCheck} label="Data lengkap" value={`${stats.complete}%`} tone="accent" />
        <StatCard icon={FileText} label="CV selesai" value={stats.cvDone} tone="secondary" />
        <StatCard icon={Activity} label="Perlu aksi" value={stats.needsAction} tone="danger" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard Kandidat
                </CardTitle>
                <CardDescription>Search, filter, dan validasi data kandidat aktif.</CardDescription>
              </div>
              <Badge variant="outline">{filteredCandidates.length} kandidat tampil</Badge>
            </div>
            <CandidateFiltersPanel filters={filters} setFilters={setFilters} candidates={candidates} />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Kandidat</th>
                    <th className="px-3 py-3">Kelengkapan</th>
                    <th className="px-3 py-3">Skor</th>
                    <th className="px-3 py-3">CV</th>
                    <th className="px-3 py-3">Pendidikan</th>
                    <th className="px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className={cn("border-t", selectedCandidate?.id === candidate.id && "bg-muted/50")}>
                      <td className="px-3 py-3">
                        <button className="text-left font-medium hover:text-primary" onClick={() => selectCandidate(candidate.id)}>
                          {candidate.name}
                        </button>
                        <div className="text-xs text-muted-foreground">{candidate.city} - {candidate.height} cm / {candidate.weight} kg</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={candidate.completeness} className="w-20" />
                          <span>{candidate.completeness}%</span>
                        </div>
                        <StatusBadge status={candidate.profileStatus} />
                      </td>
                      <td className="px-3 py-3 font-medium">{candidateScores[candidate.id] ?? "-"}</td>
                      <td className="px-3 py-3"><CvBadge status={candidate.cvStatus} /></td>
                      <td className="px-3 py-3">{candidate.education}</td>
                      <td className="px-3 py-3">
                        <Button size="sm" variant="outline" onClick={() => selectCandidate(candidate.id)}>
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {selectedCandidate && detailMode === "edit" ? (
          <CandidatePortalRebuilt
            candidateId={selectedCandidate.id}
            candidate={selectedCandidate}
            candidates={candidates}
            files={files.filter((file) => file.candidateId === selectedCandidate.id)}
            onCancel={() => setDetailMode("view")}
            onRefresh={onRefresh}
            onSaved={() => setDetailMode("view")}
            useBackend
            variant="embedded"
          />
        ) : selectedCandidate ? (
          <CandidateDetail
            candidate={selectedCandidate}
            isSuperadmin={role === "superadmin"}
            onEdit={() => setDetailMode("edit")}
            onTriggerCv={handleTriggerCv}
            onCompleteCv={handleCompleteCv}
            onAddFile={handleAddFile}
            tests={testResults.filter((test) => test.candidateId === selectedCandidate.id)}
            files={files.filter((file) => file.candidateId === selectedCandidate.id)}
            logs={auditLogs.filter((log) => log.entityId === selectedCandidate.id || log.entityType === "file").slice(0, 8)}
          />
        ) : null}
      </section>
    </div>
  );
}

function CandidateFiltersPanel({
  filters,
  setFilters,
  candidates
}: {
  filters: CandidateFilters;
  setFilters: (filters: CandidateFilters) => void;
  candidates: Candidate[];
}) {
  const educations = unique(candidates.map((candidate) => candidate.education));
  const habits = unique(candidates.flatMap((candidate) => candidate.habits));

  return (
    <div className="grid gap-3">
      <label className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          className="pl-9"
          placeholder="Cari nama, kota, skill..."
        />
      </label>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <select className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm" value={filters.profileStatus} onChange={(event) => setFilters({ ...filters, profileStatus: event.target.value as CandidateFilters["profileStatus"] })}>
          <option value="all">Semua profil</option>
          {Object.entries(profileLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm" value={filters.cvStatus} onChange={(event) => setFilters({ ...filters, cvStatus: event.target.value as CandidateFilters["cvStatus"] })}>
          <option value="all">Semua CV</option>
          {Object.entries(cvLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm" value={filters.education} onChange={(event) => setFilters({ ...filters, education: event.target.value })}>
          <option value="all">Pendidikan</option>
          {educations.map((education) => <option key={education} value={education}>{education}</option>)}
        </select>
        <select className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm" value={filters.habit} onChange={(event) => setFilters({ ...filters, habit: event.target.value })}>
          <option value="all">Kebiasaan</option>
          {habits.map((habit) => <option key={habit} value={habit}>{habit}</option>)}
        </select>
        <Button className="h-10 w-10 justify-self-start sm:justify-self-end lg:justify-self-auto" size="icon" variant="outline" title="Reset filter" onClick={() => setFilters(initialFilters)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CandidateDetail({
  candidate,
  isSuperadmin,
  tests,
  files,
  logs,
  onEdit,
  onTriggerCv,
  onCompleteCv,
  onAddFile
}: {
  candidate: Candidate;
  isSuperadmin: boolean;
  tests: TestResult[];
  files: CandidateFile[];
  logs: AuditLog[];
  onEdit: () => void;
  onTriggerCv: () => void | Promise<void>;
  onCompleteCv: () => void | Promise<void>;
  onAddFile: (type: "photo" | "document" | "video" | "cv") => void | Promise<void>;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4" /> {candidate.name}
            </CardTitle>
            <CardDescription>{candidate.email} - {candidate.phone}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <CvBadge status={candidate.cvStatus} />
            <Button size="sm" onClick={onEdit}>
              Edit Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList className="grid h-auto w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="complete">Data Lengkap</TabsTrigger>
            <TabsTrigger value="tests">Tes</TabsTrigger>
            <TabsTrigger value="files">File</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <Info label="Kontak" value={`${candidate.email} - ${candidate.phone}`} />
              <Info label="Alamat" value={`${candidate.address}, ${candidate.city}`} />
              <Info label="Fisik" value={`${candidate.height} cm / ${candidate.weight} kg`} />
              <Info label="Status profil" value={profileLabels[candidate.profileStatus]} />
              <Info label="Status CV" value={cvLabels[candidate.cvStatus]} />
              <Info label="Kelengkapan" value={`${candidate.completeness}%`} />
              <Info label="Pendidikan" value={candidate.education} />
              <Info label="Pengalaman" value={candidate.experience} />
              <Info label="Keluarga" value={candidate.family} />
              <Info label="Medis" value={candidate.medicalHistory} />
            </div>
            <div className="mt-4 space-y-3">
              <Progress value={candidate.completeness} />
              <Checklist candidate={candidate} />
            </div>
          </TabsContent>
          <TabsContent value="complete">
            <FullCandidateData candidate={candidate} />
          </TabsContent>
          <TabsContent value="tests">
            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <div className="font-medium">Attempt {test.attemptNumber}</div>
                    <div className="text-muted-foreground">{formatDate(test.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.isLatest ? <Badge variant="success">Latest</Badge> : null}
                    <span className="text-lg font-semibold">{test.totalScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="files">
            <div className="mb-4 flex flex-wrap gap-2">
              {(["photo", "document", "video", "cv"] as const).map((type) => (
                <Button key={type} variant="outline" size="sm" onClick={() => onAddFile(type)}>
                  <Upload className="h-4 w-4" /> {type}
                </Button>
              ))}
            </div>
            <div className="space-y-3">
              {files.map((file) => (
                <a key={file.id} href={file.url} className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted">
                  <span>{file.name}</span>
                  <Badge variant="outline">{file.type}</Badge>
                </a>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="cv">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Status CV</div>
                    <div className="text-sm text-muted-foreground">CV Indonesia dan Jepang mengikuti data kandidat live.</div>
                  </div>
                  <CvBadge status={candidate.cvStatus} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={onTriggerCv}>
                    {candidate.cvStatus === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Generate CV
                  </Button>
                  {candidate.cvStatus === "processing" ? (
                    <Button variant="secondary" onClick={onCompleteCv}>Tandai Selesai</Button>
                  ) : null}
                  {candidate.cvStatus === "done" ? (
                    <Button variant="outline" asChild>
                      <a href="#download-cv"><Download className="h-4 w-4" /> Unduh CV</a>
                    </Button>
                  ) : null}
                </div>
              </div>
              {isSuperadmin ? <Badge variant="outline">Superadmin dapat melihat override dan audit penuh</Badge> : null}
            </div>
          </TabsContent>
          <TabsContent value="audit">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <History className="h-4 w-4" /> {log.action}
                  </div>
                  <div className="text-muted-foreground">{formatDate(log.createdAt)} - IP {log.ipAddress}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

type DetailField = {
  label: string;
  value: string | number | string[] | undefined;
};

function FullCandidateData({ candidate }: { candidate: Candidate }) {
  const extra = candidate.additionalFields ?? {};
  const sections: Array<{ title: string; fields: DetailField[] }> = [
    {
      title: "Identitas",
      fields: [
        { label: "Nama lengkap romaji", value: extra.full_name_romaji || candidate.name },
        { label: "Nama lengkap katakana", value: extra.full_name_katakana },
        { label: "Nama panggilan", value: extra.nickname },
        { label: "Email", value: candidate.email },
        { label: "Nomor HP", value: candidate.phone },
        { label: "Foto profil", value: extra.profile_photo },
        { label: "Tanggal submit", value: extra.submitted_at },
        { label: "Tanggal lahir", value: candidate.birthDate },
        { label: "Tempat lahir", value: extra.birth_place },
        { label: "Usia", value: extra.age },
        { label: "Gender", value: candidate.gender },
        { label: "Dibuat", value: formatDate(candidate.createdAt) },
        { label: "Diupdate", value: formatDate(candidate.updatedAt) }
      ]
    },
    {
      title: "Alamat",
      fields: [
        { label: "Jalan / alamat", value: extra.address_street || candidate.address },
        { label: "Kelurahan / kecamatan", value: extra.address_village },
        { label: "Kota / kabupaten", value: extra.address_city || candidate.city },
        { label: "Provinsi", value: extra.address_province },
        { label: "Kode pos", value: extra.address_postal_code },
        { label: "Negara", value: extra.address_country }
      ]
    },
    {
      title: "Data Pribadi",
      fields: [
        { label: "Tinggi badan", value: withUnit(extra.height_cm || candidate.height, "cm") },
        { label: "Berat badan", value: withUnit(extra.weight_kg || candidate.weight, "kg") },
        { label: "Golongan darah", value: extra.blood_type },
        { label: "Status pernikahan", value: extra.marital_status },
        { label: "Agama", value: extra.religion },
        { label: "Status paspor", value: extra.passport_status },
        { label: "Memakai kacamata", value: extra.wears_glasses },
        { label: "Riwayat medis", value: candidate.medicalHistory },
        { label: "File medical checkup", value: extra.medical_checkup_file }
      ]
    },
    {
      title: "Pendidikan",
      fields: [
        { label: "Pendidikan terakhir", value: candidate.education },
        { label: "SD", value: describeSchool(extra.elementary_school_name, extra.elementary_start_date, extra.elementary_end_date) },
        { label: "SMP", value: describeSchool(extra.junior_high_school_name, extra.junior_high_start_date, extra.junior_high_end_date) },
        { label: "Nama SMA/SMK", value: extra.senior_high_school_name },
        { label: "Jenis SMA/SMK", value: chooseOther(extra.senior_high_type, extra.senior_high_type_other) },
        { label: "Jurusan SMA/SMK", value: chooseOther(extra.senior_high_major, extra.senior_high_major_other) },
        { label: "Periode SMA/SMK", value: dateRange(extra.senior_high_start_date, extra.senior_high_end_date) },
        { label: "Pernah kuliah", value: extra.university },
        { label: "Nama universitas", value: extra.university_name },
        { label: "Jenjang gelar", value: chooseOther(extra.degree_level, extra.degree_level_other) },
        { label: "Jurusan universitas", value: chooseOther(extra.university_major, extra.university_major_other) },
        { label: "Periode universitas", value: dateRange(extra.university_start_date, extra.university_end_date) }
      ]
    },
    {
      title: "Pengalaman Kerja",
      fields: [
        { label: "Pernah bekerja", value: extra.work_has_experience },
        { label: "Ringkasan pengalaman", value: candidate.experience || extra.work_experience },
        ...jobFields(extra, "job1", "Pekerjaan terakhir"),
        ...jobFields(extra, "job2", "Pekerjaan sebelumnya 1"),
        ...jobFields(extra, "job3", "Pekerjaan sebelumnya 2")
      ]
    },
    {
      title: "Keluarga",
      fields: [
        { label: "Catatan keluarga", value: extra.family_notes || candidate.family },
        ...Array.from({ length: 6 }, (_, index) => familyFields(extra, index + 1)).flat()
      ]
    },
    {
      title: "Lifestyle & LPK",
      fields: [
        { label: "Minum alkohol", value: extra.drinks_alcohol },
        { label: "Merokok", value: extra.smokes },
        { label: "Memiliki tato", value: extra.has_tattoo },
        { label: "Ringkasan lifestyle", value: extra.lifestyle || candidate.habits },
        { label: "Asal LPK", value: chooseOther(extra.lpk_origin, extra.lpk_origin_other) || extra.lpk_information },
        { label: "Jam belajar bahasa Jepang", value: withUnit(extra.japanese_study_hours, "jam") },
        { label: "Skill", value: candidate.skills }
      ]
    },
    {
      title: "Dokumen",
      fields: [
        { label: "KTP", value: extra.document_KTP },
        { label: "KK", value: extra.document_KK },
        { label: "Ijazah", value: extra.document_Ijazah },
        { label: "Paspor", value: extra.document_Paspor },
        { label: "Medical Checkup", value: extra["document_Medical Checkup"] },
        { label: "Foto Profil", value: extra["document_Foto Profil"] },
        { label: "Video tes fisik", value: extra.physical_test_video },
        { label: "File tambahan", value: splitPipe(extra.additional_files) }
      ]
    }
  ];

  return (
    <div className="space-y-4 text-sm">
      {sections.map((section) => (
        <section key={section.title} className="rounded-md border">
          <div className="border-b bg-muted/40 px-3 py-2 font-medium">{section.title}</div>
          <div className="grid gap-0 md:grid-cols-2">
            {section.fields.map((field) => (
              <div key={`${section.title}-${field.label}`} className="border-b px-3 py-2 last:border-b-0 md:odd:border-r">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</div>
                <div className="mt-1 break-words font-medium">{displayValue(field.value)}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function displayValue(value: DetailField["value"]) {
  if (Array.isArray(value)) {
    const list = value.map((item) => item.trim()).filter(Boolean);
    return list.length ? list.join(", ") : "-";
  }
  const text = String(value ?? "").trim();
  return text || "-";
}

function withUnit(value: string | number | undefined, unit: string) {
  const text = String(value ?? "").trim();
  return text ? `${text} ${unit}` : "";
}

function splitPipe(value: string | undefined) {
  return String(value ?? "").split("|").map((item) => item.trim()).filter(Boolean);
}

function dateRange(start: string | undefined, end: string | undefined) {
  const from = String(start ?? "").trim();
  const to = String(end ?? "").trim();
  if (!from && !to) return "";
  return `${from || "-"} - ${to || "-"}`;
}

function chooseOther(value: string | undefined, other: string | undefined) {
  return value === "Lainnya" ? other : value;
}

function describeSchool(name: string | undefined, start: string | undefined, end: string | undefined) {
  const schoolName = String(name ?? "").trim();
  const period = dateRange(start, end);
  if (!schoolName) return period;
  return period ? `${schoolName} (${period})` : schoolName;
}

function jobFields(extra: Candidate["additionalFields"], prefix: "job1" | "job2" | "job3", title: string): DetailField[] {
  const fields = extra ?? {};
  return [
    { label: `${title} - nama pekerjaan`, value: fields[`${prefix}_title`] },
    { label: `${title} - perusahaan`, value: fields[`${prefix}_company`] },
    { label: `${title} - posisi`, value: chooseOther(fields[`${prefix}_role`], fields[`${prefix}_role_other`]) },
    { label: `${title} - periode`, value: dateRange(fields[`${prefix}_start_date`], fields[`${prefix}_end_date`]) }
  ];
}

function familyFields(extra: Candidate["additionalFields"], index: number): DetailField[] {
  const fields = extra ?? {};
  const prefix = `family${index}`;
  return [
    { label: `Keluarga ${index} - nama`, value: fields[`${prefix}_name`] },
    { label: `Keluarga ${index} - tanggal lahir`, value: fields[`${prefix}_birth_date`] },
    { label: `Keluarga ${index} - usia`, value: fields[`${prefix}_age`] },
    { label: `Keluarga ${index} - hubungan`, value: chooseOther(fields[`${prefix}_relation`], fields[`${prefix}_relation_other`]) },
    { label: `Keluarga ${index} - pekerjaan`, value: chooseOther(fields[`${prefix}_occupation`], fields[`${prefix}_occupation_other`]) }
  ];
}

function Checklist({ candidate }: { candidate: Candidate }) {
  return (
    <div className="grid gap-2 text-sm">
      {requiredChecklist.map((item) => {
        const value = candidate[item.key];
        const complete = Array.isArray(value) ? value.length > 0 : Boolean(value);
        return (
          <div key={item.key} className="flex items-center justify-between rounded-md border px-3 py-2">
            <span>{item.label}</span>
            <Badge variant={complete ? "success" : "warning"}>{complete ? "OK" : "Kurang"}</Badge>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number | string; tone: "primary" | "accent" | "secondary" | "danger" }) {
  const toneClass = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    danger: "bg-destructive text-destructive-foreground"
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-md", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProfileStatus }) {
  const variant = status === "complete" ? "success" : status === "draft" ? "warning" : status === "archived" ? "muted" : "outline";
  return <Badge variant={variant}>{profileLabels[status]}</Badge>;
}

function CvBadge({ status }: { status: CvStatus }) {
  const variant = status === "done" ? "success" : status === "failed" ? "danger" : status === "processing" ? "secondary" : status === "stale" ? "warning" : "outline";
  return <Badge variant={variant}>{cvLabels[status]}</Badge>;
}

function roleLabel(role: UserRole) {
  return role === "candidate" ? "Candidate" : role === "superadmin" ? "Superadmin" : "Admin";
}

function latestScores(testResults: TestResult[]) {
  return testResults.reduce<Record<number, number>>((acc, test) => {
    if (test.isLatest) acc[test.candidateId] = test.totalScore;
    return acc;
  }, {});
}

function filterCandidates(candidates: Candidate[], filters: CandidateFilters, scores: Record<number, number>) {
  const query = filters.query.trim().toLowerCase();
  return candidates.filter((candidate) => {
    const text = [candidate.name, candidate.city, candidate.education, candidate.experience, ...candidate.skills, ...candidate.habits].join(" ").toLowerCase();
    return (
      (!query || text.includes(query)) &&
      (filters.profileStatus === "all" || candidate.profileStatus === filters.profileStatus) &&
      (filters.cvStatus === "all" || candidate.cvStatus === filters.cvStatus) &&
      (filters.education === "all" || candidate.education === filters.education) &&
      (filters.habit === "all" || candidate.habits.includes(filters.habit)) &&
      ((scores[candidate.id] ?? 0) >= filters.minScore)
    );
  });
}

function buildStats(candidates: Candidate[]) {
  const total = candidates.length;
  const completeCount = candidates.filter((candidate) => candidate.profileStatus === "complete").length;
  return {
    total,
    complete: total ? Math.round((completeCount / total) * 100) : 0,
    cvDone: candidates.filter((candidate) => candidate.cvStatus === "done").length,
    needsAction: candidates.filter((candidate) => candidate.cvStatus === "failed" || candidate.cvStatus === "stale" || candidate.profileStatus !== "complete").length
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Backend belum siap. Pastikan PostgreSQL jalan, migration sudah dibuat, seed sudah dijalankan, lalu refresh halaman.";
}
