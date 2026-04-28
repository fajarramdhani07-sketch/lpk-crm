import type { AuditLog, Candidate, CandidateFile, CvJob, CvStatus, FileType, ProfileStatus, TestResult, UserRole } from "@/lib/types";

type ApiEnvelope<T> = { data: T };

type BackendUser = {
  id: string;
  email: string;
  name: string;
  role?: "CANDIDATE" | "ADMIN" | "SUPERADMIN" | UserRole;
  candidateId?: number | null;
};

export type BackendSession = {
  user: BackendUser;
  session?: unknown;
};

export type BackendCandidate = Record<string, unknown> & {
  id: number;
  email: string;
  phoneNumber: string;
  fullNameRomaji: string;
  birthDate: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  addressStreet: string;
  addressCity: string;
  heightCm: number;
  weightKg: number;
  education: string;
  profileStatus: string;
  cvStatus: string;
  completeness: number;
  createdAt: string;
  updatedAt: string;
  testResults?: BackendTestResult[];
  files?: BackendCandidateFile[];
};

export type BackendTestResult = Record<string, unknown> & {
  id: number;
  candidateId: number;
  totalScore: number;
  attemptNumber: number;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BackendCandidateFile = Record<string, unknown> & {
  id: number;
  candidateId: number;
  type: string;
  name: string;
  url: string;
  cvJobId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BackendCvJob = Record<string, unknown> & {
  id: number;
  candidateId: number;
  status: string;
  retryCount: number;
  outputLanguage: string;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackendAuditLog = Record<string, unknown> & {
  id: number;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
};

async function apiFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? "Request failed");
  }

  return response.json() as Promise<ApiEnvelope<T>>;
}

async function authFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? body.error ?? "Auth request failed");
  }

  return response.json() as Promise<T>;
}

