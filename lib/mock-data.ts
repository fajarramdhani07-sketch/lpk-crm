import type { AuditLog, Candidate, CandidateFile, CvJob, TestResult, User } from "@/lib/types";

export const users: User[] = [
  { id: 1, email: "admin@lpk.local", name: "Maya Admin", role: "admin" },
  { id: 2, email: "superadmin@lpk.local", name: "Raka Superadmin", role: "superadmin" },
  { id: 3, email: "candidate@lpk.local", name: "Andi Saputra", role: "candidate", candidateId: 101 }
];

export const candidates: Candidate[] = [
  {
    id: 101,
    name: "Andi Saputra",
    birthDate: "2001-05-14",
    gender: "Laki-laki",
    height: 171,
    weight: 64,
    address: "Jl. Melati No. 14",
    city: "Bandung",
    education: "SMK Teknik Mesin",
    experience: "Operator produksi 2 tahun",
    family: "Anak pertama dari 3 bersaudara",
    habits: ["Tidak merokok", "Olahraga"],
    skills: ["Bahasa Jepang N4", "Las dasar", "Microsoft Excel"],
    medicalHistory: "Tidak ada riwayat penyakit berat",
    phone: "0812-1100-2200",
    email: "andi.saputra@mail.local",
    profileStatus: "complete",
    cvStatus: "done",
    completeness: 100,
    createdAt: "2026-03-10T09:00:00.000Z",
    updatedAt: "2026-04-21T08:30:00.000Z"
  },
  {
    id: 102,
    name: "Siti Nurhaliza",
    birthDate: "2002-02-08",
    gender: "Perempuan",
    height: 160,
    weight: 51,
    address: "Jl. Veteran No. 8",
    city: "Semarang",
    education: "SMA IPA",
    experience: "Magang caregiver 6 bulan",
    family: "Tinggal dengan orang tua",
    habits: ["Tidak merokok"],
    skills: ["Bahasa Jepang N5", "Perawatan lansia"],
    medicalHistory: "Alergi debu ringan",
    phone: "0857-7788-1122",
    email: "siti.n@mail.local",
    profileStatus: "complete",
    cvStatus: "stale",
    completeness: 92,
    createdAt: "2026-03-18T03:10:00.000Z",
    updatedAt: "2026-04-24T10:05:00.000Z"
  },
  {
    id: 103,
    name: "Bima Prasetyo",
    birthDate: "2000-11-27",
    gender: "Laki-laki",
    height: 176,
    weight: 72,
    address: "Jl. Pahlawan No. 21",
    city: "Yogyakarta",
    education: "D3 Teknik Elektro",
    experience: "Teknisi maintenance 1 tahun",
    family: "Anak kedua",
    habits: ["Merokok", "Kopi"],
    skills: ["PLC dasar", "Bahasa Jepang N5"],
    medicalHistory: "Pernah cedera lutut, sudah pulih",
    phone: "0821-2244-5566",
    email: "bima.p@mail.local",
    profileStatus: "incomplete",
    cvStatus: "pending",
    completeness: 76,
    createdAt: "2026-04-02T05:15:00.000Z",
    updatedAt: "2026-04-19T12:00:00.000Z"
  },
  {
    id: 104,
    name: "Dewi Lestari",
    birthDate: "2003-07-03",
    gender: "Perempuan",
    height: 158,
    weight: 49,
    address: "Jl. Kenanga No. 3",
    city: "Malang",
    education: "SMK Perhotelan",
    experience: "Housekeeping hotel 1 tahun",
    family: "Anak tunggal",
    habits: ["Tidak merokok", "Disiplin olahraga"],
    skills: ["Bahasa Jepang N4", "Hospitality"],
    medicalHistory: "Tidak ada",
    phone: "0896-3333-4444",
    email: "dewi.l@mail.local",
    profileStatus: "draft",
    cvStatus: "failed",
    completeness: 61,
    createdAt: "2026-04-11T06:35:00.000Z",
    updatedAt: "2026-04-23T04:40:00.000Z"
  }
];

