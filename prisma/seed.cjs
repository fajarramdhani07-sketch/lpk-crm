const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const password = "password123";
const baseCandidateId = 1001;
const candidateUserId = baseCandidateId;

const firstNamesMale = [
  "Andi", "Bima", "Cahyo", "Dimas", "Eko", "Fajar", "Gilang", "Hendra", "Iqbal", "Joko",
  "Kurnia", "Lukman", "Miko", "Nanda", "Oscar", "Prasetyo", "Rizky", "Surya", "Taufik", "Yoga"
];
const firstNamesFemale = [
  "Ayu", "Bella", "Citra", "Dewi", "Erika", "Fitri", "Gita", "Hana", "Indah", "Juwita",
  "Kartika", "Laras", "Maya", "Nadia", "Putri", "Rani", "Sari", "Tiara", "Utami", "Wulan"
];
const lastNames = [
  "Saputra", "Pratama", "Wijaya", "Lestari", "Santoso", "Nugroho", "Maulana", "Permadi", "Rahman", "Kusuma",
  "Hidayat", "Pangestu", "Ramadhan", "Siregar", "Setiawan", "Purnama", "Ananda", "Firmansyah", "Susanto", "Wibowo"
];
const cities = [
  ["Bandung", "Jawa Barat"], ["Semarang", "Jawa Tengah"], ["Yogyakarta", "DI Yogyakarta"], ["Malang", "Jawa Timur"],
  ["Surabaya", "Jawa Timur"], ["Denpasar", "Bali"], ["Makassar", "Sulawesi Selatan"], ["Medan", "Sumatera Utara"],
  ["Palembang", "Sumatera Selatan"], ["Mataram", "Nusa Tenggara Barat"], ["Pontianak", "Kalimantan Barat"], ["Manado", "Sulawesi Utara"]
];
const educationOptions = [
  ["SMA", "SMA", "IPA"], ["SMK", "SMK", "Teknik Mesin"], ["SMK", "SMK", "Teknik Kendaraan Ringan"],
  ["SMK", "SMK", "Keperawatan"], ["D3", "D3", "Perhotelan"], ["S1", "S1", "Manajemen"]
];
const jobs = [
  ["Operator Produksi", "PT Sinar Manufaktur"], ["Caregiver", "Klinik Sehat Sentosa"], ["Housekeeping", "Hotel Merdeka"],
  ["Teknisi Maintenance", "PT Karya Mesin"], ["Staf Gudang", "CV Logistik Prima"], ["Food Processing", "PT Pangan Nusantara"],
  ["Asisten Perawat", "RS Harapan"], ["Quality Control", "PT Komponen Jaya"]
];
const bloodTypes = ["A", "B", "AB", "O"];
const religions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha"];
const lpkOrigins = ["LPK Sakura", "LPK Nusantara", "LPK Fuji", "LPK Harapan Jepang", "LPK Shinsei"];

function pad(number, length = 3) {
  return String(number).padStart(length, "0");
}

function pick(list, index) {
  return list[index % list.length];
}

function yearsAgo(years, month, day) {
  return new Date(Date.UTC(2026 - years, month, day));
}

function monthDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

function makeName(index, gender, category) {
  if (category === "edge" && index === 0) {
    return "MUHAMMAD RIZKY PRATAMA NUGRAHA SAPUTRA WIJAYA";
  }
  const first = gender === "LAKI_LAKI" ? pick(firstNamesMale, index) : pick(firstNamesFemale, index);
  return `${first} ${pick(lastNames, index + 3)}`.toUpperCase();
}

