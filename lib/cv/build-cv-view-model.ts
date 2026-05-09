import type { Candidate, Gender, TestResult } from "@prisma/client";

export type CandidateCvViewModel = {
  identity: {
    full_name_romaji: string;
    full_name_katakana: string;
    photo_url: string;
    address: string;
    address_ja: string;
    birth_date: string;
    birth_date_ja: string;
    age: string;
    birth_place: string;
    birth_place_ja: string;
    gender: string;
    gender_ja: string;
    height_cm: string;
    weight_kg: string;
    blood_type: string;
    marital_status: string;
    marital_status_ja: string;
    passport_status: string;
    passport_status_ja: string;
    religion: string;
    religion_ja: string;
  };
  educationRows: Array<{
    period: string;
    school_name: string;
    school_name_ja: string;
    school_level: string;
    school_level_ja: string;
    major: string;
    major_ja: string;
  }>;
  workRows: Array<{
    period: string;
    company_name: string;
    company_name_ja: string;
    job_role: string;
    job_role_ja: string;
  }>;
  familyRows: Array<{
    relation: string;
    relation_ja: string;
    name: string;
    age: string;
    occupation: string;
    occupation_ja: string;
  }>;
  notes: {
    medical_history: string;
    medical_history_ja: string;
    special_notes: string;
    special_notes_ja: string;
  };
  habits: {
    drinks_alcohol: string;
    smokes: string;
    wears_glasses: string;
    has_tattoo: string;
  };
  scores: {
    reasoning_score: string;
    figure_score: string;
    calculation_score: string;
    unit_score: string;
    total_score: string;
    japanese_basic_score: string;
    japanese_study_hours: string;
  };
};

export function buildCandidateCvViewModel(candidate: Candidate, latestTestResult?: TestResult | null): CandidateCvViewModel {
  return {
    identity: {
      full_name_romaji: text(candidate.fullNameRomaji),
      full_name_katakana: text(candidate.fullNameKatakana),
      photo_url: text(candidate.profilePhoto),
      address: formatAddress(candidate),
      address_ja: "",
      birth_date: formatDate(candidate.birthDate),
      birth_date_ja: formatJapaneseDate(candidate.birthDate, true),
      age: text(candidate.age ?? calculateAge(candidate.birthDate)),
      birth_place: text(candidate.birthPlace),
      birth_place_ja: "",
      gender: formatGender(candidate.gender),
      gender_ja: "",
      height_cm: text(candidate.heightCm),
      weight_kg: text(candidate.weightKg),
      blood_type: text(candidate.bloodType),
      marital_status: text(candidate.maritalStatus),
      marital_status_ja: "",
      passport_status: text(candidate.passportStatus),
      passport_status_ja: "",
      religion: text(candidate.religion),
      religion_ja: ""
    },
    educationRows: buildEducationRows(candidate),
    workRows: buildWorkRows(candidate),
    familyRows: buildFamilyRows(candidate),
    notes: {
      medical_history: text(candidate.medicalHistory),
      medical_history_ja: "",
      special_notes: text(candidate.lifestyle || candidate.familyInformation || candidate.lpkInformation),
      special_notes_ja: ""
    },
    habits: {
      drinks_alcohol: yesNo(candidate.drinksAlcohol),
      smokes: yesNo(candidate.smokes),
      wears_glasses: yesNo(candidate.wearsGlasses),
      has_tattoo: yesNo(candidate.hasTattoo)
    },
    scores: {
      reasoning_score: "",
      figure_score: "",
      calculation_score: "",
      unit_score: "",
      total_score: score(latestTestResult?.totalScore, 100),
      japanese_basic_score: "",
      japanese_study_hours: text(candidate.japaneseStudyHours)
    }
  };
}