export const testResults: TestResult[] = [
  { id: 1, candidateId: 101, totalScore: 86, attemptNumber: 1, isLatest: false, createdAt: "2026-03-12T02:00:00.000Z", updatedAt: "2026-03-12T02:00:00.000Z" },
  { id: 2, candidateId: 101, totalScore: 91, attemptNumber: 2, isLatest: true, createdAt: "2026-04-15T02:00:00.000Z", updatedAt: "2026-04-15T02:00:00.000Z" },
  { id: 3, candidateId: 102, totalScore: 84, attemptNumber: 1, isLatest: true, createdAt: "2026-04-07T02:00:00.000Z", updatedAt: "2026-04-07T02:00:00.000Z" },
  { id: 4, candidateId: 103, totalScore: 72, attemptNumber: 1, isLatest: true, createdAt: "2026-04-12T02:00:00.000Z", updatedAt: "2026-04-12T02:00:00.000Z" },
  { id: 5, candidateId: 104, totalScore: 79, attemptNumber: 1, isLatest: true, createdAt: "2026-04-20T02:00:00.000Z", updatedAt: "2026-04-20T02:00:00.000Z" }
];

export const cvJobs: CvJob[] = [
  { id: 201, candidateId: 101, status: "done", retryCount: 0, outputLanguage: "id", fileUrl: "#cv-id-andi", createdAt: "2026-04-16T02:00:00.000Z", updatedAt: "2026-04-16T02:04:00.000Z" },
  { id: 202, candidateId: 101, status: "done", retryCount: 0, outputLanguage: "ja", fileUrl: "#cv-ja-andi", createdAt: "2026-04-16T02:00:00.000Z", updatedAt: "2026-04-16T02:05:00.000Z" },
  { id: 203, candidateId: 102, status: "stale", retryCount: 0, outputLanguage: "id", fileUrl: "#cv-id-siti", createdAt: "2026-04-08T02:00:00.000Z", updatedAt: "2026-04-24T10:05:00.000Z" },
  { id: 204, candidateId: 104, status: "failed", retryCount: 2, outputLanguage: "ja", createdAt: "2026-04-22T02:00:00.000Z", updatedAt: "2026-04-22T02:10:00.000Z" }
];

export const files: CandidateFile[] = [
  { id: 301, candidateId: 101, type: "photo", name: "Foto Andi.jpg", url: "#photo-andi", createdAt: "2026-03-11T02:00:00.000Z", updatedAt: "2026-03-11T02:00:00.000Z" },
  { id: 302, candidateId: 101, type: "cv", name: "CV Andi Bahasa Indonesia.pdf", url: "#cv-id-andi", cvJobId: 201, createdAt: "2026-04-16T02:04:00.000Z", updatedAt: "2026-04-16T02:04:00.000Z" },
  { id: 303, candidateId: 102, type: "document", name: "Ijazah Siti.pdf", url: "#document-siti", createdAt: "2026-04-04T02:00:00.000Z", updatedAt: "2026-04-04T02:00:00.000Z" },
  { id: 304, candidateId: 103, type: "video", name: "Perkenalan Bima.mp4", url: "#video-bima", createdAt: "2026-04-14T02:00:00.000Z", updatedAt: "2026-04-14T02:00:00.000Z" }
];

export const auditLogs: AuditLog[] = [
  { id: 401, userId: 1, action: "generate_cv", entityType: "cv_job", entityId: 201, oldValue: { status: "processing" }, newValue: { status: "done" }, ipAddress: "10.10.0.12", createdAt: "2026-04-16T02:04:00.000Z" },
  { id: 402, userId: 3, action: "update_candidate", entityType: "candidate", entityId: 102, oldValue: { experience: "Magang 3 bulan" }, newValue: { experience: "Magang caregiver 6 bulan" }, ipAddress: "10.10.0.31", createdAt: "2026-04-24T10:05:00.000Z" },
  { id: 403, userId: 1, action: "upload_file", entityType: "file", entityId: 303, oldValue: null, newValue: { name: "Ijazah Siti.pdf" }, ipAddress: "10.10.0.12", createdAt: "2026-04-04T02:00:00.000Z" },
  { id: 404, userId: 2, action: "override_status", entityType: "candidate", entityId: 104, oldValue: { profileStatus: "incomplete" }, newValue: { profileStatus: "draft" }, ipAddress: "10.10.0.5", createdAt: "2026-04-23T04:40:00.000Z" }
];