function makeCandidate(index, category, overrides = {}) {
  const id = baseCandidateId + index;
  const gender = index % 2 === 0 ? "LAKI_LAKI" : "PEREMPUAN";
  const fullNameRomaji = makeName(index, gender, category);
  const [addressCity, addressProvince] = pick(cities, index);
  const [education, seniorHighType, seniorHighMajor] = pick(educationOptions, index);
  const [latestJob, companyNameLatest] = pick(jobs, index);
  const age = category === "edge" && index % 10 === 0 ? 18 : 21 + (index % 11);
  const complete = category !== "incomplete";
  const submittedAt = complete ? monthDate(2026, index % 5, 1 + (index % 24)) : null;
  const japaneseStudyHours = 120 + ((index * 37) % 520);
  const profileStatus = complete ? "COMPLETE" : "INCOMPLETE";
  const cvStatus = complete ? "PENDING" : (index % 3 === 0 ? "STALE" : "PENDING");
  const completeness = complete ? 100 : 35 + ((index * 7) % 45);

  return {
    id,
    email: `candidate.${pad(id)}@mail.local`,
    phoneNumber: `08${String(1200000000 + index * 7919).slice(0, 10)}`,
    submittedAt,
    fullNameRomaji,
    fullNameKatakana: "",
    nickname: fullNameRomaji.split(" ")[0],
    profilePhoto: null,
    birthDate: yearsAgo(age, index % 12, 1 + (index % 27)),
    birthPlace: addressCity,
    gender,
    age,
    addressStreet: `Jl. Sakura Raya No. ${12 + index}`,
    addressVillage: `Kelurahan ${pick(["Melati", "Kenanga", "Cempaka", "Anggrek", "Dahlia"], index)}`,
    addressCity,
    addressProvince,
    addressPostalCode: String(40000 + index * 17).slice(0, 5),
    addressCountry: "Indonesia",
    heightCm: gender === "LAKI_LAKI" ? 160 + (index % 24) : 148 + (index % 18),
    weightKg: gender === "LAKI_LAKI" ? 52 + (index % 31) : 43 + (index % 25),
    bloodType: pick(bloodTypes, index),
    maritalStatus: index % 13 === 0 ? "Menikah" : "Belum menikah",
    religion: pick(religions, index),
    passportStatus: complete ? pick(["Sudah ada", "Dalam proses"], index) : pick(["Belum ada", "Dalam proses"], index),
    medicalHistory: index % 9 === 0 ? "Alergi debu ringan, tidak mengganggu aktivitas harian" : "Tidak ada riwayat penyakit berat",
    wearsGlasses: index % 7 === 0,
    medicalCheckupFile: complete && index % 4 === 0 ? `#medical-checkup-${id}` : null,
    education,
    elementarySchool: true,
    elementarySchoolName: `SD Negeri ${pad((index % 80) + 1, 2)} ${addressCity}`,
    elementaryStartDate: monthDate(2006 + (index % 5), 6, 1),
    elementaryEndDate: monthDate(2012 + (index % 5), 5, 30),
    juniorHighSchool: true,
    juniorHighSchoolName: `SMP Negeri ${pad((index % 50) + 1, 2)} ${addressCity}`,
    juniorHighStartDate: monthDate(2012 + (index % 5), 6, 1),
    juniorHighEndDate: monthDate(2015 + (index % 5), 5, 30),
    seniorHighSchool: true,
    seniorHighSchoolName: `${seniorHighType} ${pick(["Bina Karya", "Harapan Bangsa", "Tunas Mandiri", "Nusantara"], index)} ${addressCity}`,
    seniorHighStartDate: monthDate(2015 + (index % 5), 6, 1),
    seniorHighEndDate: monthDate(2018 + (index % 5), 5, 30),
    seniorHighType,
    seniorHighTypeOther: null,
    seniorHighMajor,
    seniorHighMajorOther: null,
    university: education === "D3" || education === "S1",
    universityName: education === "D3" || education === "S1" ? `Politeknik ${addressCity}` : null,
    universityStartDate: education === "D3" || education === "S1" ? monthDate(2018 + (index % 4), 7, 1) : null,
    universityEndDate: education === "D3" || education === "S1" ? monthDate(2021 + (index % 4), 6, 30) : null,
    degreeLevel: education === "S1" ? "S1" : education === "D3" ? "D3" : null,
    degreeLevelOther: null,
    universityMajor: education === "S1" ? "Manajemen" : education === "D3" ? "Perhotelan" : null,
    universityMajorOther: null,
    workExperience: complete ? `${latestJob} selama ${1 + (index % 4)} tahun` : index % 2 === 0 ? `${latestJob} selama 6 bulan` : "",
    hasWorkExperience: complete || index % 2 === 0,
    latestJob: complete || index % 2 === 0 ? latestJob.toUpperCase() : null,
    companyNameLatest: complete || index % 2 === 0 ? companyNameLatest : null,
    job1StartDate: complete || index % 2 === 0 ? monthDate(2022, index % 12, 1) : null,
    job1EndDate: complete || index % 2 === 0 ? monthDate(2024, index % 12, 20) : null,
    job1Role: complete || index % 2 === 0 ? latestJob : null,
    job1RoleOther: null,
    previousJob1: index % 4 === 0 ? pick(jobs, index + 2)[0].toUpperCase() : null,
    companyName1: index % 4 === 0 ? pick(jobs, index + 2)[1] : null,
    job2StartDate: index % 4 === 0 ? monthDate(2020, index % 12, 1) : null,
    job2EndDate: index % 4 === 0 ? monthDate(2021, index % 12, 20) : null,
    job2Role: index % 4 === 0 ? pick(jobs, index + 2)[0] : null,
    job2RoleOther: null,
    previousJob2: null,
    companyName2: null,
    job3StartDate: null,
    job3EndDate: null,
    job3Role: null,
    job3RoleOther: null,
    familyInformation: complete ? "Data keluarga sudah diverifikasi oleh admin LPK" : "Data keluarga belum lengkap",
    family1Name: `BAPAK ${pick(lastNames, index).toUpperCase()}`,
    family1BirthDate: yearsAgo(50 + (index % 10), index % 12, 10),
    family1Age: 50 + (index % 10),
    family1Relation: "Ayah",
    family1RelationOther: null,
    family1Occupation: pick(["Wiraswasta", "Petani", "Karyawan", "Guru"], index),
    family1OccupationOther: null,
    family2Name: `IBU ${pick(lastNames, index + 1).toUpperCase()}`,
    family2BirthDate: yearsAgo(47 + (index % 9), index % 12, 12),
    family2Age: 47 + (index % 9),
    family2Relation: "Ibu",
    family2RelationOther: null,
    family2Occupation: pick(["Ibu rumah tangga", "Pedagang", "Karyawan", "Guru"], index),
    family2OccupationOther: null,
    lifestyle: `Alkohol: ${index % 23 === 0 ? "Ya" : "Tidak"}, Merokok: ${index % 6 === 0 ? "Ya" : "Tidak"}, Tato: ${index % 19 === 0 ? "Ya" : "Tidak"}`,
    drinksAlcohol: index % 23 === 0,
    smokes: index % 6 === 0,
    hasTattoo: index % 19 === 0,
    lpkInformation: `Kategori seed: ${category}`,
    lpkOrigin: pick(lpkOrigins, index),
    lpkOriginOther: null,
    japaneseStudyHours,
    documentKtp: null,
    documentKk: null,
    documentIjazah: null,
    documentPaspor: null,
    documentMedicalCheckup: null,
    documentFotoProfil: null,
    physicalTestVideo: null,
    additionalFiles: [],
    skills: [
      pick(["Bahasa Jepang N5", "Bahasa Jepang N4", "Kaigo dasar", "Las dasar", "Food processing", "Hospitality"], index),
      pick(["Disiplin kerja", "Microsoft Excel", "Komunikasi", "Keselamatan kerja"], index + 1)
    ],
    habits: [
      index % 6 === 0 ? "Merokok" : "Tidak merokok",
      pick(["Olahraga", "Membaca", "Menabung", "Belajar bahasa Jepang"], index)
    ],
    profileStatus,
    cvStatus,
    completeness,
    deletedAt: null,
    ...overrides
  };
}