function buildEducationRows(candidate: Candidate): CandidateCvViewModel["educationRows"] {
  return [
    {
      period: formatPeriod(candidate.elementaryStartDate, candidate.elementaryEndDate),
      school_name: text(candidate.elementarySchoolName),
      school_name_ja: "",
      school_level: "SD",
      school_level_ja: "",
      major: "",
      major_ja: ""
    },
    {
      period: formatPeriod(candidate.juniorHighStartDate, candidate.juniorHighEndDate),
      school_name: text(candidate.juniorHighSchoolName),
      school_name_ja: "",
      school_level: "SMP",
      school_level_ja: "",
      major: "",
      major_ja: ""
    },
    {
      period: formatPeriod(candidate.seniorHighStartDate, candidate.seniorHighEndDate),
      school_name: text(candidate.seniorHighSchoolName),
      school_name_ja: "",
      school_level: text(candidate.seniorHighTypeOther || candidate.seniorHighType || "SMA/SMK"),
      school_level_ja: "",
      major: text(candidate.seniorHighMajorOther || candidate.seniorHighMajor),
      major_ja: ""
    },
    {
      period: formatPeriod(candidate.universityStartDate, candidate.universityEndDate),
      school_name: text(candidate.universityName),
      school_name_ja: "",
      school_level: text(candidate.degreeLevelOther || candidate.degreeLevel || "Universitas"),
      school_level_ja: "",
      major: text(candidate.universityMajorOther || candidate.universityMajor),
      major_ja: ""
    }
  ].filter(hasEducationData);
}

function buildWorkRows(candidate: Candidate): CandidateCvViewModel["workRows"] {
  return [
    {
      period: formatPeriod(candidate.job1StartDate, candidate.job1EndDate),
      company_name: text(candidate.companyNameLatest),
      company_name_ja: "",
      job_role: text(candidate.job1RoleOther || candidate.job1Role || candidate.latestJob),
      job_role_ja: ""
    },
    {
      period: formatPeriod(candidate.job2StartDate, candidate.job2EndDate),
      company_name: text(candidate.companyName1),
      company_name_ja: "",
      job_role: text(candidate.job2RoleOther || candidate.job2Role || candidate.previousJob1),
      job_role_ja: ""
    },
    {
      period: formatPeriod(candidate.job3StartDate, candidate.job3EndDate),
      company_name: text(candidate.companyName2),
      company_name_ja: "",
      job_role: text(candidate.job3RoleOther || candidate.job3Role || candidate.previousJob2),
      job_role_ja: ""
    }
  ].filter((row) => Object.values(row).some(Boolean));
}

function buildFamilyRows(candidate: Candidate): CandidateCvViewModel["familyRows"] {
  const rows: CandidateCvViewModel["familyRows"] = [];

  for (const index of [1, 2, 3, 4, 5, 6] as const) {
    const row = {
      relation: text(candidate[`family${index}RelationOther`] || candidate[`family${index}Relation`]),
      relation_ja: "",
      name: text(candidate[`family${index}Name`]),
      age: text(candidate[`family${index}Age`]),
      occupation: text(candidate[`family${index}OccupationOther`] || candidate[`family${index}Occupation`]),
      occupation_ja: ""
    };
    if (Object.values(row).some(Boolean)) rows.push(row);
  }

  return rows;
}

function hasEducationData(row: CandidateCvViewModel["educationRows"][number]) {
  return Boolean(row.period || row.school_name || row.major);
}

function formatAddress(candidate: Candidate) {
  return [
    candidate.addressStreet,
    candidate.addressVillage,
    candidate.addressCity,
    candidate.addressProvince,
    candidate.addressPostalCode,
    candidate.addressCountry
  ].map(text).filter(Boolean).join(", ");
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "";
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatPeriod(start?: Date | string | null, end?: Date | string | null) {
  const startDate = formatJapaneseDate(start);
  const endDate = formatJapaneseDate(end);
  if (!startDate && !endDate) return "";
  return `${startDate} ~ ${endDate}`.trim();
}

function formatJapaneseDate(value?: Date | string | null, includeDay = false) {
  const date = parseDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  if (!includeDay) return `${year} 年 ${month} 月`;
  const day = String(date.getDate()).padStart(2, "0");
  return `${year} 年 ${month} 月 ${day} 日`;
}

function calculateAge(value?: Date | string | null) {
  const birthDate = parseDate(value);
  if (!birthDate) return "";
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

function parseDate(value?: Date | string | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatGender(value: Gender) {
  return value === "PEREMPUAN" ? "Perempuan" : "Laki-laki";
}

function yesNo(value?: boolean | null) {
  if (value === null || value === undefined) return "";
  return value ? "Ya" : "Tidak";
}

function score(value: unknown, max: number) {
  const normalized = text(value);
  return normalized ? `${normalized} /${max}` : "";
}

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}