export const backendService = {
  async getSession() {
    const session = await authFetch<BackendSession | null>("/api/auth/get-session");
    return session;
  },
  signInEmail(email: string, password: string) {
    return authFetch<unknown>("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  signOut() {
    return authFetch<unknown>("/api/auth/sign-out", {
      method: "POST",
      body: JSON.stringify({})
    });
  },
  async listCandidates() {
    const response = await apiFetch<BackendCandidate[]>("/api/candidates");
    return {
      data: response.data.map(mapCandidate),
      raw: response.data
    };
  },
  async getCandidate(id: number) {
    const response = await apiFetch<BackendCandidate>(`/api/candidates/${id}`);
    return {
      data: mapCandidate(response.data),
      raw: response.data
    };
  },
  async updateCandidate(id: number, data: Record<string, unknown>) {
    const response = await apiFetch<BackendCandidate>(`/api/candidates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    return {
      data: mapCandidate(response.data),
      raw: response.data
    };
  },
  async createTestResult(candidateId: number, totalScore: number) {
    const response = await apiFetch<BackendTestResult>(`/api/candidates/${candidateId}/test-results`, {
      method: "POST",
      body: JSON.stringify({ totalScore })
    });
    return { data: mapTestResult(response.data), raw: response.data };
  },
  async listFiles(candidateId: number) {
    const response = await apiFetch<BackendCandidateFile[]>(`/api/candidates/${candidateId}/files`);
    return { data: response.data.map(mapFile), raw: response.data };
  },
  async addFile(candidateId: number, data: { type: string; name: string; url?: string }) {
    const response = await apiFetch<BackendCandidateFile>(`/api/candidates/${candidateId}/files`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    return { data: mapFile(response.data), raw: response.data };
  },
  async createCvJobs(candidateId: number, languages = ["ID", "JA"]) {
    const response = await apiFetch<BackendCvJob[]>(`/api/candidates/${candidateId}/cv-jobs`, {
      method: "POST",
      body: JSON.stringify({ languages })
    });
    return { data: response.data.map(mapCvJob), raw: response.data };
  },
  async updateCvJob(id: number, data: { status?: string; fileUrl?: string }) {
    const response = await apiFetch<BackendCvJob>(`/api/cv-jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    return { data: mapCvJob(response.data), raw: response.data };
  },
  async listAuditLogs(entityId?: number) {
    const path = entityId ? `/api/audit-logs?entityType=candidate&entityId=${entityId}` : "/api/audit-logs";
    const response = await apiFetch<BackendAuditLog[]>(path);
    return { data: response.data.map(mapAuditLog), raw: response.data };
  }
};

export function mapRole(role?: BackendUser["role"]): UserRole {
  const normalized = String(role ?? "CANDIDATE").toLowerCase();
  if (normalized === "superadmin") return "superadmin";
  if (normalized === "admin") return "admin";
  return "candidate";
}

export function mapCandidate(candidate: BackendCandidate): Candidate {
  const additionalFields = buildAdditionalFields(candidate);
  return {
    id: candidate.id,
    name: String(candidate.fullNameRomaji ?? ""),
    birthDate: dateOnly(candidate.birthDate),
    gender: candidate.gender === "PEREMPUAN" ? "Perempuan" : "Laki-laki",
    height: Number(candidate.heightCm ?? 0),
    weight: Number(candidate.weightKg ?? 0),
    address: String(candidate.addressStreet ?? ""),
    city: String(candidate.addressCity ?? ""),
    education: String(candidate.education ?? ""),
    experience: String(candidate.workExperience ?? candidate.latestJob ?? ""),
    family: String(candidate.familyInformation ?? ""),
    habits: stringArray(candidate.habits),
    skills: stringArray(candidate.skills),
    medicalHistory: String(candidate.medicalHistory ?? ""),
    phone: String(candidate.phoneNumber ?? ""),
    email: String(candidate.email ?? ""),
    additionalFields,
    profileStatus: lowerStatus(candidate.profileStatus, "draft") as ProfileStatus,
    cvStatus: lowerStatus(candidate.cvStatus, "pending") as CvStatus,
    completeness: Number(candidate.completeness ?? 0),
    createdAt: String(candidate.createdAt ?? ""),
    updatedAt: String(candidate.updatedAt ?? ""),
    deletedAt: candidate.deletedAt ? String(candidate.deletedAt) : undefined
  };
}

export function mapTestResult(test: BackendTestResult): TestResult {
  return {
    id: test.id,
    candidateId: test.candidateId,
    totalScore: test.totalScore,
    attemptNumber: test.attemptNumber,
    isLatest: test.isLatest,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt
  };
}

export function mapFile(file: BackendCandidateFile): CandidateFile {
  return {
    id: file.id,
    candidateId: file.candidateId,
    type: lowerStatus(file.type, "document") as FileType,
    name: file.name,
    url: file.url,
    cvJobId: file.cvJobId ?? undefined,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt
  };
}

export function mapCvJob(job: BackendCvJob): CvJob {
  return {
    id: job.id,
    candidateId: job.candidateId,
    status: lowerStatus(job.status, "pending") as CvStatus,
    retryCount: job.retryCount,
    outputLanguage: String(job.outputLanguage ?? "ID").toLowerCase() === "ja" ? "ja" : "id",
    fileUrl: job.fileUrl ?? undefined,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };
}

export function mapAuditLog(log: BackendAuditLog): AuditLog {
  return {
    id: log.id,
    userId: Number(log.userId ?? 0),
    action: log.action,
    entityType: normalizeEntityType(log.entityType),
    entityId: Number(log.entityId ?? 0),
    oldValue: log.oldValue ?? null,
    newValue: log.newValue ?? null,
    ipAddress: log.ipAddress ?? "-",
    createdAt: log.createdAt
  };
}

function buildAdditionalFields(candidate: BackendCandidate) {
  const flat: Record<string, string> = {
    submitted_at: dateOnly(candidate.submittedAt),
    full_name_romaji: String(candidate.fullNameRomaji ?? ""),
    full_name_katakana: String(candidate.fullNameKatakana ?? ""),
    nickname: String(candidate.nickname ?? ""),
    phone_number: String(candidate.phoneNumber ?? ""),
    profile_photo: String(candidate.profilePhoto ?? ""),
    birth_place: String(candidate.birthPlace ?? ""),
    age: nullableString(candidate.age),
    address_street: String(candidate.addressStreet ?? ""),
    address_village: String(candidate.addressVillage ?? ""),
    address_city: String(candidate.addressCity ?? ""),
    address_province: String(candidate.addressProvince ?? ""),
    address_postal_code: String(candidate.addressPostalCode ?? ""),
    address_country: String(candidate.addressCountry ?? "Indonesia"),
    height_cm: nullableString(candidate.heightCm),
    weight_kg: nullableString(candidate.weightKg),
    blood_type: String(candidate.bloodType ?? ""),
    marital_status: String(candidate.maritalStatus ?? ""),
    religion: String(candidate.religion ?? ""),
    passport_status: String(candidate.passportStatus ?? ""),
    wears_glasses: yesNo(candidate.wearsGlasses),
    medical_checkup_file: String(candidate.medicalCheckupFile ?? ""),
    education_highest_level: String(candidate.education ?? ""),
    elementary_school_name: String(candidate.elementarySchoolName ?? ""),
    elementary_start_date: dateOnly(candidate.elementaryStartDate),
    elementary_end_date: dateOnly(candidate.elementaryEndDate),
    junior_high_school_name: String(candidate.juniorHighSchoolName ?? ""),
    junior_high_start_date: dateOnly(candidate.juniorHighStartDate),
    junior_high_end_date: dateOnly(candidate.juniorHighEndDate),
    senior_high_school_name: String(candidate.seniorHighSchoolName ?? ""),
    senior_high_start_date: dateOnly(candidate.seniorHighStartDate),
    senior_high_end_date: dateOnly(candidate.seniorHighEndDate),
    senior_high_type: String(candidate.seniorHighType ?? ""),
    senior_high_type_other: String(candidate.seniorHighTypeOther ?? ""),
    senior_high_major: String(candidate.seniorHighMajor ?? ""),
    senior_high_major_other: String(candidate.seniorHighMajorOther ?? ""),
    university: yesNo(candidate.university),
    university_name: String(candidate.universityName ?? ""),
    university_start_date: dateOnly(candidate.universityStartDate),
    university_end_date: dateOnly(candidate.universityEndDate),
    degree_level: String(candidate.degreeLevel ?? ""),
    degree_level_other: String(candidate.degreeLevelOther ?? ""),
    university_major: String(candidate.universityMajor ?? ""),
    university_major_other: String(candidate.universityMajorOther ?? ""),
    work_has_experience: yesNo(candidate.hasWorkExperience),
    family_notes: String(candidate.familyInformation ?? ""),
    drinks_alcohol: yesNo(candidate.drinksAlcohol),
    smokes: yesNo(candidate.smokes),
    has_tattoo: yesNo(candidate.hasTattoo),
    lifestyle: String(candidate.lifestyle ?? ""),
    lpk_origin: String(candidate.lpkOrigin ?? ""),
    lpk_origin_other: String(candidate.lpkOriginOther ?? ""),
    lpk_information: String(candidate.lpkInformation ?? ""),
    japanese_study_hours: nullableString(candidate.japaneseStudyHours),
    physical_test_video: String(candidate.physicalTestVideo ?? ""),
    additional_files: stringArray(candidate.additionalFiles).join("|"),
    work_experience: String(candidate.workExperience ?? ""),
    family_information: String(candidate.familyInformation ?? ""),
    document_KTP: String(candidate.documentKtp ?? ""),
    document_KK: String(candidate.documentKk ?? ""),
    document_Ijazah: String(candidate.documentIjazah ?? ""),
    document_Paspor: String(candidate.documentPaspor ?? ""),
    "document_Medical Checkup": String(candidate.documentMedicalCheckup ?? ""),
    "document_Foto Profil": String(candidate.documentFotoProfil ?? "")
  };

  writeJobFields(flat, "job1", candidate.latestJob, candidate.companyNameLatest, candidate.job1StartDate, candidate.job1EndDate, candidate.job1Role, candidate.job1RoleOther);
  writeJobFields(flat, "job2", candidate.previousJob1, candidate.companyName1, candidate.job2StartDate, candidate.job2EndDate, candidate.job2Role, candidate.job2RoleOther);
  writeJobFields(flat, "job3", candidate.previousJob2, candidate.companyName2, candidate.job3StartDate, candidate.job3EndDate, candidate.job3Role, candidate.job3RoleOther);

  for (let index = 1; index <= 6; index += 1) {
    flat[`family${index}_name`] = String(candidate[`family${index}Name`] ?? "");
    flat[`family${index}_birth_date`] = dateOnly(candidate[`family${index}BirthDate`]);
    flat[`family${index}_age`] = nullableString(candidate[`family${index}Age`]);
    flat[`family${index}_relation`] = String(candidate[`family${index}Relation`] ?? "");
    flat[`family${index}_relation_other`] = String(candidate[`family${index}RelationOther`] ?? "");
    flat[`family${index}_occupation`] = String(candidate[`family${index}Occupation`] ?? "");
    flat[`family${index}_occupation_other`] = String(candidate[`family${index}OccupationOther`] ?? "");
  }

  return flat;
}

function writeJobFields(
  flat: Record<string, string>,
  prefix: "job1" | "job2" | "job3",
  title: unknown,
  company: unknown,
  startDate: unknown,
  endDate: unknown,
  role: unknown,
  roleOther: unknown
) {
  flat[`${prefix}_title`] = String(title ?? "");
  flat[`${prefix}_company`] = String(company ?? "");
  flat[`${prefix}_start_date`] = dateOnly(startDate);
  flat[`${prefix}_end_date`] = dateOnly(endDate);
  flat[`${prefix}_role`] = String(role ?? "");
  flat[`${prefix}_role_other`] = String(roleOther ?? "");
  if (prefix === "job1") {
    flat.latest_job = flat[`${prefix}_title`];
    flat.company_name_latest = flat[`${prefix}_company`];
  }
  if (prefix === "job2") {
    flat.previous_job_1 = flat[`${prefix}_title`];
    flat.company_name_1 = flat[`${prefix}_company`];
  }
  if (prefix === "job3") {
    flat.previous_job_2 = flat[`${prefix}_title`];
    flat.company_name_2 = flat[`${prefix}_company`];
  }
}

function lowerStatus(value: unknown, fallback: string) {
  const normalized = String(value ?? fallback).toLowerCase();
  return normalized || fallback;
}

function dateOnly(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function nullableString(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function yesNo(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  return value === true || value === "true" || value === "Ya" ? "Ya" : "Tidak";
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length) return value.split("|").filter(Boolean);
  return [];
}

function normalizeEntityType(value: string): AuditLog["entityType"] {
  if (value === "test_result" || value === "cv_job" || value === "file") return value;
  return "candidate";
}