function categoryForIndex(index) {
  if (index < 20) return "incomplete";
  if (index < 50) return "ready";
  if (index < 70) return "with_files";
  if (index < 80) return "dropout";
  if (index < 90) return "lolos";
  return "edge";
}

function candidateForIndex(index) {
  const category = categoryForIndex(index);
  const id = baseCandidateId + index;

  if (category === "ready") {
    return makeCandidate(index, category, {
      profileStatus: "COMPLETE",
      cvStatus: "PENDING",
      completeness: 100
    });
  }

  if (category === "with_files") {
    return makeCandidate(index, category, {
      profileStatus: "COMPLETE",
      cvStatus: index % 5 === 0 ? "STALE" : "PENDING",
      completeness: 90 + (index % 11),
      profilePhoto: `#photo-${id}`,
      documentKtp: `#ktp-${id}`,
      documentIjazah: `#ijazah-${id}`,
      documentPaspor: index % 2 === 0 ? `#paspor-${id}` : null,
      physicalTestVideo: index % 3 === 0 ? `#video-${id}` : null,
      additionalFiles: [`#additional-${id}-portfolio`]
    });
  }

  if (category === "dropout") {
    return makeCandidate(index, category, {
      submittedAt: monthDate(2026, 0, 1 + (index % 20)),
      profileStatus: "ARCHIVED",
      cvStatus: pick(["FAILED", "STALE", "PENDING"], index),
      completeness: 45 + (index % 35),
      deletedAt: monthDate(2026, 3, 1 + (index % 20)),
      lpkInformation: "Kategori seed: dropout - kandidat mengundurkan diri dari proses"
    });
  }

  if (category === "lolos") {
    return makeCandidate(index, category, {
      profileStatus: "COMPLETE",
      cvStatus: "DONE",
      completeness: 100,
      profilePhoto: `#photo-${id}`,
      documentKtp: `#ktp-${id}`,
      documentKk: `#kk-${id}`,
      documentIjazah: `#ijazah-${id}`,
      documentPaspor: `#paspor-${id}`,
      documentMedicalCheckup: `#medical-${id}`,
      documentFotoProfil: `#foto-profil-${id}`,
      physicalTestVideo: `#video-${id}`,
      additionalFiles: [`#placement-letter-${id}`, `#contract-${id}`],
      lpkInformation: "Kategori seed: lolos - siap penempatan"
    });
  }

  if (category === "edge") {
    const edgeOverrides = [
      {
        heightCm: 145,
        weightKg: 39,
        medicalHistory: "Riwayat alergi makanan laut, debu, dan udara dingin. Membawa catatan observasi dokter untuk kebutuhan screening.",
        skills: ["Bahasa Jepang N4", "Caregiver lansia", "Pencatatan obat", "Komunikasi keluarga pasien", "Memasak diet khusus", "Microsoft Excel"],
        habits: ["Tidak merokok", "Bangun pukul 04:30", "Mencatat pengeluaran harian", "Belajar kanji setiap malam"]
      },
      {
        addressStreet: "Dusun Pesisir Ujung Timur RT 001 RW 009 dekat dermaga lama",
        addressCity: "Kepulauan Aru",
        addressProvince: "Maluku",
        addressPostalCode: "97681",
        japaneseStudyHours: 999
      },
      {
        fullNameRomaji: "NI LUH PUTU AYU DEWI KARTIKA SARI",
        nickname: "Putu Ayu",
        religion: "Hindu",
        birthPlace: "Tabanan",
        addressCity: "Tabanan",
        addressProvince: "Bali"
      },
      {
        age: 35,
        birthDate: yearsAgo(35, 11, 31),
        hasWorkExperience: true,
        workExperience: "Pengalaman 12 tahun di manufaktur, pergudangan, dan kontrol kualitas",
        latestJob: "SENIOR QUALITY CONTROL",
        companyNameLatest: "PT Presisi Komponen Nusantara"
      },
      {
        passportStatus: "Nama di paspor perlu penyesuaian spasi",
        documentPaspor: "#paspor-edge-perlu-review",
        cvStatus: "STALE"
      },
      {
        maritalStatus: "Cerai hidup",
        familyInformation: "Menanggung satu anak dan satu orang tua; jadwal keberangkatan perlu koordinasi keluarga."
      },
      {
        seniorHighType: "Lainnya",
        seniorHighTypeOther: "Paket C",
        seniorHighMajor: "Lainnya",
        seniorHighMajorOther: "Kejuruan informal tata boga"
      },
      {
        drinksAlcohol: true,
        smokes: true,
        hasTattoo: true,
        lifestyle: "Alkohol: Ya, Merokok: Ya, Tato: Ya - perlu review kebijakan penerimaan"
      },
      {
        cvStatus: "PROCESSING",
        lpkInformation: "Kategori seed: edge - CV sedang diproses saat data diuji"
      },
      {
        medicalHistory: "Pernah operasi kecil tahun 2016, sudah pulih. Memiliki surat keterangan sehat terbaru.",
        additionalFiles: ["#edge-surat-dokter", "#edge-sertifikat-bahasa", "#edge-portfolio-panjang"]
      }
    ];

    return makeCandidate(index, category, {
      profileStatus: "COMPLETE",
      cvStatus: index % 3 === 0 ? "STALE" : "PENDING",
      completeness: 82 + (index % 19),
      ...edgeOverrides[index - 90]
    });
  }

  return makeCandidate(index, category);
}

