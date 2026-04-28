import { CvLanguage, CvStatus, FileType, Gender, Prisma, ProfileStatus } from "@prisma/client";

export const candidateWritableFields = [
  "email",
  "phoneNumber",
  "submittedAt",
  "fullNameRomaji",
  "fullNameKatakana",
  "nickname",
  "profilePhoto",
  "birthDate",
  "birthPlace",
  "gender",
  "age",
  "addressStreet",
  "addressVillage",
  "addressCity",
  "addressProvince",
  "addressPostalCode",
  "addressCountry",
  "heightCm",
  "weightKg",
  "bloodType",
  "maritalStatus",
  "religion",
  "passportStatus",
  "medicalHistory",
  "wearsGlasses",
  "medicalCheckupFile",
  "education",
  "elementarySchool",
  "elementarySchoolName",
  "elementaryStartDate",
  "elementaryEndDate",
  "juniorHighSchool",
  "juniorHighSchoolName",
  "juniorHighStartDate",
  "juniorHighEndDate",
  "seniorHighSchool",
  "seniorHighSchoolName",
  "seniorHighStartDate",
  "seniorHighEndDate",
  "seniorHighType",
  "seniorHighTypeOther",
  "seniorHighMajor",
  "seniorHighMajorOther",
  "university",
  "universityName",
  "universityStartDate",
  "universityEndDate",
  "degreeLevel",
  "degreeLevelOther",
  "universityMajor",
  "universityMajorOther",
  "workExperience",
  "hasWorkExperience",
  "latestJob",
  "companyNameLatest",
  "job1StartDate",
  "job1EndDate",
  "job1Role",
  "job1RoleOther",
  "previousJob1",
  "companyName1",
  "job2StartDate",
  "job2EndDate",
  "job2Role",
  "job2RoleOther",
  "previousJob2",
  "companyName2",
  "job3StartDate",
  "job3EndDate",
  "job3Role",
  "job3RoleOther",
  "familyInformation",
  "family1Name",
  "family1BirthDate",
  "family1Age",
  "family1Relation",
  "family1RelationOther",
  "family1Occupation",
  "family1OccupationOther",
  "family2Name",
  "family2BirthDate",
  "family2Age",
  "family2Relation",
  "family2RelationOther",
  "family2Occupation",
  "family2OccupationOther",
  "family3Name",
  "family3BirthDate",
  "family3Age",
  "family3Relation",
  "family3RelationOther",
  "family3Occupation",
  "family3OccupationOther",
  "family4Name",
  "family4BirthDate",
  "family4Age",
  "family4Relation",
  "family4RelationOther",
  "family4Occupation",
  "family4OccupationOther",
  "family5Name",
  "family5BirthDate",
  "family5Age",
  "family5Relation",
  "family5RelationOther",
  "family5Occupation",
  "family5OccupationOther",
  "family6Name",
  "family6BirthDate",
  "family6Age",
  "family6Relation",
  "family6RelationOther",
  "family6Occupation",
  "family6OccupationOther",
  "lifestyle",
  "drinksAlcohol",
  "smokes",
  "hasTattoo",
  "lpkInformation",
  "lpkOrigin",
  "lpkOriginOther",
  "japaneseStudyHours",
  "documentKtp",
  "documentKk",
  "documentIjazah",
  "documentPaspor",
  "documentMedicalCheckup",
  "documentFotoProfil",
  "physicalTestVideo",
  "additionalFiles",
  "skills",
  "habits",
  "profileStatus",
  "cvStatus",
  "completeness"
] as const;

const dateFields = new Set([
  "submittedAt",
  "birthDate",
  "elementaryStartDate",
  "elementaryEndDate",
  "juniorHighStartDate",
  "juniorHighEndDate",
  "seniorHighStartDate",
  "seniorHighEndDate",
  "universityStartDate",
  "universityEndDate",
  "job1StartDate",
  "job1EndDate",
  "job2StartDate",
  "job2EndDate",
  "job3StartDate",
  "job3EndDate",
  "family1BirthDate",
  "family2BirthDate",
  "family3BirthDate",
  "family4BirthDate",
  "family5BirthDate",
  "family6BirthDate"
]);

const intFields = new Set([
  "age",
  "heightCm",
  "weightKg",
  "family1Age",
  "family2Age",
  "family3Age",
  "family4Age",
  "family5Age",
  "family6Age",
  "japaneseStudyHours",
  "completeness"
]);

const booleanFields = new Set([
  "wearsGlasses",
  "elementarySchool",
  "juniorHighSchool",
  "seniorHighSchool",
  "university",
  "hasWorkExperience",
  "drinksAlcohol",
  "smokes",
  "hasTattoo"
]);

const arrayFields = new Set(["additionalFiles", "skills", "habits"]);

export function normalizeCandidateInput(input: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  for (const field of candidateWritableFields) {
    if (!(field in input)) continue;
    const value = input[field];
    if (value === "") {
      data[field] = null;
      continue;
    }
    if (dateFields.has(field)) {
      data[field] = value ? new Date(String(value)) : null;
      continue;
    }
    if (intFields.has(field)) {
      data[field] = value === null || value === undefined ? null : Number(value);
      continue;
    }
    if (booleanFields.has(field)) {
      data[field] = typeof value === "boolean" ? value : value === "true" || value === "Ya";
      continue;
    }
    if (arrayFields.has(field)) {
      data[field] = Array.isArray(value) ? value.map(String) : String(value ?? "").split("|").filter(Boolean);
      continue;
    }
    if (field === "gender") {
      data[field] = value === "Perempuan" || value === "PEREMPUAN" ? Gender.PEREMPUAN : Gender.LAKI_LAKI;
      continue;
    }
    if (field === "profileStatus") {
      data[field] = parseProfileStatus(value);
      continue;
    }
    if (field === "cvStatus") {
      data[field] = parseCvStatus(value);
      continue;
    }
    data[field] = value;
  }

  return data as Prisma.CandidateUncheckedCreateInput & Prisma.CandidateUncheckedUpdateInput;
}

export function parseCvStatus(value: unknown) {
  const normalized = String(value ?? "").toUpperCase();
  return Object.values(CvStatus).includes(normalized as CvStatus) ? normalized as CvStatus : CvStatus.PENDING;
}

export function parseProfileStatus(value: unknown) {
  const normalized = String(value ?? "").toUpperCase();
  return Object.values(ProfileStatus).includes(normalized as ProfileStatus) ? normalized as ProfileStatus : ProfileStatus.DRAFT;
}

export function parseFileType(value: unknown) {
  const normalized = String(value ?? "").toUpperCase();
  return Object.values(FileType).includes(normalized as FileType) ? normalized as FileType : FileType.DOCUMENT;
}

export function parseCvLanguage(value: unknown) {
  const normalized = String(value ?? "").toUpperCase();
  return Object.values(CvLanguage).includes(normalized as CvLanguage) ? normalized as CvLanguage : CvLanguage.ID;
}

export function publicCandidateSelect() {
  return {
    users: false
  };
}
