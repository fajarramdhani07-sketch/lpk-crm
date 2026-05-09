-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('DRAFT', 'INCOMPLETE', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CvStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED', 'STALE');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PHOTO', 'DOCUMENT', 'VIDEO', 'CV');

-- CreateEnum
CREATE TYPE "CvLanguage" AS ENUM ('ID', 'JA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE',
    "candidateId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "fullNameRomaji" TEXT NOT NULL,
    "fullNameKatakana" TEXT,
    "nickname" TEXT,
    "profilePhoto" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT,
    "gender" "Gender" NOT NULL,
    "age" INTEGER,
    "addressStreet" TEXT NOT NULL,
    "addressVillage" TEXT,
    "addressCity" TEXT NOT NULL,
    "addressProvince" TEXT,
    "addressPostalCode" TEXT,
    "addressCountry" TEXT NOT NULL DEFAULT 'Indonesia',
    "heightCm" INTEGER NOT NULL,
    "weightKg" INTEGER NOT NULL,
    "bloodType" TEXT,
    "maritalStatus" TEXT,
    "religion" TEXT,
    "passportStatus" TEXT,
    "medicalHistory" TEXT,
    "wearsGlasses" BOOLEAN,
    "medicalCheckupFile" TEXT,
    "education" TEXT NOT NULL,
    "elementarySchool" BOOLEAN NOT NULL DEFAULT true,
    "elementarySchoolName" TEXT,
    "elementaryStartDate" TIMESTAMP(3),
    "elementaryEndDate" TIMESTAMP(3),
    "juniorHighSchool" BOOLEAN NOT NULL DEFAULT true,
    "juniorHighSchoolName" TEXT,
    "juniorHighStartDate" TIMESTAMP(3),
    "juniorHighEndDate" TIMESTAMP(3),
    "seniorHighSchool" BOOLEAN NOT NULL DEFAULT true,
    "seniorHighSchoolName" TEXT,
    "seniorHighStartDate" TIMESTAMP(3),
    "seniorHighEndDate" TIMESTAMP(3),
    "seniorHighType" TEXT,
    "seniorHighTypeOther" TEXT,
    "seniorHighMajor" TEXT,
    "seniorHighMajorOther" TEXT,
    "university" BOOLEAN NOT NULL DEFAULT false,
    "universityName" TEXT,
    "universityStartDate" TIMESTAMP(3),
    "universityEndDate" TIMESTAMP(3),
    "degreeLevel" TEXT,
    "degreeLevelOther" TEXT,
    "universityMajor" TEXT,
    "universityMajorOther" TEXT,
    "workExperience" TEXT,
    "hasWorkExperience" BOOLEAN NOT NULL DEFAULT false,
    "latestJob" TEXT,
    "companyNameLatest" TEXT,
    "job1StartDate" TIMESTAMP(3),
    "job1EndDate" TIMESTAMP(3),
    "job1Role" TEXT,
    "job1RoleOther" TEXT,
    "previousJob1" TEXT,
    "companyName1" TEXT,
    "job2StartDate" TIMESTAMP(3),
    "job2EndDate" TIMESTAMP(3),
    "job2Role" TEXT,
    "job2RoleOther" TEXT,
    "previousJob2" TEXT,
    "companyName2" TEXT,
    "job3StartDate" TIMESTAMP(3),
    "job3EndDate" TIMESTAMP(3),
    "job3Role" TEXT,
    "job3RoleOther" TEXT,
    "familyInformation" TEXT,
    "family1Name" TEXT,
    "family1BirthDate" TIMESTAMP(3),
    "family1Age" INTEGER,
    "family1Relation" TEXT,
    "family1RelationOther" TEXT,
    "family1Occupation" TEXT,
    "family1OccupationOther" TEXT,
    "family2Name" TEXT,
    "family2BirthDate" TIMESTAMP(3),
    "family2Age" INTEGER,
    "family2Relation" TEXT,
    "family2RelationOther" TEXT,
    "family2Occupation" TEXT,
    "family2OccupationOther" TEXT,
    "family3Name" TEXT,
    "family3BirthDate" TIMESTAMP(3),
    "family3Age" INTEGER,
    "family3Relation" TEXT,
    "family3RelationOther" TEXT,
    "family3Occupation" TEXT,
    "family3OccupationOther" TEXT,
    "family4Name" TEXT,
    "family4BirthDate" TIMESTAMP(3),
    "family4Age" INTEGER,
    "family4Relation" TEXT,
    "family4RelationOther" TEXT,
    "family4Occupation" TEXT,
    "family4OccupationOther" TEXT,
    "family5Name" TEXT,
    "family5BirthDate" TIMESTAMP(3),
    "family5Age" INTEGER,
    "family5Relation" TEXT,
    "family5RelationOther" TEXT,
    "family5Occupation" TEXT,
    "family5OccupationOther" TEXT,
    "family6Name" TEXT,
    "family6BirthDate" TIMESTAMP(3),
    "family6Age" INTEGER,
    "family6Relation" TEXT,
    "family6RelationOther" TEXT,
    "family6Occupation" TEXT,
    "family6OccupationOther" TEXT,
    "lifestyle" TEXT,
    "drinksAlcohol" BOOLEAN,
    "smokes" BOOLEAN,
    "hasTattoo" BOOLEAN,
    "lpkInformation" TEXT,
    "lpkOrigin" TEXT,
    "lpkOriginOther" TEXT,
    "japaneseStudyHours" INTEGER,
    "documentKtp" TEXT,
    "documentKk" TEXT,
    "documentIjazah" TEXT,
    "documentPaspor" TEXT,
    "documentMedicalCheckup" TEXT,
    "documentFotoProfil" TEXT,
    "physicalTestVideo" TEXT,
    "additionalFiles" TEXT[],
    "skills" TEXT[],
    "habits" TEXT[],
    "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "cvStatus" "CvStatus" NOT NULL DEFAULT 'PENDING',
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "isLatest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvJob" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "status" "CvStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "outputLanguage" "CvLanguage" NOT NULL,
    "fileUrl" TEXT,
    "storageKey" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CvJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateFile" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "type" "FileType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "cvJobId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CandidateFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_candidateId_key" ON "User"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_heightCm_weightKg_birthDate_idx" ON "Candidate"("heightCm", "weightKg", "birthDate");

-- CreateIndex
CREATE INDEX "Candidate_profileStatus_idx" ON "Candidate"("profileStatus");

-- CreateIndex
CREATE INDEX "Candidate_cvStatus_idx" ON "Candidate"("cvStatus");

-- CreateIndex
CREATE INDEX "Candidate_deletedAt_idx" ON "Candidate"("deletedAt");

-- CreateIndex
CREATE INDEX "TestResult_candidateId_idx" ON "TestResult"("candidateId");

-- CreateIndex
CREATE INDEX "TestResult_totalScore_idx" ON "TestResult"("totalScore");

-- CreateIndex
CREATE INDEX "TestResult_isLatest_idx" ON "TestResult"("isLatest");

-- CreateIndex
CREATE INDEX "CvJob_candidateId_idx" ON "CvJob"("candidateId");

-- CreateIndex
CREATE INDEX "CvJob_status_idx" ON "CvJob"("status");

-- CreateIndex
CREATE INDEX "CandidateFile_candidateId_idx" ON "CandidateFile"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateFile_type_idx" ON "CandidateFile"("type");

-- CreateIndex
CREATE INDEX "CandidateFile_deletedAt_idx" ON "CandidateFile"("deletedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvJob" ADD CONSTRAINT "CvJob_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateFile" ADD CONSTRAINT "CandidateFile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateFile" ADD CONSTRAINT "CandidateFile_cvJobId_fkey" FOREIGN KEY ("cvJobId") REFERENCES "CvJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