function makeTestResults(candidates) {
  const results = [];
  let id = 1;

  for (const candidate of candidates) {
    const category = String(candidate.lpkInformation).includes("lolos") ? "lolos" : String(candidate.lpkInformation).replace("Kategori seed: ", "").split(" ")[0];
    if (category === "incomplete" && candidate.id % 2 !== 0) continue;
    if (category === "dropout" && candidate.id % 3 !== 0) continue;

    const baseScore = category === "lolos" ? 91 : category === "ready" ? 76 : category === "edge" ? 68 : category === "with_files" ? 72 : 55;
    results.push({
      id: id++,
      candidateId: candidate.id,
      totalScore: Math.min(100, baseScore + (candidate.id % 9)),
      attemptNumber: 1,
      isLatest: true,
      deletedAt: null
    });

    if (category === "lolos" || candidate.id % 17 === 0) {
      results[results.length - 1].isLatest = false;
      results.push({
        id: id++,
        candidateId: candidate.id,
        totalScore: Math.min(100, baseScore + 5 + (candidate.id % 7)),
        attemptNumber: 2,
        isLatest: true,
        deletedAt: null
      });
    }
  }

  return results;
}

function makeCvJobs(candidates) {
  const jobs = [];
  let id = 1;

  for (const candidate of candidates) {
    if (candidate.cvStatus === "PENDING") continue;

    const languages = candidate.cvStatus === "DONE" ? ["ID", "JA"] : ["ID"];
    for (const language of languages) {
      jobs.push({
        id: id++,
        candidateId: candidate.id,
        status: candidate.cvStatus,
        retryCount: candidate.cvStatus === "FAILED" ? 2 : 0,
        outputLanguage: language,
        fileUrl: candidate.cvStatus === "DONE" ? `#cv-${language.toLowerCase()}-${candidate.id}` : null,
        storageKey: candidate.cvStatus === "DONE" ? `candidate/${candidate.id}/cv-${language.toLowerCase()}.pdf` : null,
        errorMessage: candidate.cvStatus === "FAILED" ? "Seed demo: kandidat dropout atau data belum valid" : null,
        deletedAt: null
      });
    }
  }

  return jobs;
}

