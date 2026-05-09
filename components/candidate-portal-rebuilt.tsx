"use client";

import { AlertCircle, CheckCircle2, Download, FileText, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type Path, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { backendService } from "@/lib/backend-service";
import { mockService } from "@/lib/mock-service";
import { useCrmStore } from "@/lib/store";
import type { Candidate, CandidateFile, ProfileStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const yesNoOptions = ["Ya", "Tidak"];
const genderOptions = ["Laki-laki", "Perempuan"];
const bloodTypeOptions = ["A", "B", "AB", "O", "Tidak tahu"];
const religionOptions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"];
const maritalStatusOptions = ["Belum menikah", "Menikah", "Cerai"];
const passportStatusOptions = ["Belum ada", "Dalam proses", "Sudah ada"];
const educationLevelOptions = ["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"];
const seniorHighTypeOptions = ["SMA", "SMK", "MA", "Lainnya"];
const seniorMajorOptions = ["IPA", "IPS", "Bahasa", "Teknik Mesin", "Teknik Elektro", "Perhotelan", "Keperawatan", "Lainnya"];
const degreeLevelOptions = ["D1", "D2", "D3", "D4", "S1", "S2", "S3", "Lainnya"];
const universityMajorOptions = ["Teknik", "Kesehatan", "Ekonomi", "Pendidikan", "Bahasa Jepang", "Perhotelan", "Lainnya"];
const jobRoleOptions = ["Operator Produksi", "Teknisi", "Caregiver", "Housekeeping", "Admin", "Kasir", "Driver", "Lainnya"];
const familyRelationOptions = ["Ayah", "Ibu", "Suami", "Istri", "Anak", "Kakak", "Adik", "Saudara", "Lainnya"];
const occupationOptions = ["Tidak bekerja", "Ibu rumah tangga", "Petani", "Wiraswasta", "Karyawan", "Pelajar", "Pensiunan", "Lainnya"];
const lpkOriginOptions = ["LPK Sakura", "LPK Nusantara", "LPK Maju Jaya", "LPK Hinode", "Lainnya"];
const documentItems = ["KTP", "KK", "Ijazah", "Paspor", "Medical Checkup", "Foto Profil"] as const;

type JobRow = {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  role: string;
  role_other: string;
};

type FamilyMember = {
  name: string;
  birth_date: string;
  relation: string;
  relation_other: string;
  occupation: string;
  occupation_other: string;
};

type CandidateFormValues = {
  identity: {
    submitted_at: string;
    email: string;
    full_name_romaji: string;
    full_name_katakana: string;
    nickname: string;
    phone_number: string;
    profile_photo: string;
    birth_date: string;
    birth_place: string;
    gender: string;
  };
  address: {
    street: string;
    village: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  personal: {
    height_cm: string;
    weight_kg: string;
    blood_type: string;
    marital_status: string;
    religion: string;
    passport_status: string;
    medical_history: string;
    wears_glasses: string;
    medical_checkup_file: string;
  };
  education: {
    highest_level: string;
    elementary_school_name: string;
    elementary_start_date: string;
    elementary_end_date: string;
    junior_high_school_name: string;
    junior_high_start_date: string;
    junior_high_end_date: string;
    senior_high_school_name: string;
    senior_high_start_date: string;
    senior_high_end_date: string;
    senior_high_type: string;
    senior_high_type_other: string;
    senior_high_major: string;
    senior_high_major_other: string;
    university: string;
    university_name: string;
    university_start_date: string;
    university_end_date: string;
    degree_level: string;
    degree_level_other: string;
    university_major: string;
    university_major_other: string;
  };
  work: {
    has_experience: string;
    latest: JobRow;
    previous1: JobRow;
    previous2: JobRow;
  };
  family: {
    notes: string;
    members: FamilyMember[];
  };
  lifestyle: {
    drinks_alcohol: string;
    smokes: string;
    has_tattoo: string;
  };
  lpk: {
    origin: string;
    origin_other: string;
    japanese_study_hours: string;
  };
  documents: {
    items: Record<(typeof documentItems)[number], string>;
    physical_test_video: string;
    additional_files: string[];
  };
};

type FormPath = Path<CandidateFormValues>;
type FormErrors = Record<string, string>;

const emptyJob: JobRow = {
  title: "",
  company: "",
  start_date: "",
  end_date: "",
  role: "",
  role_other: ""
};

const emptyFamilyMember: FamilyMember = {
  name: "",
  birth_date: "",
  relation: "",
  relation_other: "",
  occupation: "",
  occupation_other: ""
};

const cvLabels = {
  pending: "Pending",
  processing: "Diproses",
  done: "Selesai",
  failed: "Gagal",
  stale: "Perlu generate ulang"
};

export function CandidatePortalRebuilt({
  candidateId,
  candidate: backendCandidate,
  candidates: backendCandidates,
  files: backendFiles,
  useBackend = false,
  onRefresh,
  onCancel,
  onSaved,
  variant = "page",
  createMode = false
}: {
  candidateId: number;
  candidate?: Candidate;
  candidates?: Candidate[];
  files?: CandidateFile[];
  useBackend?: boolean;
  onRefresh?: () => Promise<void>;
  onCancel?: () => void;
  onSaved?: () => void;
  variant?: "page" | "embedded";
  createMode?: boolean;
}) {
  const storeCandidates = useCrmStore((state) => state.candidates);
  const storeFiles = useCrmStore((state) => state.files);
  const updateCandidate = useCrmStore((state) => state.updateCandidate);
  const triggerCvGeneration = useCrmStore((state) => state.triggerCvGeneration);
  const candidates = backendCandidates ?? storeCandidates;
  const files = backendFiles ?? storeFiles;
  const candidate = backendCandidate ?? candidates.find((item) => item.id === candidateId) ?? candidates[0] ?? emptyCandidate(candidateId);
  const candidateFiles = files.filter((file) => file.candidateId === candidate.id && file.type === "cv");
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState<SectionKey>("identity");
  const form = useForm<CandidateFormValues>({
    defaultValues: toStructuredFormValues(candidate)
  });
  const values = form.watch();
  const sectionStats = useMemo(() => buildSectionStats(values), [values]);

  useEffect(() => {
    form.reset(toStructuredFormValues(candidate));
    setErrors({});
  }, [candidate, form]);

  async function save(profileStatus: ProfileStatus) {
    const valuesToSave = form.getValues();
    const nextValues =
      profileStatus === "complete"
        ? {
            ...valuesToSave,
            identity: {
              ...valuesToSave.identity,
              submitted_at: new Date().toISOString().slice(0, 10)
            }
          }
        : valuesToSave;

    if (profileStatus === "complete") {
      const finalErrors = validateFinal(nextValues, candidate, candidates);
      setErrors(finalErrors);
      if (Object.keys(finalErrors).length > 0) {
        setMessage("Periksa kembali field yang wajib diisi sebelum submit final.");
        return;
      }
    } else {
      setErrors({});
    }

    form.reset(nextValues);
    if (useBackend) {
      const basePayload = mapToBackendCandidatePayload(nextValues, profileStatus);
      const payload = createMode ? withCreateFallbacks(basePayload, candidate) : basePayload;
      if (createMode) {
        await backendService.createCandidate(payload);
      } else {
        await backendService.updateCandidate(candidate.id, payload);
      }
      await onRefresh?.();
    } else {
      const updated = await mockService.updateCandidate(candidate, mapToCandidatePatch(candidate, nextValues, profileStatus));
      updateCandidate(updated, profileStatus === "complete" ? "final_submit_candidate" : "save_draft_candidate");
    }
    setMessage(profileStatus === "complete" ? "Data final tersimpan." : "Draft tersimpan.");
    onSaved?.();
  }

  async function handleGenerateCv() {
    if (useBackend) {
      await backendService.createCvJobs(candidate.id);
      await onRefresh?.();
      return;
    }
    triggerCvGeneration(candidate.id);
  }

  const isEmbedded = variant === "embedded";
  const sections: SectionConfig[] = [
    {
      key: "identity",
      title: "Identitas",
      stats: sectionStats.identity,
      content: <IdentitySection register={form.register} setValue={form.setValue} watch={form.watch} errors={errors} candidates={candidates} candidate={candidate} />
    },
    {
      key: "personal",
      title: "Data Pribadi",
      stats: sectionStats.personal,
      content: <PersonalSection register={form.register} setValue={form.setValue} watch={form.watch} errors={errors} />
    },
    {
      key: "education",
      title: "Pendidikan",
      stats: sectionStats.education,
      content: <EducationSection register={form.register} watch={form.watch} errors={errors} />
    },
    {
      key: "work",
      title: "Pengalaman Kerja",
      stats: sectionStats.work,
      content: <WorkSection register={form.register} watch={form.watch} errors={errors} />
    },
    {
      key: "family",
      title: "Keluarga",
      stats: sectionStats.family,
      content: <FamilySection register={form.register} watch={form.watch} errors={errors} />
    },
    {
      key: "lpk",
      title: "Lifestyle & LPK",
      stats: sectionStats.lpk,
      content: <LifestyleLpkSection register={form.register} watch={form.watch} errors={errors} />
    },
    {
      key: "documents",
      title: "Dokumen",
      stats: sectionStats.documents,
      content: <DocumentsSection setValue={form.setValue} watch={form.watch} errors={errors} />
    }
  ];

  return (
    <div className={cn(isEmbedded ? "grid gap-4" : "mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6")}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Form Data Kandidat</CardTitle>
              <CardDescription>Isi data kandidat per bagian. Draft bisa disimpan kapan saja, submit final memakai validasi key field.</CardDescription>
            </div>
            {onCancel ? (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Batal
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            {isEmbedded ? (
              <>
                {sections.map((section, index) => (
                  <AccordionSection key={section.key} title={section.title} stats={section.stats} defaultOpen={index === 0}>
                    {section.content}
                  </AccordionSection>
                ))}
              </>
            ) : (
              <CandidateSectionTabs
                activeSection={activeSection}
                sections={sections}
                setActiveSection={setActiveSection}
              />
            )}

            {message ? (
              <div className={cn("rounded-md border px-3 py-2 text-sm", Object.keys(errors).length ? "border-destructive text-destructive" : "border-emerald-200 bg-emerald-50 text-emerald-800")}>
                {message}
              </div>
            ) : null}

            <CandidateFormActions
              activeSection={activeSection}
              isEmbedded={isEmbedded}
              onCancel={onCancel}
              onPrevious={() => setActiveSection(previousSection(activeSection))}
              onNext={() => setActiveSection(nextSection(activeSection))}
              onSaveDraft={() => void save("draft")}
              onSubmitFinal={() => void save("complete")}
            />
          </form>
        </CardContent>
      </Card>

      {!isEmbedded ? (
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Kandidat</CardTitle>
            <CardDescription>{candidate.profileStatus === "complete" ? "Lengkap" : "Draft"} - {candidate.completeness}% lengkap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={candidate.completeness} />
            <div className="grid gap-2 text-sm">
              {Object.entries(sectionStats).map(([key, stat]) => (
                <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span>{sectionTitle(key)}</span>
                  <Badge variant={stat.complete === stat.total ? "success" : "warning"}>{stat.complete}/{stat.total}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CV Kandidat</CardTitle>
            <CardDescription>Status: {cvLabels[candidate.cvStatus]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={candidate.cvStatus === "done" ? "success" : candidate.cvStatus === "failed" ? "danger" : "warning"}>
              {cvLabels[candidate.cvStatus]}
            </Badge>
            <Button className="w-full" onClick={() => void handleGenerateCv()}>
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
      ) : null}
    </div>
  );
}

function CandidateFormActions({
  activeSection,
  isEmbedded,
  onCancel,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmitFinal
}: {
  activeSection: SectionKey;
  isEmbedded: boolean;
  onCancel?: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmitFinal: () => void;
}) {
  const currentIndex = sectionOrder.indexOf(activeSection);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === sectionOrder.length - 1;

  return (
    <div className="sticky bottom-0 z-10 -mx-5 flex flex-col gap-3 border-t bg-card/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      {!isEmbedded ? (
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={isFirst} onClick={onPrevious}>
            Sebelumnya
          </Button>
          <Button type="button" variant={isLast ? "secondary" : "outline"} disabled={isLast} onClick={onNext}>
            Selanjutnya
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button type="button" variant="outline" onClick={onSaveDraft}>
          Simpan Draft
        </Button>
        <Button type="button" onClick={onSubmitFinal}>
          <CheckCircle2 className="h-4 w-4" /> Submit Final
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function CandidateSectionTabs({
  activeSection,
  sections,
  setActiveSection
}: {
  activeSection: SectionKey;
  sections: SectionConfig[];
  setActiveSection: (section: SectionKey) => void;
}) {
  const active = sections.find((section) => section.key === activeSection) ?? sections[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav className="lg:sticky lg:top-20 lg:self-start">
        <div className="hidden space-y-2 lg:block">
          {sections.map((section, index) => (
            <SectionTabButton
              key={section.key}
              section={section}
              index={index}
              active={section.key === activeSection}
              onClick={() => setActiveSection(section.key)}
            />
          ))}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:hidden">
          {sections.map((section, index) => (
            <SectionTabButton
              key={section.key}
              section={section}
              index={index}
              active={section.key === activeSection}
              onClick={() => setActiveSection(section.key)}
              compact
            />
          ))}
        </div>
      </nav>
      <section className="min-w-0 rounded-md border bg-card">
        <div className="border-b bg-muted/40 px-4 py-3">
          <h2 className="text-sm font-semibold">{active.title}</h2>
          <p className="text-xs text-muted-foreground">{active.stats.complete} dari {active.stats.total} item terisi</p>
        </div>
        <div className="p-4">{active.content}</div>
      </section>
    </div>
  );
}

function SectionTabButton({
  section,
  index,
  active,
  onClick,
  compact = false
}: {
  section: SectionConfig;
  index: number;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const percentage = section.stats.total ? Math.round((section.stats.complete / section.stats.total) * 100) : 0;

  return (
    <button
      type="button"
      className={cn(
        "rounded-md border text-left transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
        compact ? "min-w-40 px-3 py-2" : "w-full px-3 py-3"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium opacity-75">{String(index + 1).padStart(2, "0")}</span>
        <Badge variant={active ? "secondary" : percentage === 100 ? "success" : "warning"}>{section.stats.complete}/{section.stats.total}</Badge>
      </div>
      <div className="mt-2 text-sm font-semibold">{section.title}</div>
      <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", active ? "bg-primary-foreground/25" : "bg-muted")}>
        <div className={cn("h-full rounded-full", active ? "bg-primary-foreground" : "bg-accent")} style={{ width: `${percentage}%` }} />
      </div>
    </button>
  );
}

function previousSection(section: SectionKey) {
  const currentIndex = sectionOrder.indexOf(section);
  return sectionOrder[Math.max(0, currentIndex - 1)];
}

function nextSection(section: SectionKey) {
  const currentIndex = sectionOrder.indexOf(section);
  return sectionOrder[Math.min(sectionOrder.length - 1, currentIndex + 1)];
}

function IdentitySection({
  register,
  setValue,
  watch,
  errors,
  candidates,
  candidate
}: SectionProps & { candidates: Candidate[]; candidate: Candidate }) {
  const birthDate = watch("identity.birth_date");
  const photo = watch("identity.profile_photo");
  const email = watch("identity.email");
  const duplicateEmail = isDuplicateEmail(email, candidate, candidates);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField label="Nama lengkap romaji" name="identity.full_name_romaji" register={register} errors={errors} uppercase />
      <TextField label="Nama lengkap katakana" name="identity.full_name_katakana" register={register} errors={errors} />
      <TextField label="Nama panggilan" name="identity.nickname" register={register} errors={errors} uppercase />
      <TextField label="Email" name="identity.email" register={register} errors={errors} type="email" helper={duplicateEmail ? "Email sudah digunakan kandidat lain." : undefined} />
      <TextField label="Nomor HP" name="identity.phone_number" register={register} errors={errors} />
      <FileField label="Foto profil" name="identity.profile_photo" value={photo} setValue={setValue} errors={errors} accept="image/*" preview />
      <TextField label="Tanggal lahir" name="identity.birth_date" register={register} errors={errors} type="date" />
      <TextField label="Tempat lahir" name="identity.birth_place" register={register} errors={errors} uppercase />
      <SelectField label="Gender" name="identity.gender" register={register} errors={errors} options={genderOptions} />
      <ReadOnlyField label="Usia" value={birthDate ? `${calculateAge(birthDate)} tahun` : "Otomatis dari tanggal lahir"} />
      <TextField label="Jalan / alamat" name="address.street" register={register} errors={errors} className="md:col-span-2" />
      <TextField label="Kelurahan / kecamatan" name="address.village" register={register} errors={errors} />
      <TextField label="Kota / kabupaten" name="address.city" register={register} errors={errors} />
      <TextField label="Provinsi" name="address.province" register={register} errors={errors} />
      <TextField label="Kode pos" name="address.postal_code" register={register} errors={errors} />
      <TextField label="Negara" name="address.country" register={register} errors={errors} />
    </div>
  );
}

function PersonalSection({ register, setValue, watch, errors }: SectionProps) {
  const medicalFile = watch("personal.medical_checkup_file");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField label="Tinggi badan (cm)" name="personal.height_cm" register={register} errors={errors} type="number" />
      <TextField label="Berat badan (kg)" name="personal.weight_kg" register={register} errors={errors} type="number" />
      <SelectField label="Golongan darah" name="personal.blood_type" register={register} errors={errors} options={bloodTypeOptions} />
      <SelectField label="Status pernikahan" name="personal.marital_status" register={register} errors={errors} options={maritalStatusOptions} />
      <SelectField label="Agama" name="personal.religion" register={register} errors={errors} options={religionOptions} />
      <SelectField label="Status paspor" name="personal.passport_status" register={register} errors={errors} options={passportStatusOptions} />
      <SelectField label="Memakai kacamata" name="personal.wears_glasses" register={register} errors={errors} options={yesNoOptions} />
      <FileField label="File medical checkup" name="personal.medical_checkup_file" value={medicalFile} setValue={setValue} errors={errors} />
      <TextAreaField label="Riwayat medis" name="personal.medical_history" register={register} errors={errors} className="md:col-span-2" />
    </div>
  );
}

function EducationSection({ register, watch, errors }: Pick<SectionProps, "register" | "watch" | "errors">) {
  const university = watch("education.university");
  const seniorMajor = watch("education.senior_high_major");
  const seniorType = watch("education.senior_high_type");
  const degreeLevel = watch("education.degree_level");
  const universityMajor = watch("education.university_major");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Pendidikan terakhir" name="education.highest_level" register={register} errors={errors} options={educationLevelOptions} />
      </div>
      <EducationBlock title="SD" register={register} errors={errors} prefix="elementary" />
      <EducationBlock title="SMP" register={register} errors={errors} prefix="junior_high" />
      <div className="rounded-md border p-4">
        <h3 className="mb-3 text-sm font-semibold">SMA / SMK</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Nama sekolah" name="education.senior_high_school_name" register={register} errors={errors} uppercase />
          <SelectField label="Jenis sekolah" name="education.senior_high_type" register={register} errors={errors} options={seniorHighTypeOptions} />
          {seniorType === "Lainnya" ? <TextField label="Jenis lainnya" name="education.senior_high_type_other" register={register} errors={errors} /> : null}
          <SelectField label="Jurusan" name="education.senior_high_major" register={register} errors={errors} options={seniorMajorOptions} />
          {seniorMajor === "Lainnya" ? <TextField label="Jurusan lainnya" name="education.senior_high_major_other" register={register} errors={errors} /> : null}
          <TextField label="Tanggal mulai" name="education.senior_high_start_date" register={register} errors={errors} type="date" />
          <TextField label="Tanggal selesai" name="education.senior_high_end_date" register={register} errors={errors} type="date" />
        </div>
      </div>
      <div className="rounded-md border p-4">
        <h3 className="mb-3 text-sm font-semibold">Universitas</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Pernah kuliah" name="education.university" register={register} errors={errors} options={yesNoOptions} />
          {university === "Ya" ? (
            <>
              <TextField label="Nama universitas" name="education.university_name" register={register} errors={errors} uppercase />
              <SelectField label="Jenjang gelar" name="education.degree_level" register={register} errors={errors} options={degreeLevelOptions} />
              {degreeLevel === "Lainnya" ? <TextField label="Jenjang lainnya" name="education.degree_level_other" register={register} errors={errors} /> : null}
              <SelectField label="Jurusan universitas" name="education.university_major" register={register} errors={errors} options={universityMajorOptions} />
              {universityMajor === "Lainnya" ? <TextField label="Jurusan lainnya" name="education.university_major_other" register={register} errors={errors} /> : null}
              <TextField label="Tanggal mulai" name="education.university_start_date" register={register} errors={errors} type="date" />
              <TextField label="Tanggal selesai" name="education.university_end_date" register={register} errors={errors} type="date" />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WorkSection({ register, watch, errors }: Pick<SectionProps, "register" | "watch" | "errors">) {
  const hasExperience = watch("work.has_experience");

  return (
    <div className="space-y-5">
      <SelectField label="Pernah bekerja" name="work.has_experience" register={register} errors={errors} options={yesNoOptions} />
      {hasExperience === "Ya" ? (
        <>
          <JobBlock title="Pekerjaan terakhir" prefix="work.latest" register={register} watch={watch} errors={errors} />
          <JobBlock title="Pekerjaan sebelumnya 1" prefix="work.previous1" register={register} watch={watch} errors={errors} optional />
          <JobBlock title="Pekerjaan sebelumnya 2" prefix="work.previous2" register={register} watch={watch} errors={errors} optional />
        </>
      ) : null}
    </div>
  );
}

function FamilySection({ register, watch, errors }: Pick<SectionProps, "register" | "watch" | "errors">) {
  return (
    <div className="space-y-5">
      <TextAreaField label="Catatan keluarga" name="family.notes" register={register} errors={errors} />
      {Array.from({ length: 6 }, (_, index) => {
        const birthDate = asString(watch(`family.members.${index}.birth_date` as FormPath));
        const relation = asString(watch(`family.members.${index}.relation` as FormPath));
        const occupation = asString(watch(`family.members.${index}.occupation` as FormPath));

        return (
          <div key={index} className="rounded-md border p-4">
            <h3 className="mb-3 text-sm font-semibold">Keluarga {index + 1}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Nama" name={`family.members.${index}.name` as FormPath} register={register} errors={errors} uppercase />
              <TextField label="Tanggal lahir" name={`family.members.${index}.birth_date` as FormPath} register={register} errors={errors} type="date" />
              <ReadOnlyField label="Usia" value={birthDate ? `${calculateAge(birthDate)} tahun` : "Otomatis dari tanggal lahir"} />
              <SelectField label="Hubungan" name={`family.members.${index}.relation` as FormPath} register={register} errors={errors} options={familyRelationOptions} />
              {relation === "Lainnya" ? <TextField label="Hubungan lainnya" name={`family.members.${index}.relation_other` as FormPath} register={register} errors={errors} /> : null}
              <SelectField label="Pekerjaan" name={`family.members.${index}.occupation` as FormPath} register={register} errors={errors} options={occupationOptions} />
              {occupation === "Lainnya" ? <TextField label="Pekerjaan lainnya" name={`family.members.${index}.occupation_other` as FormPath} register={register} errors={errors} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LifestyleLpkSection({ register, watch, errors }: Pick<SectionProps, "register" | "watch" | "errors">) {
  const origin = watch("lpk.origin");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SelectField label="Minum alkohol" name="lifestyle.drinks_alcohol" register={register} errors={errors} options={yesNoOptions} />
      <SelectField label="Merokok" name="lifestyle.smokes" register={register} errors={errors} options={yesNoOptions} />
      <SelectField label="Memiliki tato" name="lifestyle.has_tattoo" register={register} errors={errors} options={yesNoOptions} />
      <SelectField label="Asal LPK" name="lpk.origin" register={register} errors={errors} options={lpkOriginOptions} />
      {origin === "Lainnya" ? <TextField label="Asal LPK lainnya" name="lpk.origin_other" register={register} errors={errors} /> : null}
      <TextField label="Jam belajar bahasa Jepang" name="lpk.japanese_study_hours" register={register} errors={errors} type="number" />
    </div>
  );
}

function DocumentsSection({ setValue, watch, errors }: Pick<SectionProps, "setValue" | "watch" | "errors">) {
  const additionalFiles = watch("documents.additional_files");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        {documentItems.map((item) => (
          <FileField
            key={item}
            label={item}
            name={`documents.items.${item}` as FormPath}
            value={asString(watch(`documents.items.${item}` as FormPath))}
            setValue={setValue}
            errors={errors}
          />
        ))}
      </div>
      <FileField label="Video tes fisik" name="documents.physical_test_video" value={watch("documents.physical_test_video")} setValue={setValue} errors={errors} accept="video/*" />
      <MultiFileField label="File tambahan" name="documents.additional_files" values={additionalFiles} setValue={setValue} />
    </div>
  );
}

type SectionProps = {
  register: UseFormRegister<CandidateFormValues>;
  setValue: UseFormSetValue<CandidateFormValues>;
  watch: UseFormWatch<CandidateFormValues>;
  errors: FormErrors;
};

const sectionOrder = ["identity", "personal", "education", "work", "family", "lpk", "documents"] as const;
type SectionKey = (typeof sectionOrder)[number];

type SectionConfig = {
  key: SectionKey;
  title: string;
  stats: { complete: number; total: number };
  content: React.ReactNode;
};

function AccordionSection({
  title,
  stats,
  children,
  defaultOpen = false
}: {
  title: string;
  stats: { complete: number; total: number };
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const percentage = stats.total ? Math.round((stats.complete / stats.total) * 100) : 0;

  return (
    <details className="rounded-lg border bg-card" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{stats.complete} dari {stats.total} item terisi</p>
        </div>
        <div className="flex w-36 items-center gap-2">
          <Progress value={percentage} />
          <span className="w-9 text-right text-xs">{percentage}%</span>
        </div>
      </summary>
      <div className="border-t p-4">{children}</div>
    </details>
  );
}

function EducationBlock({
  title,
  prefix,
  register,
  errors
}: {
  title: string;
  prefix: "elementary" | "junior_high";
  register: UseFormRegister<CandidateFormValues>;
  errors: FormErrors;
}) {
  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Nama sekolah" name={`education.${prefix}_school_name` as FormPath} register={register} errors={errors} uppercase />
        <TextField label="Tanggal mulai" name={`education.${prefix}_start_date` as FormPath} register={register} errors={errors} type="date" />
        <TextField label="Tanggal selesai" name={`education.${prefix}_end_date` as FormPath} register={register} errors={errors} type="date" />
      </div>
    </div>
  );
}

function JobBlock({
  title,
  prefix,
  register,
  watch,
  errors,
  optional = false
}: {
  title: string;
  prefix: "work.latest" | "work.previous1" | "work.previous2";
  register: UseFormRegister<CandidateFormValues>;
  watch: UseFormWatch<CandidateFormValues>;
  errors: FormErrors;
  optional?: boolean;
}) {
  const role = watch(`${prefix}.role` as FormPath);

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}{optional ? " (opsional)" : ""}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Nama pekerjaan" name={`${prefix}.title` as FormPath} register={register} errors={errors} uppercase />
        <TextField label="Nama perusahaan" name={`${prefix}.company` as FormPath} register={register} errors={errors} uppercase />
        <SelectField label="Posisi" name={`${prefix}.role` as FormPath} register={register} errors={errors} options={jobRoleOptions} />
        {role === "Lainnya" ? <TextField label="Posisi lainnya" name={`${prefix}.role_other` as FormPath} register={register} errors={errors} /> : null}
        <TextField label="Tanggal mulai" name={`${prefix}.start_date` as FormPath} register={register} errors={errors} type="date" />
        <TextField label="Tanggal selesai" name={`${prefix}.end_date` as FormPath} register={register} errors={errors} type="date" />
      </div>
    </div>
  );
}

function TextField({
  label,
  name,
  register,
  errors,
  type = "text",
  uppercase = false,
  className,
  helper
}: {
  label: string;
  name: FormPath;
  register: UseFormRegister<CandidateFormValues>;
  errors: FormErrors;
  type?: "text" | "email" | "date" | "number";
  uppercase?: boolean;
  className?: string;
  helper?: string;
}) {
  return (
    <label className={cn("space-y-1.5 text-sm font-medium", className)}>
      <span>{label}</span>
      <Input
        type={type}
        {...register(name, {
          onChange: uppercase ? (event) => {
            event.target.value = toUpperValue(event.target.value);
          } : undefined
        })}
      />
      {helper ? <span className="block text-xs font-normal text-amber-700">{helper}</span> : null}
      <FieldError name={name} errors={errors} />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  register,
  errors,
  className
}: {
  label: string;
  name: FormPath;
  register: UseFormRegister<CandidateFormValues>;
  errors: FormErrors;
  className?: string;
}) {
  return (
    <label className={cn("space-y-1.5 text-sm font-medium", className)}>
      <span>{label}</span>
      <Textarea {...register(name)} />
      <FieldError name={name} errors={errors} />
    </label>
  );
}

function SelectField({
  label,
  name,
  register,
  errors,
  options
}: {
  label: string;
  name: FormPath;
  register: UseFormRegister<CandidateFormValues>;
  errors: FormErrors;
  options: string[];
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...register(name)}>
        <option value="">Pilih {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <FieldError name={name} errors={errors} />
    </label>
  );
}

function FileField({
  label,
  name,
  value,
  setValue,
  errors,
  accept,
  preview = false
}: {
  label: string;
  name: FormPath;
  value: string;
  setValue: UseFormSetValue<CandidateFormValues>;
  errors: FormErrors;
  accept?: string;
  preview?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  return (
    <div className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted">
        <span className="truncate text-muted-foreground">{value || "Pilih file mock"}</span>
        <Upload className="h-4 w-4 shrink-0" />
        <input
          className="hidden"
          type="file"
          accept={accept}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setValue(name, file.name, { shouldDirty: true });
            if (preview && file.type.startsWith("image/")) {
              setPreviewUrl(URL.createObjectURL(file));
            }
          }}
        />
      </label>
      {preview && previewUrl ? (
        <div
          aria-label="Preview foto profil"
          className="h-24 w-24 rounded-md border bg-cover bg-center"
          style={{ backgroundImage: `url(${previewUrl})` }}
        />
      ) : null}
      {value ? (
        <button className="inline-flex items-center gap-1 text-xs text-muted-foreground" type="button" onClick={() => setValue(name, "", { shouldDirty: true })}>
          <X className="h-3 w-3" /> Hapus file
        </button>
      ) : null}
      <FieldError name={name} errors={errors} />
    </div>
  );
}

function MultiFileField({
  label,
  name,
  values,
  setValue
}: {
  label: string;
  name: "documents.additional_files";
  values: string[];
  setValue: UseFormSetValue<CandidateFormValues>;
}) {
  return (
    <div className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted">
        <span className="text-muted-foreground">Tambah beberapa file mock</span>
        <Upload className="h-4 w-4" />
        <input
          className="hidden"
          type="file"
          multiple
          onChange={(event) => {
            const nextFiles = Array.from(event.target.files ?? []).map((file) => file.name);
            setValue(name, [...values, ...nextFiles], { shouldDirty: true });
          }}
        />
      </label>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((file) => (
            <Badge key={file} variant="outline" className="gap-1">
              {file}
              <button type="button" onClick={() => setValue(name, values.filter((item) => item !== file), { shouldDirty: true })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

function FieldError({ name, errors }: { name: string; errors: FormErrors }) {
  return errors[name] ? (
    <span className="flex items-center gap-1 text-xs font-normal text-destructive">
      <AlertCircle className="h-3 w-3" /> {errors[name]}
    </span>
  ) : null;
}

function validateFinal(values: CandidateFormValues, candidate: Candidate, candidates: Candidate[]) {
  const errors: FormErrors = {};
  const requireField = (path: FormPath, value: unknown, message = "Wajib diisi") => {
    if (!hasValue(value)) errors[path] = message;
  };

  requireField("identity.full_name_romaji", values.identity.full_name_romaji);
  requireField("identity.full_name_katakana", values.identity.full_name_katakana);
  requireField("identity.email", values.identity.email);
  requireField("identity.phone_number", values.identity.phone_number);
  requireField("identity.profile_photo", values.identity.profile_photo);
  requireField("identity.birth_date", values.identity.birth_date);
  requireField("identity.birth_place", values.identity.birth_place);
  requireField("identity.gender", values.identity.gender);
  requireField("address.street", values.address.street);
  requireField("address.city", values.address.city);
  requireField("address.province", values.address.province);
  requireField("personal.height_cm", values.personal.height_cm);
  requireField("personal.weight_kg", values.personal.weight_kg);
  requireField("personal.blood_type", values.personal.blood_type);
  requireField("personal.marital_status", values.personal.marital_status);
  requireField("personal.religion", values.personal.religion);
  requireField("personal.passport_status", values.personal.passport_status);
  requireField("personal.medical_history", values.personal.medical_history);
  requireField("personal.wears_glasses", values.personal.wears_glasses);
  requireField("education.highest_level", values.education.highest_level);
  requireField("lifestyle.drinks_alcohol", values.lifestyle.drinks_alcohol);
  requireField("lifestyle.smokes", values.lifestyle.smokes);
  requireField("lifestyle.has_tattoo", values.lifestyle.has_tattoo);
  requireField("lpk.origin", values.lpk.origin);
  requireField("lpk.japanese_study_hours", values.lpk.japanese_study_hours);
  requireField("documents.physical_test_video", values.documents.physical_test_video);

  if (!isEmail(values.identity.email)) errors["identity.email"] = "Format email tidak valid";
  if (isDuplicateEmail(values.identity.email, candidate, candidates)) errors["identity.email"] = "Email sudah digunakan kandidat lain";
  if (!isKatakana(values.identity.full_name_katakana)) errors["identity.full_name_katakana"] = "Gunakan karakter katakana";
  if (!isIndonesianMobile(values.identity.phone_number)) errors["identity.phone_number"] = "Gunakan nomor HP Indonesia yang valid";
  if (!numberInRange(values.personal.height_cm, 120, 220)) errors["personal.height_cm"] = "Tinggi harus 120-220 cm";
  if (!numberInRange(values.personal.weight_kg, 35, 140)) errors["personal.weight_kg"] = "Berat harus 35-140 kg";
  if (!numberInRange(values.lpk.japanese_study_hours, 0, 10000)) errors["lpk.japanese_study_hours"] = "Jam belajar harus angka 0 atau lebih";
  if (values.lpk.origin === "Lainnya") requireField("lpk.origin_other", values.lpk.origin_other);

  validateEducation(values, errors, requireField);
  validateWork(values, errors, requireField);
  validateFamily(values, errors, requireField);
  documentItems.forEach((item) => {
    const path = `documents.items.${item}` as FormPath;
    requireField(path, values.documents.items[item]);
  });

  return errors;
}

function validateEducation(values: CandidateFormValues, errors: FormErrors, requireField: (path: FormPath, value: unknown, message?: string) => void) {
  const education = values.education;
  const requiredPaths: Array<[FormPath, string]> = [
    ["education.elementary_school_name", education.elementary_school_name],
    ["education.elementary_start_date", education.elementary_start_date],
    ["education.elementary_end_date", education.elementary_end_date],
    ["education.junior_high_school_name", education.junior_high_school_name],
    ["education.junior_high_start_date", education.junior_high_start_date],
    ["education.junior_high_end_date", education.junior_high_end_date],
    ["education.senior_high_school_name", education.senior_high_school_name],
    ["education.senior_high_start_date", education.senior_high_start_date],
    ["education.senior_high_end_date", education.senior_high_end_date],
    ["education.senior_high_type", education.senior_high_type],
    ["education.senior_high_major", education.senior_high_major]
  ];
  requiredPaths.forEach(([path, value]) => requireField(path, value));
  if (education.senior_high_type === "Lainnya") requireField("education.senior_high_type_other", education.senior_high_type_other);
  if (education.senior_high_major === "Lainnya") requireField("education.senior_high_major_other", education.senior_high_major_other);

  const universityRequired = education.university === "Ya" || isDegreeLevel(education.highest_level);
  if (universityRequired) {
    requireField("education.university", education.university);
    requireField("education.university_name", education.university_name);
    requireField("education.university_start_date", education.university_start_date);
    requireField("education.university_end_date", education.university_end_date);
    requireField("education.degree_level", education.degree_level);
    requireField("education.university_major", education.university_major);
    if (education.degree_level === "Lainnya") requireField("education.degree_level_other", education.degree_level_other);
    if (education.university_major === "Lainnya") requireField("education.university_major_other", education.university_major_other);
  }

  validateDatePair("education.elementary_start_date", education.elementary_start_date, "education.elementary_end_date", education.elementary_end_date, errors);
  validateDatePair("education.junior_high_start_date", education.junior_high_start_date, "education.junior_high_end_date", education.junior_high_end_date, errors);
  validateDatePair("education.senior_high_start_date", education.senior_high_start_date, "education.senior_high_end_date", education.senior_high_end_date, errors);
  validateDatePair("education.university_start_date", education.university_start_date, "education.university_end_date", education.university_end_date, errors);
  validateChronologicalDates(
    [
      ["education.elementary_start_date", education.elementary_start_date],
      ["education.elementary_end_date", education.elementary_end_date],
      ["education.junior_high_start_date", education.junior_high_start_date],
      ["education.junior_high_end_date", education.junior_high_end_date],
      ["education.senior_high_start_date", education.senior_high_start_date],
      ["education.senior_high_end_date", education.senior_high_end_date],
      ["education.university_start_date", education.university_start_date],
      ["education.university_end_date", education.university_end_date]
    ],
    errors
  );
}

function validateWork(values: CandidateFormValues, errors: FormErrors, requireField: (path: FormPath, value: unknown, message?: string) => void) {
  if (values.work.has_experience !== "Ya") return;
  validateJobRow("work.latest", values.work.latest, errors, requireField, true);
  validateJobRow("work.previous1", values.work.previous1, errors, requireField, isJobActive(values.work.previous1));
  validateJobRow("work.previous2", values.work.previous2, errors, requireField, isJobActive(values.work.previous2));

  const ranges = [
    ["work.latest.start_date", values.work.latest.start_date, values.work.latest.end_date],
    ["work.previous1.start_date", values.work.previous1.start_date, values.work.previous1.end_date],
    ["work.previous2.start_date", values.work.previous2.start_date, values.work.previous2.end_date]
  ].filter(([, start, end]) => start && end);

  for (let i = 0; i < ranges.length; i += 1) {
    for (let j = i + 1; j < ranges.length; j += 1) {
      if (dateRangesOverlap(ranges[i][1], ranges[i][2], ranges[j][1], ranges[j][2])) {
        errors[ranges[j][0]] = "Rentang kerja tidak boleh tumpang tindih";
      }
    }
  }
}

function validateJobRow(prefix: "work.latest" | "work.previous1" | "work.previous2", row: JobRow, errors: FormErrors, requireField: (path: FormPath, value: unknown, message?: string) => void, required: boolean) {
  if (!required) return;
  requireField(`${prefix}.title` as FormPath, row.title);
  requireField(`${prefix}.company` as FormPath, row.company);
  requireField(`${prefix}.role` as FormPath, row.role);
  requireField(`${prefix}.start_date` as FormPath, row.start_date);
  requireField(`${prefix}.end_date` as FormPath, row.end_date);
  if (row.role === "Lainnya") requireField(`${prefix}.role_other` as FormPath, row.role_other);
  validateDatePair(`${prefix}.start_date` as FormPath, row.start_date, `${prefix}.end_date` as FormPath, row.end_date, errors);
}

function validateFamily(values: CandidateFormValues, errors: FormErrors, requireField: (path: FormPath, value: unknown, message?: string) => void) {
  values.family.members.forEach((member, index) => {
    if (!isFamilyActive(member)) return;
    requireField(`family.members.${index}.name` as FormPath, member.name);
    requireField(`family.members.${index}.birth_date` as FormPath, member.birth_date);
    requireField(`family.members.${index}.relation` as FormPath, member.relation);
    requireField(`family.members.${index}.occupation` as FormPath, member.occupation);
    if (member.relation === "Lainnya") requireField(`family.members.${index}.relation_other` as FormPath, member.relation_other);
    if (member.occupation === "Lainnya") requireField(`family.members.${index}.occupation_other` as FormPath, member.occupation_other);
  });
}

function toStructuredFormValues(candidate: Candidate): CandidateFormValues {
  const extra = candidate.additionalFields ?? {};

  return {
    identity: {
      submitted_at: extra.submitted_at ?? "",
      email: candidate.email,
      full_name_romaji: extra.full_name_romaji ?? candidate.name.toUpperCase(),
      full_name_katakana: extra.full_name_katakana ?? "",
      nickname: extra.nickname ?? "",
      phone_number: candidate.phone,
      profile_photo: extra.profile_photo ?? "",
      birth_date: candidate.birthDate,
      birth_place: extra.birth_place ?? "",
      gender: candidate.gender
    },
    address: {
      street: extra.address_street ?? candidate.address,
      village: extra.address_village ?? "",
      city: extra.address_city ?? candidate.city,
      province: extra.address_province ?? "",
      postal_code: extra.address_postal_code ?? "",
      country: extra.address_country ?? "Indonesia"
    },
    personal: {
      height_cm: String(candidate.height || ""),
      weight_kg: String(candidate.weight || ""),
      blood_type: extra.blood_type ?? "",
      marital_status: extra.marital_status ?? "",
      religion: extra.religion ?? "",
      passport_status: extra.passport_status ?? "",
      medical_history: candidate.medicalHistory,
      wears_glasses: extra.wears_glasses ?? "",
      medical_checkup_file: extra.medical_checkup_file ?? ""
    },
    education: {
      highest_level: extra.education_highest_level ?? candidate.education,
      elementary_school_name: extra.elementary_school_name ?? "",
      elementary_start_date: extra.elementary_start_date ?? "",
      elementary_end_date: extra.elementary_end_date ?? "",
      junior_high_school_name: extra.junior_high_school_name ?? "",
      junior_high_start_date: extra.junior_high_start_date ?? "",
      junior_high_end_date: extra.junior_high_end_date ?? "",
      senior_high_school_name: extra.senior_high_school_name ?? "",
      senior_high_start_date: extra.senior_high_start_date ?? "",
      senior_high_end_date: extra.senior_high_end_date ?? "",
      senior_high_type: extra.senior_high_type ?? "",
      senior_high_type_other: extra.senior_high_type_other ?? "",
      senior_high_major: extra.senior_high_major ?? "",
      senior_high_major_other: extra.senior_high_major_other ?? "",
      university: extra.university ?? "Tidak",
      university_name: extra.university_name ?? "",
      university_start_date: extra.university_start_date ?? "",
      university_end_date: extra.university_end_date ?? "",
      degree_level: extra.degree_level ?? "",
      degree_level_other: extra.degree_level_other ?? "",
      university_major: extra.university_major ?? "",
      university_major_other: extra.university_major_other ?? ""
    },
    work: {
      has_experience: extra.work_has_experience ?? (candidate.experience ? "Ya" : "Tidak"),
      latest: readJob(extra, "job1", candidate.experience),
      previous1: readJob(extra, "job2", ""),
      previous2: readJob(extra, "job3", "")
    },
    family: {
      notes: extra.family_notes ?? candidate.family,
      members: Array.from({ length: 6 }, (_, index) => readFamilyMember(extra, index + 1))
    },
    lifestyle: {
      drinks_alcohol: extra.drinks_alcohol ?? "",
      smokes: extra.smokes ?? "",
      has_tattoo: extra.has_tattoo ?? ""
    },
    lpk: {
      origin: extra.lpk_origin ?? "",
      origin_other: extra.lpk_origin_other ?? "",
      japanese_study_hours: extra.japanese_study_hours ?? ""
    },
    documents: {
      items: documentItems.reduce((acc, item) => {
        acc[item] = extra[`document_${item}`] ?? "";
        return acc;
      }, {} as Record<(typeof documentItems)[number], string>),
      physical_test_video: extra.physical_test_video ?? "",
      additional_files: parseList(extra.additional_files)
    }
  };
}

function mapToCandidatePatch(candidate: Candidate, values: CandidateFormValues, profileStatus: ProfileStatus): Partial<Candidate> {
  const additionalFields = flattenAdditionalFields(values);
  const fullName = toUpperValue(values.identity.full_name_romaji || candidate.name);
  const address = [values.address.street, values.address.village, values.address.city, values.address.province, values.address.postal_code, values.address.country].filter(Boolean).join(", ");
  const experience = deriveWorkSummary(values.work);
  const family = deriveFamilySummary(values.family);
  const habits = [
    `Alkohol: ${values.lifestyle.drinks_alcohol || "-"}`,
    `Merokok: ${values.lifestyle.smokes || "-"}`,
    `Tato: ${values.lifestyle.has_tattoo || "-"}`
  ];
  const completeness = profileStatus === "complete" ? 100 : calculateCompletion(buildSectionStats(values));

  return {
    name: fullName,
    birthDate: values.identity.birth_date,
    gender: values.identity.gender === "Perempuan" ? "Perempuan" : "Laki-laki",
    height: Number(values.personal.height_cm) || candidate.height,
    weight: Number(values.personal.weight_kg) || candidate.weight,
    address,
    city: values.address.city,
    education: values.education.highest_level,
    experience,
    family,
    habits,
    medicalHistory: values.personal.medical_history,
    phone: normalizePhone(values.identity.phone_number),
    email: values.identity.email.trim().toLowerCase(),
    additionalFields,
    profileStatus,
    completeness,
    cvStatus: "stale"
  };
}

function mapToBackendCandidatePayload(values: CandidateFormValues, profileStatus: ProfileStatus): Record<string, unknown> {
  const flat = flattenAdditionalFields(values);
  const fullName = toUpperValue(values.identity.full_name_romaji);
  const habits = [
    `Alkohol: ${values.lifestyle.drinks_alcohol || "-"}`,
    `Merokok: ${values.lifestyle.smokes || "-"}`,
    `Tato: ${values.lifestyle.has_tattoo || "-"}`
  ];

  return {
    email: values.identity.email.trim().toLowerCase(),
    phoneNumber: normalizePhone(values.identity.phone_number),
    submittedAt: values.identity.submitted_at || null,
    fullNameRomaji: fullName,
    fullNameKatakana: values.identity.full_name_katakana,
    nickname: toUpperValue(values.identity.nickname),
    profilePhoto: values.identity.profile_photo,
    birthDate: values.identity.birth_date,
    birthPlace: values.identity.birth_place,
    gender: values.identity.gender,
    age: values.identity.birth_date ? calculateAge(values.identity.birth_date) : null,
    addressStreet: values.address.street,
    addressVillage: values.address.village,
    addressCity: values.address.city,
    addressProvince: values.address.province,
    addressPostalCode: values.address.postal_code,
    addressCountry: values.address.country || "Indonesia",
    heightCm: values.personal.height_cm,
    weightKg: values.personal.weight_kg,
    bloodType: values.personal.blood_type,
    maritalStatus: values.personal.marital_status,
    religion: values.personal.religion,
    passportStatus: values.personal.passport_status,
    medicalHistory: values.personal.medical_history,
    wearsGlasses: yesNoToBoolean(values.personal.wears_glasses),
    medicalCheckupFile: values.personal.medical_checkup_file,
    education: values.education.highest_level,
    elementarySchool: true,
    elementarySchoolName: values.education.elementary_school_name,
    elementaryStartDate: values.education.elementary_start_date,
    elementaryEndDate: values.education.elementary_end_date,
    juniorHighSchool: true,
    juniorHighSchoolName: values.education.junior_high_school_name,
    juniorHighStartDate: values.education.junior_high_start_date,
    juniorHighEndDate: values.education.junior_high_end_date,
    seniorHighSchool: true,
    seniorHighSchoolName: values.education.senior_high_school_name,
    seniorHighStartDate: values.education.senior_high_start_date,
    seniorHighEndDate: values.education.senior_high_end_date,
    seniorHighType: values.education.senior_high_type,
    seniorHighTypeOther: values.education.senior_high_type_other,
    seniorHighMajor: values.education.senior_high_major,
    seniorHighMajorOther: values.education.senior_high_major_other,
    university: values.education.university === "Ya",
    universityName: values.education.university_name,
    universityStartDate: values.education.university_start_date,
    universityEndDate: values.education.university_end_date,
    degreeLevel: values.education.degree_level,
    degreeLevelOther: values.education.degree_level_other,
    universityMajor: values.education.university_major,
    universityMajorOther: values.education.university_major_other,
    workExperience: deriveWorkSummary(values.work),
    hasWorkExperience: values.work.has_experience === "Ya",
    latestJob: values.work.latest.title,
    companyNameLatest: values.work.latest.company,
    job1StartDate: values.work.latest.start_date,
    job1EndDate: values.work.latest.end_date,
    job1Role: values.work.latest.role,
    job1RoleOther: values.work.latest.role_other,
    previousJob1: values.work.previous1.title,
    companyName1: values.work.previous1.company,
    job2StartDate: values.work.previous1.start_date,
    job2EndDate: values.work.previous1.end_date,
    job2Role: values.work.previous1.role,
    job2RoleOther: values.work.previous1.role_other,
    previousJob2: values.work.previous2.title,
    companyName2: values.work.previous2.company,
    job3StartDate: values.work.previous2.start_date,
    job3EndDate: values.work.previous2.end_date,
    job3Role: values.work.previous2.role,
    job3RoleOther: values.work.previous2.role_other,
    familyInformation: deriveFamilySummary(values.family),
    lifestyle: deriveLifestyleSummary(values.lifestyle),
    drinksAlcohol: yesNoToBoolean(values.lifestyle.drinks_alcohol),
    smokes: yesNoToBoolean(values.lifestyle.smokes),
    hasTattoo: yesNoToBoolean(values.lifestyle.has_tattoo),
    lpkInformation: values.lpk.origin === "Lainnya" ? values.lpk.origin_other : values.lpk.origin,
    lpkOrigin: values.lpk.origin,
    lpkOriginOther: values.lpk.origin_other,
    japaneseStudyHours: values.lpk.japanese_study_hours,
    documentKtp: values.documents.items.KTP,
    documentKk: values.documents.items.KK,
    documentIjazah: values.documents.items.Ijazah,
    documentPaspor: values.documents.items.Paspor,
    documentMedicalCheckup: values.documents.items["Medical Checkup"],
    documentFotoProfil: values.documents.items["Foto Profil"],
    physicalTestVideo: values.documents.physical_test_video,
    additionalFiles: values.documents.additional_files,
    skills: [],
    habits,
    profileStatus,
    completeness: profileStatus === "complete" ? 100 : calculateCompletion(buildSectionStats(values)),
    cvStatus: "stale",
    ...familyPayload(values.family.members),
    additionalFields: flat
  };
}

function withCreateFallbacks(payload: Record<string, unknown>, candidate: Candidate) {
  const stamp = Date.now();
  const email = String(payload.email ?? "").trim();
  const fullName = String(payload.fullNameRomaji ?? "").trim();
  const phone = String(payload.phoneNumber ?? "").trim();
  return {
    ...payload,
    email: email || `candidate-${stamp}@draft.local`,
    phoneNumber: phone || `08${String(stamp).slice(-10)}`,
    fullNameRomaji: fullName || `KANDIDAT BARU ${String(stamp).slice(-4)}`,
    birthDate: payload.birthDate || candidate.birthDate || "2000-01-01",
    gender: payload.gender || candidate.gender || "Laki-laki",
    addressStreet: payload.addressStreet || candidate.address || "-",
    addressCity: payload.addressCity || candidate.city || "-",
    heightCm: payload.heightCm || candidate.height || 160,
    weightKg: payload.weightKg || candidate.weight || 55,
    education: payload.education || candidate.education || "-",
    profileStatus: payload.profileStatus || "draft",
    cvStatus: "pending"
  };
}

function flattenAdditionalFields(values: CandidateFormValues) {
  const flat: Record<string, string> = {
    submitted_at: values.identity.submitted_at,
    full_name_romaji: values.identity.full_name_romaji,
    full_name_katakana: values.identity.full_name_katakana,
    nickname: values.identity.nickname,
    phone_number: normalizePhone(values.identity.phone_number),
    profile_photo: values.identity.profile_photo,
    birth_place: values.identity.birth_place,
    age: values.identity.birth_date ? String(calculateAge(values.identity.birth_date)) : "",
    address_street: values.address.street,
    address_village: values.address.village,
    address_city: values.address.city,
    address_province: values.address.province,
    address_postal_code: values.address.postal_code,
    address_country: values.address.country,
    height_cm: values.personal.height_cm,
    weight_kg: values.personal.weight_kg,
    blood_type: values.personal.blood_type,
    marital_status: values.personal.marital_status,
    religion: values.personal.religion,
    passport_status: values.personal.passport_status,
    wears_glasses: values.personal.wears_glasses,
    medical_checkup_file: values.personal.medical_checkup_file,
    education_highest_level: values.education.highest_level,
    elementary_school_name: values.education.elementary_school_name,
    elementary_start_date: values.education.elementary_start_date,
    elementary_end_date: values.education.elementary_end_date,
    junior_high_school_name: values.education.junior_high_school_name,
    junior_high_start_date: values.education.junior_high_start_date,
    junior_high_end_date: values.education.junior_high_end_date,
    senior_high_school_name: values.education.senior_high_school_name,
    senior_high_start_date: values.education.senior_high_start_date,
    senior_high_end_date: values.education.senior_high_end_date,
    senior_high_type: values.education.senior_high_type,
    senior_high_type_other: values.education.senior_high_type_other,
    senior_high_major: values.education.senior_high_major,
    senior_high_major_other: values.education.senior_high_major_other,
    university: values.education.university,
    university_name: values.education.university_name,
    university_start_date: values.education.university_start_date,
    university_end_date: values.education.university_end_date,
    degree_level: values.education.degree_level,
    degree_level_other: values.education.degree_level_other,
    university_major: values.education.university_major,
    university_major_other: values.education.university_major_other,
    work_has_experience: values.work.has_experience,
    family_notes: values.family.notes,
    drinks_alcohol: values.lifestyle.drinks_alcohol,
    smokes: values.lifestyle.smokes,
    has_tattoo: values.lifestyle.has_tattoo,
    lifestyle: deriveLifestyleSummary(values.lifestyle),
    lpk_origin: values.lpk.origin,
    lpk_origin_other: values.lpk.origin_other,
    lpk_information: values.lpk.origin === "Lainnya" ? values.lpk.origin_other : values.lpk.origin,
    japanese_study_hours: values.lpk.japanese_study_hours,
    physical_test_video: values.documents.physical_test_video,
    additional_files: values.documents.additional_files.join("|"),
    work_experience: deriveWorkSummary(values.work),
    family_information: deriveFamilySummary(values.family)
  };

  writeJob(flat, "job1", values.work.latest);
  writeJob(flat, "job2", values.work.previous1);
  writeJob(flat, "job3", values.work.previous2);
  values.family.members.forEach((member, index) => writeFamilyMember(flat, index + 1, member));
  documentItems.forEach((item) => {
    flat[`document_${item}`] = values.documents.items[item];
  });
  return flat;
}

function familyPayload(members: FamilyMember[]) {
  const payload: Record<string, unknown> = {};
  members.forEach((member, index) => {
    const number = index + 1;
    payload[`family${number}Name`] = member.name;
    payload[`family${number}BirthDate`] = member.birth_date;
    payload[`family${number}Age`] = member.birth_date ? calculateAge(member.birth_date) : null;
    payload[`family${number}Relation`] = member.relation;
    payload[`family${number}RelationOther`] = member.relation_other;
    payload[`family${number}Occupation`] = member.occupation;
    payload[`family${number}OccupationOther`] = member.occupation_other;
  });
  return payload;
}

function buildSectionStats(values: CandidateFormValues) {
  return {
    identity: countFilled([
      values.identity.full_name_romaji,
      values.identity.full_name_katakana,
      values.identity.nickname,
      values.identity.email,
      values.identity.phone_number,
      values.identity.profile_photo,
      values.identity.birth_date,
      values.identity.birth_place,
      values.identity.gender,
      values.address.street,
      values.address.city,
      values.address.province
    ]),
    personal: countFilled([
      values.personal.height_cm,
      values.personal.weight_kg,
      values.personal.blood_type,
      values.personal.marital_status,
      values.personal.religion,
      values.personal.passport_status,
      values.personal.medical_history,
      values.personal.wears_glasses,
      values.personal.medical_checkup_file
    ]),
    education: countFilled([
      values.education.highest_level,
      values.education.elementary_school_name,
      values.education.elementary_start_date,
      values.education.elementary_end_date,
      values.education.junior_high_school_name,
      values.education.junior_high_start_date,
      values.education.junior_high_end_date,
      values.education.senior_high_school_name,
      values.education.senior_high_type,
      values.education.senior_high_major,
      values.education.senior_high_start_date,
      values.education.senior_high_end_date
    ]),
    work: countFilled([
      values.work.has_experience,
      values.work.latest.title,
      values.work.latest.company,
      values.work.latest.role,
      values.work.latest.start_date,
      values.work.latest.end_date
    ]),
    family: countFilled([
      values.family.notes,
      ...values.family.members.flatMap((member) => [member.name, member.birth_date, member.relation, member.occupation])
    ]),
    lpk: countFilled([
      values.lifestyle.drinks_alcohol,
      values.lifestyle.smokes,
      values.lifestyle.has_tattoo,
      values.lpk.origin,
      values.lpk.japanese_study_hours
    ]),
    documents: countFilled([
      ...documentItems.map((item) => values.documents.items[item]),
      values.documents.physical_test_video,
      values.documents.additional_files.join("|")
    ])
  };
}

function countFilled(values: unknown[]) {
  return {
    complete: values.filter(hasValue).length,
    total: values.length
  };
}

function calculateCompletion(stats: ReturnType<typeof buildSectionStats>) {
  const totals = Object.values(stats).reduce((acc, stat) => ({
    complete: acc.complete + stat.complete,
    total: acc.total + stat.total
  }), { complete: 0, total: 0 });
  return totals.total ? Math.round((totals.complete / totals.total) * 100) : 0;
}

function sectionTitle(key: string) {
  const labels: Record<string, string> = {
    identity: "Identitas",
    personal: "Data pribadi",
    education: "Pendidikan",
    work: "Kerja",
    family: "Keluarga",
    lpk: "Lifestyle & LPK",
    documents: "Dokumen"
  };
  return labels[key] ?? key;
}

function readJob(extra: Record<string, string>, prefix: "job1" | "job2" | "job3", fallbackTitle: string): JobRow {
  return {
    title: extra[`${prefix}_title`] ?? extra[prefix === "job1" ? "latest_job" : prefix === "job2" ? "previous_job_1" : "previous_job_2"] ?? fallbackTitle,
    company: extra[`${prefix}_company`] ?? extra[prefix === "job1" ? "company_name_latest" : prefix === "job2" ? "company_name_1" : "company_name_2"] ?? "",
    start_date: extra[`${prefix}_start_date`] ?? "",
    end_date: extra[`${prefix}_end_date`] ?? "",
    role: extra[`${prefix}_role`] ?? "",
    role_other: extra[`${prefix}_role_other`] ?? ""
  };
}

function writeJob(flat: Record<string, string>, prefix: "job1" | "job2" | "job3", row: JobRow) {
  flat[`${prefix}_title`] = row.title;
  flat[`${prefix}_company`] = row.company;
  flat[`${prefix}_start_date`] = row.start_date;
  flat[`${prefix}_end_date`] = row.end_date;
  flat[`${prefix}_role`] = row.role;
  flat[`${prefix}_role_other`] = row.role_other;
  if (prefix === "job1") {
    flat.latest_job = row.title;
    flat.company_name_latest = row.company;
  }
  if (prefix === "job2") {
    flat.previous_job_1 = row.title;
    flat.company_name_1 = row.company;
  }
  if (prefix === "job3") {
    flat.previous_job_2 = row.title;
    flat.company_name_2 = row.company;
  }
}

function readFamilyMember(extra: Record<string, string>, number: number): FamilyMember {
  return {
    name: extra[`family${number}_name`] ?? "",
    birth_date: extra[`family${number}_birth_date`] ?? "",
    relation: extra[`family${number}_relation`] ?? "",
    relation_other: extra[`family${number}_relation_other`] ?? "",
    occupation: extra[`family${number}_occupation`] ?? "",
    occupation_other: extra[`family${number}_occupation_other`] ?? ""
  };
}

function writeFamilyMember(flat: Record<string, string>, number: number, member: FamilyMember) {
  flat[`family${number}_name`] = member.name;
  flat[`family${number}_birth_date`] = member.birth_date;
  flat[`family${number}_age`] = member.birth_date ? String(calculateAge(member.birth_date)) : "";
  flat[`family${number}_relation`] = member.relation;
  flat[`family${number}_relation_other`] = member.relation_other;
  flat[`family${number}_occupation`] = member.occupation;
  flat[`family${number}_occupation_other`] = member.occupation_other;
}

function deriveWorkSummary(work: CandidateFormValues["work"]) {
  if (work.has_experience !== "Ya") return "Belum pernah bekerja";
  return [work.latest, work.previous1, work.previous2]
    .filter(isJobActive)
    .map((job) => `${job.title || "-"} di ${job.company || "-"}`)
    .join("; ");
}

function deriveFamilySummary(family: CandidateFormValues["family"]) {
  const rows = family.members
    .filter(isFamilyActive)
    .map((member) => `${member.name || "-"} (${member.relation === "Lainnya" ? member.relation_other : member.relation || "-"})`);
  return [family.notes, ...rows].filter(Boolean).join("; ");
}

function deriveLifestyleSummary(lifestyle: CandidateFormValues["lifestyle"]) {
  return `Alkohol: ${lifestyle.drinks_alcohol || "-"}, Merokok: ${lifestyle.smokes || "-"}, Tato: ${lifestyle.has_tattoo || "-"}`;
}

function isJobActive(row: JobRow) {
  return [row.title, row.company, row.start_date, row.end_date, row.role, row.role_other].some(Boolean);
}

function isFamilyActive(member: FamilyMember) {
  return [member.name, member.birth_date, member.relation, member.relation_other, member.occupation, member.occupation_other].some(Boolean);
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function toUpperValue(value: string) {
  return value.toLocaleUpperCase("id-ID");
}

function calculateAge(dateValue: string) {
  const birth = new Date(dateValue);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.max(0, age);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDuplicateEmail(email: string, candidate: Candidate, candidates: Candidate[]) {
  const normalized = email.trim().toLowerCase();
  return Boolean(normalized && candidates.some((item) => item.id !== candidate.id && item.email.trim().toLowerCase() === normalized));
}

function isKatakana(value: string) {
  return /^[\u30A0-\u30FF\sー]+$/.test(value.trim());
}

function normalizePhone(value: string) {
  return value.replace(/[\s-]/g, "");
}

function yesNoToBoolean(value: string) {
  if (!value) return null;
  return value === "Ya";
}

function isIndonesianMobile(value: string) {
  const normalized = normalizePhone(value);
  return /^(08\d{8,12}|\+628\d{7,12}|628\d{7,12})$/.test(normalized);
}

function numberInRange(value: string, min: number, max: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function isDegreeLevel(value: string) {
  return ["D1", "D2", "D3", "D4", "S1", "S2", "S3"].includes(value);
}

function validateDatePair(startPath: FormPath, start: string, endPath: FormPath, end: string, errors: FormErrors) {
  if (start && end && new Date(end) < new Date(start)) {
    errors[endPath] = "Tanggal selesai harus setelah tanggal mulai";
    if (!errors[startPath]) errors[startPath] = "Periksa urutan tanggal";
  }
}

function validateChronologicalDates(entries: Array<[FormPath, string]>, errors: FormErrors) {
  const filled = entries.filter(([, value]) => value);
  for (let index = 1; index < filled.length; index += 1) {
    const previous = new Date(filled[index - 1][1]);
    const current = new Date(filled[index][1]);
    if (current < previous) {
      errors[filled[index][0]] = "Tanggal pendidikan harus kronologis";
    }
  }
}

function dateRangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  return aStart <= bEnd && bStart <= aEnd;
}

function parseList(value?: string) {
  return value ? value.split("|").filter(Boolean) : [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function emptyCandidate(id: number): Candidate {
  const now = new Date().toISOString();
  return {
    id,
    name: "",
    birthDate: "",
    gender: "Laki-laki",
    height: 0,
    weight: 0,
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
