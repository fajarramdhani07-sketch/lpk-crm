"use client";

import { ArrowLeft, Download, FileText, Loader2, Pencil, Plus, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { CandidatePortalRebuilt } from "@/components/candidate-portal-rebuilt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuditLog, Candidate, CandidateFile, TestResult } from "@/lib/types";
import { CvBadge, FileBadge, ProfileBadge, cvLabels } from "./status";
import { Field, FieldGroup, TableHead, TableShell, calculateAge, dateOnly, formatDate } from "./shared";

type FileKind = "photo" | "document" | "video" | "cv";

export function CandidateDetail({
  candidate,
  candidates,
  files,
  tests,
  logs,
  isSuperadmin,
  createMode = false,
  onBack,
  onRefresh,
  onEditDone,
  onTriggerCv,
  onCompleteCv,
  onAddFile
}: {
  candidate: Candidate;
  candidates: Candidate[];
  files: CandidateFile[];
  tests: TestResult[];
  logs: AuditLog[];
  isSuperadmin: boolean;
  createMode?: boolean;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onEditDone: () => void;
  onTriggerCv: () => void | Promise<void>;
  onCompleteCv: () => void | Promise<void>;
  onAddFile: (type: FileKind) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(createMode);
  const extra = candidate.additionalFields ?? {};
  const latestTest = useMemo(() => tests.find((test) => test.isLatest) ?? tests[0], [tests]);

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
          <div className="text-sm font-semibold">{createMode ? "Tambah Kandidat" : `Edit ${candidate.name}`}</div>
        </div>
        <CandidatePortalRebuilt
          candidateId={candidate.id}
          candidate={candidate}
          candidates={candidates}
          files={files}
          onCancel={() => (createMode ? onBack() : setEditing(false))}
          onRefresh={onRefresh}
          onSaved={() => {
            setEditing(false);
            onEditDone();
          }}
          useBackend
          variant="embedded"
          createMode={createMode}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Kandidat
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddFile("document")}>
            <Upload className="h-4 w-4" /> Upload File
          </Button>
          <Button size="sm" onClick={onTriggerCv}>
            {candidate.cvStatus === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Generate CV
          </Button>
        </div>
      </div>

      <Card className="sticky top-20 z-10 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-semibold">{candidate.name || "Tanpa nama"}</h2>
                <ProfileBadge status={candidate.profileStatus} />
                <CvBadge status={candidate.cvStatus} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{candidate.email || "-"} • {candidate.phone || "-"} • Updated {formatDate(candidate.updatedAt)}</div>
            </div>
            <div className="grid min-w-[280px] gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile completeness</span>
                <span className="font-semibold">{candidate.completeness}%</span>
              </div>
              <Progress value={candidate.completeness} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="h-auto min-w-max justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="biodata">Biodata</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger>
            <TabsTrigger value="audit">Audit / History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <FieldGroup title="Operational Summary" columns={3}>
              <Field label="Candidate" value={candidate.name} />
              <Field label="Age" value={calculateAge(candidate.birthDate)} />
              <Field label="City" value={candidate.city} />
              <Field label="Education" value={candidate.education} />
              <Field label="Latest score" value={latestTest ? latestTest.totalScore : "-"} />
              <Field label="CV Status" value={cvLabels[candidate.cvStatus]} />
            </FieldGroup>
            <Card className="shadow-none">
              <CardContent className="space-y-3 p-4">
                <div className="text-sm font-semibold">Quick Actions</div>
                <Button className="w-full justify-start" onClick={onTriggerCv}><FileText className="h-4 w-4" /> Generate CV</Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => onAddFile("document")}><Plus className="h-4 w-4" /> Add Document</Button>
                {candidate.cvStatus === "processing" ? <Button className="w-full justify-start" variant="secondary" onClick={onCompleteCv}>Tandai Selesai</Button> : null}
                {isSuperadmin ? <Badge variant="outline">Superadmin audit access</Badge> : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="biodata">
          <FieldGroup title="Biodata" columns={3}>
            <Field label="Nama romaji" value={extra.full_name_romaji || candidate.name} />
            <Field label="Nama katakana" value={extra.full_name_katakana} />
            <Field label="Nickname" value={extra.nickname} />
            <Field label="Tanggal lahir" value={dateOnly(candidate.birthDate)} />
            <Field label="Tempat lahir" value={extra.birth_place} />
            <Field label="Gender" value={candidate.gender} />
            <Field label="Alamat" value={`${candidate.address || "-"}, ${candidate.city || "-"}`} />
            <Field label="Tinggi / berat" value={`${candidate.height || "-"} cm / ${candidate.weight || "-"} kg`} />
            <Field label="Medical" value={candidate.medicalHistory} />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="education">
          <FieldGroup title="Education" columns={2}>
            <Field label="Pendidikan terakhir" value={candidate.education} />
            <Field label="SMA/SMK" value={extra.senior_high_school_name} />
            <Field label="Jenis SMA/SMK" value={chooseOther(extra.senior_high_type, extra.senior_high_type_other)} />
            <Field label="Jurusan SMA/SMK" value={chooseOther(extra.senior_high_major, extra.senior_high_major_other)} />
            <Field label="Universitas" value={extra.university_name || extra.university} />
            <Field label="Jurusan universitas" value={chooseOther(extra.university_major, extra.university_major_other)} />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="experience">
          <FieldGroup title="Experience" columns={2}>
            <Field label="Ringkasan pengalaman" value={candidate.experience || extra.work_experience} />
            <Field label="Pernah bekerja" value={extra.work_has_experience} />
            <Field label="Pekerjaan terakhir" value={describeJob(extra, "job1")} />
            <Field label="Pekerjaan sebelumnya 1" value={describeJob(extra, "job2")} />
            <Field label="Pekerjaan sebelumnya 2" value={describeJob(extra, "job3")} />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="family">
          <FieldGroup title="Family" columns={2}>
            <Field label="Catatan keluarga" value={extra.family_notes || candidate.family} />
            {Array.from({ length: 6 }, (_, index) => (
              <Field key={index} label={`Keluarga ${index + 1}`} value={describeFamily(extra, index + 1)} />
            ))}
          </FieldGroup>
        </TabsContent>

        <TabsContent value="lifestyle">
          <FieldGroup title="Lifestyle & LPK" columns={3}>
            <Field label="Alkohol" value={extra.drinks_alcohol} />
            <Field label="Merokok" value={extra.smokes} />
            <Field label="Tato" value={extra.has_tattoo} />
            <Field label="Asal LPK" value={chooseOther(extra.lpk_origin, extra.lpk_origin_other) || extra.lpk_information} />
            <Field label="Jam belajar Jepang" value={extra.japanese_study_hours ? `${extra.japanese_study_hours} jam` : "-"} />
            <Field label="Skill" value={candidate.skills.join(", ")} />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="documents">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["photo", "document", "video", "cv"] as const).map((type) => (
                <Button key={type} variant="outline" size="sm" onClick={() => onAddFile(type)}>
                  <Upload className="h-4 w-4" /> {type}
                </Button>
              ))}
            </div>
            <FilesTable files={files} />
          </div>
        </TabsContent>

        <TabsContent value="tests">
          <TableShell minWidth={620}>
            <TableHead>
              <tr><th className="px-3 py-3">Attempt</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">Latest</th><th className="px-3 py-3">Created</th></tr>
            </TableHead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3">Attempt {test.attemptNumber}</td>
                  <td className="px-3 py-3 text-lg font-semibold">{test.totalScore}</td>
                  <td className="px-3 py-3">{test.isLatest ? <Badge variant="success">Latest</Badge> : "-"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(test.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="cv">
          <FieldGroup title="CV Control" columns={2}>
            <Field label="Status" value={<CvBadge status={candidate.cvStatus} />} />
            <Field label="Updated" value={formatDate(candidate.updatedAt)} />
            <Field label="Actions" value={<div className="flex flex-wrap gap-2"><Button size="sm" onClick={onTriggerCv}>Generate CV</Button>{candidate.cvStatus === "done" ? <Button size="sm" variant="outline" asChild><a href="#download-cv"><Download className="h-4 w-4" /> Unduh CV</a></Button> : null}</div>} />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="audit">
          <TableShell minWidth={720}>
            <TableHead>
              <tr><th className="px-3 py-3">Time</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Entity</th><th className="px-3 py-3">IP</th></tr>
            </TableHead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td>
                  <td className="px-3 py-3 font-medium">{log.action}</td>
                  <td className="px-3 py-3">{log.entityType} #{log.entityId}</td>
                  <td className="px-3 py-3">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilesTable({ files }: { files: CandidateFile[] }) {
  return (
    <TableShell minWidth={700}>
      <TableHead>
        <tr><th className="px-3 py-3">File</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Updated</th><th className="px-3 py-3">Action</th></tr>
      </TableHead>
      <tbody>
        {files.map((file) => (
          <tr key={file.id} className="border-b last:border-b-0">
            <td className="px-3 py-3 font-medium">{file.name}</td>
            <td className="px-3 py-3"><FileBadge type={file.type} /></td>
            <td className="px-3 py-3 text-muted-foreground">{formatDate(file.updatedAt)}</td>
            <td className="px-3 py-3"><Button size="sm" variant="outline" asChild><a href={file.url}>Buka</a></Button></td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function chooseOther(value?: string, other?: string) {
  return value === "Lainnya" ? other : value;
}

function describeJob(extra: Record<string, string>, prefix: "job1" | "job2" | "job3") {
  const title = extra[`${prefix}_title`];
  const company = extra[`${prefix}_company`];
  const role = chooseOther(extra[`${prefix}_role`], extra[`${prefix}_role_other`]);
  return [title, company, role].filter(Boolean).join(" • ");
}

function describeFamily(extra: Record<string, string>, index: number) {
  const prefix = `family${index}`;
  const name = extra[`${prefix}_name`];
  const relation = chooseOther(extra[`${prefix}_relation`], extra[`${prefix}_relation_other`]);
  const occupation = chooseOther(extra[`${prefix}_occupation`], extra[`${prefix}_occupation_other`]);
  return [name, relation, occupation].filter(Boolean).join(" • ");
}