function makeFiles(candidates, cvJobs) {
  const files = [];
  let id = 1;
  const cvJobByCandidateAndLanguage = new Map(cvJobs.map((job) => [`${job.candidateId}-${job.outputLanguage}`, job]));

  function push(candidate, type, name, url, mimeType, sizeBytes, cvJobId = null) {
    files.push({
      id: id++,
      candidateId: candidate.id,
      type,
      name,
      url,
      storageKey: `candidate/${candidate.id}/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      mimeType,
      sizeBytes,
      cvJobId,
      deletedAt: null
    });
  }

  for (const candidate of candidates) {
    const info = String(candidate.lpkInformation);
    const isWithFiles = info.includes("with_files");
    const isLolos = info.includes("lolos");
    const isEdgeWithFiles = info.includes("edge") && (candidate.id % 2 === 0 || candidate.additionalFiles.length > 0);
    if (!isWithFiles && !isLolos && !isEdgeWithFiles) continue;

    push(candidate, "PHOTO", `Foto Profil ${candidate.fullNameRomaji}.jpg`, `#photo-${candidate.id}`, "image/jpeg", 280000 + candidate.id);
    push(candidate, "DOCUMENT", `KTP ${candidate.fullNameRomaji}.pdf`, `#ktp-${candidate.id}`, "application/pdf", 420000 + candidate.id);
    push(candidate, "DOCUMENT", `Ijazah ${candidate.fullNameRomaji}.pdf`, `#ijazah-${candidate.id}`, "application/pdf", 520000 + candidate.id);

    if (isWithFiles || isLolos) {
      push(candidate, "VIDEO", `Video Perkenalan ${candidate.fullNameRomaji}.mp4`, `#video-${candidate.id}`, "video/mp4", 3200000 + candidate.id);
    }

    if (isLolos) {
      const idJob = cvJobByCandidateAndLanguage.get(`${candidate.id}-ID`);
      const jaJob = cvJobByCandidateAndLanguage.get(`${candidate.id}-JA`);
      push(candidate, "CV", `CV Bahasa Indonesia ${candidate.fullNameRomaji}.pdf`, `#cv-id-${candidate.id}`, "application/pdf", 730000 + candidate.id, idJob?.id ?? null);
      push(candidate, "CV", `CV Bahasa Jepang ${candidate.fullNameRomaji}.pdf`, `#cv-ja-${candidate.id}`, "application/pdf", 760000 + candidate.id, jaJob?.id ?? null);
      push(candidate, "DOCUMENT", `Kontrak Penempatan ${candidate.fullNameRomaji}.pdf`, `#contract-${candidate.id}`, "application/pdf", 610000 + candidate.id);
    }

    if (isEdgeWithFiles) {
      push(candidate, "DOCUMENT", `Dokumen Edge Case Nama Sangat Panjang Untuk ${candidate.fullNameRomaji}.pdf`, `#edge-document-${candidate.id}`, "application/pdf", 980000 + candidate.id);
    }
  }

  return files;
}

function makeAuditLogs(candidates) {
  return candidates.slice(0, 12).map((candidate) => ({
    userId: "seed-admin",
    action: "seed_database",
    entityType: "candidate",
    entityId: candidate.id,
    oldValue: null,
    newValue: {
      category: String(candidate.lpkInformation).replace("Kategori seed: ", ""),
      profileStatus: candidate.profileStatus,
      cvStatus: candidate.cvStatus
    },
    ipAddress: "127.0.0.1"
  }));
}

async function resetCandidateData() {
  await prisma.user.updateMany({
    where: { candidateId: { not: null } },
    data: { candidateId: null }
  });
  await prisma.auditLog.deleteMany({
    where: { entityType: { in: ["candidate", "test_result", "cv_job", "file"] } }
  });
  await prisma.candidateFile.deleteMany();
  await prisma.cvJob.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.candidate.deleteMany();
}

async function upsertUsers(hashedPassword) {
  const users = [
    { id: "seed-admin", email: "admin@lpk.local", name: "Maya Admin", role: "ADMIN" },
    { id: "seed-superadmin", email: "superadmin@lpk.local", name: "Raka Superadmin", role: "SUPERADMIN" },
    { id: "seed-candidate", email: "candidate@lpk.local", name: "Seed Candidate", role: "CANDIDATE", candidateId: candidateUserId }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        id: user.id,
        name: user.name,
        role: user.role,
        candidateId: user.candidateId ?? null,
        emailVerified: true
      },
      create: {
        ...user,
        emailVerified: true,
        accounts: {
          create: {
            accountId: user.id,
            providerId: "credential",
            password: hashedPassword
          }
        }
      }
    });

    const account = await prisma.account.findFirst({
      where: {
        providerId: "credential",
        accountId: user.id,
        userId: user.id
      }
    });

    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword }
      });
    } else {
      await prisma.account.create({
        data: {
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword
        }
      });
    }
  }
}

