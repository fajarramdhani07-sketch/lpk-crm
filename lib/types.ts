export type UserRole = "candidate" | "admin" | "superadmin";

export type ProfileStatus = "draft" | "incomplete" | "complete" | "archived";
export type CvStatus = "pending" | "processing" | "done" | "failed" | "stale";
export type FileType = "photo" | "document" | "video" | "cv";
export type CandidateAdditionalFields = Record<string, string>;

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  candidateId?: number;
}

export interface Candidate {
  id: number;
  name: string;
  birthDate: string;
  gender: "Laki-laki" | "Perempuan";
  height: number;
  weight: number;
  address: string;
  city: string;
  education: string;
  experience: string;
  family: string;
  habits: string[];
  skills: string[];
  medicalHistory: string;
  phone: string;
  email: string;
  additionalFields?: CandidateAdditionalFields;
  profileStatus: ProfileStatus;
  cvStatus: CvStatus;
  completeness: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TestResult {
  id: number;
  candidateId: number;
  totalScore: number;
  attemptNumber: number;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CvJob {
  id: number;
  candidateId: number;
  status: CvStatus;
  retryCount: number;
  outputLanguage: "id" | "ja";
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateFile {
  id: number;
  candidateId: number;
  type: FileType;
  name: string;
  url: string;
  cvJobId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType: "candidate" | "test_result" | "cv_job" | "file";
  entityId: number;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string;
  createdAt: string;
}

export interface CandidateFilters {
  query: string;
  profileStatus: "all" | ProfileStatus;
  cvStatus: "all" | CvStatus;
  minScore: number;
  education: "all" | string;
  habit: "all" | string;
}
