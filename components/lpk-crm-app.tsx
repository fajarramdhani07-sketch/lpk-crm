"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidatePortalRebuilt } from "@/components/candidate-portal-rebuilt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { backendService, mapRole, type BackendSession } from "@/lib/backend-service";
import { mockService } from "@/lib/mock-service";
import { useCrmStore } from "@/lib/store";
import type { AuditLog, Candidate, CandidateFile, CandidateFilters, CvJob, CvStatus, ProfileStatus, TestResult, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const candidateSchema = z.object({
  name: z.string().min(3, "Nama wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  height: z.preprocess((value) => Number(value), z.number().min(120).max(220)),
  weight: z.preprocess((value) => Number(value), z.number().min(35).max(140)),
  address: z.string().min(8, "Alamat wajib lengkap"),
  city: z.string().min(2, "Kota wajib diisi"),
  education: z.string().min(3, "Pendidikan wajib diisi"),
  experience: z.string().min(3, "Pengalaman wajib diisi"),
  family: z.string().min(3, "Data keluarga wajib diisi"),
  habitsText: z.string(),
  skillsText: z.string(),
  medicalHistory: z.string().min(2, "Riwayat medis wajib diisi"),
  phone: z.string().min(8, "Nomor telepon wajib diisi"),
  email: z.string().email("Email tidak valid"),
  additionalFields: z.record(z.string(), z.string())
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

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

type AdditionalFieldConfig = {
  name: string;
  label: string;
  type?: "text" | "date" | "number" | "select";
  options?: string[];
};

const yesNoOptions = ["Ya", "Tidak"];

const additionalFieldSections: Array<{ title: string; fields: AdditionalFieldConfig[] }> = [
  {
    title: "Pengiriman dan Identitas Tambahan",
    fields: [
      { name: "submitted_at", label: "Tanggal submit", type: "date" },
      { name: "full_name_romaji", label: "Nama lengkap romaji" },
      { name: "full_name_katakana", label: "Nama lengkap katakana" },
      { name: "nickname", label: "Nama panggilan" },
      { name: "profile_photo", label: "Foto profil" },
      { name: "birth_place", label: "Tempat lahir" },
      { name: "age", label: "Usia", type: "number" }
    ]
  },
  {
    title: "Data Pribadi Tambahan",
    fields: [
      { name: "blood_type", label: "Golongan darah", type: "select", options: ["A", "B", "AB", "O", "Tidak tahu"] },
      { name: "marital_status", label: "Status pernikahan", type: "select", options: ["Belum menikah", "Menikah", "Cerai"] },
      { name: "religion", label: "Agama" },
      { name: "passport_status", label: "Status paspor", type: "select", options: ["Belum ada", "Dalam proses", "Sudah ada"] },
      { name: "wears_glasses", label: "Memakai kacamata", type: "select", options: yesNoOptions },
      { name: "medical_checkup_file", label: "File medical checkup" }
    ]
  },
  {
    title: "Detail Pendidikan",
    fields: [
      { name: "elementary_school", label: "SD", type: "select", options: yesNoOptions },
      { name: "elementary_school_name", label: "Nama SD" },
      { name: "elementary_start_date", label: "Mulai SD", type: "date" },
      { name: "elementary_end_date", label: "Selesai SD", type: "date" },
      { name: "junior_high_school", label: "SMP", type: "select", options: yesNoOptions },
      { name: "junior_high_school_name", label: "Nama SMP" },
      { name: "junior_high_start_date", label: "Mulai SMP", type: "date" },
      { name: "junior_high_end_date", label: "Selesai SMP", type: "date" },
      { name: "senior_high_school", label: "SMA/SMK", type: "select", options: yesNoOptions },
      { name: "senior_high_school_name", label: "Nama SMA/SMK" },
      { name: "senior_high_start_date", label: "Mulai SMA/SMK", type: "date" },
      { name: "senior_high_end_date", label: "Selesai SMA/SMK", type: "date" },
      { name: "senior_high_type", label: "Jenis sekolah menengah", type: "select", options: ["SMA", "SMK", "MA", "Lainnya"] },
      { name: "senior_high_major", label: "Jurusan SMA/SMK" },
      { name: "university", label: "Kuliah", type: "select", options: yesNoOptions },
      { name: "university_name", label: "Nama universitas" },
      { name: "university_start_date", label: "Mulai universitas", type: "date" },
      { name: "university_end_date", label: "Selesai universitas", type: "date" },
      { name: "degree_level", label: "Jenjang gelar", type: "select", options: ["D1", "D2", "D3", "D4", "S1", "S2", "S3", "Lainnya"] },
      { name: "university_major", label: "Jurusan universitas" }
    ]
  },
  {
    title: "Detail Pengalaman Kerja",
    fields: [
      { name: "latest_job", label: "Pekerjaan terakhir" },
      { name: "company_name_latest", label: "Nama perusahaan terakhir" },
      { name: "job1_start_date", label: "Mulai kerja terakhir", type: "date" },
      { name: "job1_end_date", label: "Selesai kerja terakhir", type: "date" },
      { name: "job1_role", label: "Posisi kerja terakhir" },
      { name: "previous_job_1", label: "Pekerjaan sebelumnya 1" },
      { name: "company_name_1", label: "Nama perusahaan 1" },
      { name: "job2_start_date", label: "Mulai kerja 1", type: "date" },
      { name: "job2_end_date", label: "Selesai kerja 1", type: "date" },
      { name: "job2_role", label: "Posisi kerja 1" },
      { name: "previous_job_2", label: "Pekerjaan sebelumnya 2" },
      { name: "company_name_2", label: "Nama perusahaan 2" },
      { name: "job3_start_date", label: "Mulai kerja 2", type: "date" },
      { name: "job3_end_date", label: "Selesai kerja 2", type: "date" },
      { name: "job3_role", label: "Posisi kerja 2" }
    ]
  },
  {
    title: "Detail Keluarga",
    fields: Array.from({ length: 6 }, (_, index) => {
      const number = index + 1;
      return [
        { name: `family${number}_name`, label: `Nama keluarga ${number}` },
        { name: `family${number}_birth_date`, label: `Tanggal lahir keluarga ${number}`, type: "date" as const },
        { name: `family${number}_age`, label: `Usia keluarga ${number}`, type: "number" as const },
        { name: `family${number}_relation`, label: `Hubungan keluarga ${number}` },
        { name: `family${number}_occupation`, label: `Pekerjaan keluarga ${number}` }
      ];
    }).flat()
  },
  {
    title: "Lifestyle, LPK, dan Dokumen",
    fields: [
      { name: "drinks_alcohol", label: "Minum alkohol", type: "select", options: yesNoOptions },
      { name: "smokes", label: "Merokok", type: "select", options: yesNoOptions },
      { name: "has_tattoo", label: "Memiliki tato", type: "select", options: yesNoOptions },
      { name: "lpk_origin", label: "Asal LPK" },
      { name: "japanese_study_hours", label: "Jam belajar bahasa Jepang", type: "number" },
      { name: "documents", label: "Dokumen utama" },
      { name: "physical_test_video", label: "Video tes fisik" },
      { name: "additional_files", label: "File tambahan" }
    ]
  }
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
    }
  }, [candidates, filteredCandidates, selectedId]);

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
                        <button className="text-left font-medium hover:text-primary" onClick={() => setSelectedId(candidate.id)}>
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
                        <Button size="sm" variant="outline" onClick={() => setSelectedId(candidate.id)}>
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

        {selectedCandidate ? (
          <CandidateDetail
            candidate={selectedCandidate}
            isSuperadmin={role === "superadmin"}
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
    <div className="grid gap-3 md:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(130px,1fr))]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          className="pl-9"
          placeholder="Cari nama, kota, skill..."
        />
      </label>
      <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.profileStatus} onChange={(event) => setFilters({ ...filters, profileStatus: event.target.value as CandidateFilters["profileStatus"] })}>
        <option value="all">Semua profil</option>
        {Object.entries(profileLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.cvStatus} onChange={(event) => setFilters({ ...filters, cvStatus: event.target.value as CandidateFilters["cvStatus"] })}>
        <option value="all">Semua CV</option>
        {Object.entries(cvLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.education} onChange={(event) => setFilters({ ...filters, education: event.target.value })}>
        <option value="all">Pendidikan</option>
        {educations.map((education) => <option key={education} value={education}>{education}</option>)}
      </select>
      <div className="flex gap-2">
        <select className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm" value={filters.habit} onChange={(event) => setFilters({ ...filters, habit: event.target.value })}>
          <option value="all">Kebiasaan</option>
          {habits.map((habit) => <option key={habit} value={habit}>{habit}</option>)}
        </select>
        <Button size="icon" variant="outline" title="Reset filter" onClick={() => setFilters(initialFilters)}>
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
  onTriggerCv,
  onCompleteCv,
  onAddFile
}: {
  candidate: Candidate;
  isSuperadmin: boolean;
  tests: TestResult[];
  files: CandidateFile[];
  logs: AuditLog[];
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
          <CvBadge status={candidate.cvStatus} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList className="grid h-auto w-full grid-cols-5">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="tests">Tes</TabsTrigger>
            <TabsTrigger value="files">File</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <Info label="Alamat" value={`${candidate.address}, ${candidate.city}`} />
              <Info label="Fisik" value={`${candidate.height} cm / ${candidate.weight} kg`} />
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

function CandidatePortal({ candidateId }: { candidateId: number }) {
  const candidates = useCrmStore((state) => state.candidates);
  const files = useCrmStore((state) => state.files);
  const updateCandidate = useCrmStore((state) => state.updateCandidate);
  const triggerCvGeneration = useCrmStore((state) => state.triggerCvGeneration);
  const candidate = candidates.find((item) => item.id === candidateId) ?? candidates[0];
  const candidateFiles = files.filter((file) => file.candidateId === candidate.id && file.type === "cv");
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema) as never,
    defaultValues: toFormValues(candidate)
  });

  useEffect(() => {
    form.reset(toFormValues(candidate));
  }, [candidate, form]);

  async function save(values: CandidateFormValues, profileStatus: ProfileStatus) {
    const updated = await mockService.updateCandidate(candidate, fromFormValues(candidate, values, profileStatus));
    updateCandidate(updated, profileStatus === "complete" ? "final_submit_candidate" : "save_draft_candidate");
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Data Kandidat</CardTitle>
          <CardDescription>Simpan sebagai draft atau kirim final setelah data wajib lengkap.</CardDescription>
        </CardHeader>
        <CardContent>
            <form className="space-y-6" onSubmit={form.handleSubmit((values) => save(values as CandidateFormValues, "complete"))}>
            <FormSection title="Identitas">
              <Field label="Nama" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
              <Field label="Tanggal lahir" error={form.formState.errors.birthDate?.message}><Input type="date" {...form.register("birthDate")} /></Field>
              <Field label="Gender"><select className="h-10 rounded-md border bg-background px-3 text-sm" {...form.register("gender")}><option>Laki-laki</option><option>Perempuan</option></select></Field>
              <Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register("email")} /></Field>
              <Field label="Telepon" error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
            </FormSection>
            <FormSection title="Fisik dan Alamat">
              <Field label="Tinggi" error={form.formState.errors.height?.message}><Input type="number" {...form.register("height")} /></Field>
              <Field label="Berat" error={form.formState.errors.weight?.message}><Input type="number" {...form.register("weight")} /></Field>
              <Field label="Kota" error={form.formState.errors.city?.message}><Input {...form.register("city")} /></Field>
              <Field label="Alamat" error={form.formState.errors.address?.message}><Textarea {...form.register("address")} /></Field>
            </FormSection>
            <FormSection title="Pendidikan, Pengalaman, dan Keluarga">
              <Field label="Pendidikan" error={form.formState.errors.education?.message}><Input {...form.register("education")} /></Field>
              <Field label="Pengalaman" error={form.formState.errors.experience?.message}><Textarea {...form.register("experience")} /></Field>
              <Field label="Keluarga" error={form.formState.errors.family?.message}><Textarea {...form.register("family")} /></Field>
            </FormSection>
            <FormSection title="Kebiasaan, Skill, dan Medis">
              <Field label="Kebiasaan"><Input placeholder="Pisahkan dengan koma" {...form.register("habitsText")} /></Field>
              <Field label="Skill"><Input placeholder="Pisahkan dengan koma" {...form.register("skillsText")} /></Field>
              <Field label="Riwayat medis" error={form.formState.errors.medicalHistory?.message}><Textarea {...form.register("medicalHistory")} /></Field>
            </FormSection>
            {additionalFieldSections.map((section) => (
              <FormSection key={section.title} title={section.title}>
                {section.fields.map((field) => (
                  <AdditionalField key={field.name} field={field} register={form.register} />
                ))}
              </FormSection>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={form.handleSubmit((values) => save(values as CandidateFormValues, "draft"))}>
                Simpan Draft
              </Button>
              <Button type="submit">
                <ClipboardCheck className="h-4 w-4" /> Submit Final
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Kandidat</CardTitle>
            <CardDescription>{profileLabels[candidate.profileStatus]} - {candidate.completeness}% lengkap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={candidate.completeness} />
            <Checklist candidate={candidate} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CV Kandidat</CardTitle>
            <CardDescription>Status: {cvLabels[candidate.cvStatus]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CvBadge status={candidate.cvStatus} />
            <Button className="w-full" onClick={() => triggerCvGeneration(candidate.id)}>
              <FileText className="h-4 w-4" /> Generate CV
            </Button>
            {candidateFiles.length ? candidateFiles.map((file) => (
              <Button key={file.id} className="w-full" variant="outline" asChild>
                <a href={file.url}><Download className="h-4 w-4" /> {file.name}</a>
              </Button>
            )) : <p className="text-sm text-muted-foreground">Belum ada file CV terbaru.</p>}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
      {error ? <span className="block text-xs font-normal text-destructive">{error}</span> : null}
    </label>
  );
}

function AdditionalField({
  field,
  register
}: {
  field: AdditionalFieldConfig;
  register: UseFormRegister<CandidateFormValues>;
}) {
  const fieldName = `additionalFields.${field.name}` as const;

  return (
    <Field label={field.label}>
      {field.type === "select" ? (
        <select className="h-10 rounded-md border bg-background px-3 text-sm" {...register(fieldName)}>
          <option value="">Pilih {field.label.toLowerCase()}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type === "date" || field.type === "number" ? field.type : "text"}
          placeholder={field.type ? undefined : `Isi ${field.label.toLowerCase()}`}
          {...register(fieldName)}
        />
      )}
    </Field>
  );
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

function toFormValues(candidate: Candidate): CandidateFormValues {
  return {
    name: candidate.name,
    birthDate: candidate.birthDate,
    gender: candidate.gender,
    height: candidate.height,
    weight: candidate.weight,
    address: candidate.address,
    city: candidate.city,
    education: candidate.education,
    experience: candidate.experience,
    family: candidate.family,
    habitsText: candidate.habits.join(", "),
    skillsText: candidate.skills.join(", "),
    medicalHistory: candidate.medicalHistory,
    phone: candidate.phone,
    email: candidate.email,
    additionalFields: buildAdditionalFieldDefaults(candidate)
  };
}

function fromFormValues(candidate: Candidate, values: CandidateFormValues, profileStatus: ProfileStatus): Partial<Candidate> {
  const { habitsText, skillsText, additionalFields, ...baseValues } = values;

  return {
    ...baseValues,
    habits: splitCsv(habitsText),
    skills: splitCsv(skillsText),
    additionalFields: Object.fromEntries(Object.entries(additionalFields).map(([key, value]) => [key, String(value)])),
    profileStatus,
    completeness: profileStatus === "complete" ? 100 : Math.max(45, candidate.completeness),
    cvStatus: "stale" as CvStatus
  };
}

function buildAdditionalFieldDefaults(candidate: Candidate) {
  const savedFields = candidate.additionalFields ?? {};
  return additionalFieldSections.reduce<Record<string, string>>((acc, section) => {
    section.fields.forEach((field) => {
      acc[field.name] = savedFields[field.name] ?? "";
    });
    return acc;
  }, {});
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
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