async function resetSequences() {
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"Candidate"', 'id'), COALESCE((SELECT MAX("id") FROM "Candidate"), 1), true);
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"TestResult"', 'id'), COALESCE((SELECT MAX("id") FROM "TestResult"), 1), true);
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"CvJob"', 'id'), COALESCE((SELECT MAX("id") FROM "CvJob"), 1), true);
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"CandidateFile"', 'id'), COALESCE((SELECT MAX("id") FROM "CandidateFile"), 1), true);
  `);
}

async function main() {
  const { hashPassword } = await import("better-auth/crypto");
  const hashedPassword = await hashPassword(password);

  const candidates = Array.from({ length: 100 }, (_, index) => candidateForIndex(index));
  const testResults = makeTestResults(candidates);
  const cvJobs = makeCvJobs(candidates);
  const files = makeFiles(candidates, cvJobs);
  const auditLogs = makeAuditLogs(candidates);

  await resetCandidateData();
  await prisma.candidate.createMany({ data: candidates });
  await prisma.testResult.createMany({ data: testResults });
  await prisma.cvJob.createMany({ data: cvJobs });
  await prisma.candidateFile.createMany({ data: files });
  await upsertUsers(hashedPassword);
  await prisma.auditLog.createMany({ data: auditLogs });
  await resetSequences();

  console.log(`Seeded ${candidates.length} candidates, ${testResults.length} test results, ${cvJobs.length} CV jobs, and ${files.length} files.`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
