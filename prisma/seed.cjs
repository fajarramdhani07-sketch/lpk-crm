const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const password = "password123";

const candidates = [
  {
    id: 101,
    email: "andi.saputra@mail.local",
    phoneNumber: "081211002200",
    fullNameRomaji: "ANDI SAPUTRA",
    fullNameKatakana: "アンディ サプトラ",
    nickname: "ANDI",
    birthDate: new Date("2001-05-14"),
    birthPlace: "Bandung",
    gender: "LAKI_LAKI",
    age: 24,
    addressStreet: "Jl. Melati No. 14",
    addressCity: "Bandung",
    addressProvince: "Jawa Barat",
    heightCm: 171,
    weightKg: 64,
    bloodType: "O",
    maritalStatus: "Belum menikah",
    religion: "Islam",
    passportStatus: "Sudah ada",
    medicalHistory: "Tidak ada riwayat penyakit berat",
    wearsGlasses: false,
    education: "SMK",
    seniorHighSchoolName: "SMK Teknik Mesin Bandung",
    seniorHighType: "SMK",
    seniorHighMajor: "Teknik Mesin",
    workExperience: "Operator produksi 2 tahun",
    hasWorkExperience: true,
    latestJob: "OPERATOR PRODUKSI",
    companyNameLatest: "PT CONTOH MANUFAKTUR",
    job1Role: "Operator Produksi",
    familyInformation: "Anak pertama dari 3 bersaudara",
    family1Name: "BUDI SAPUTRA",
    family1Relation: "Ayah",
    family1Occupation: "Wiraswasta",
    family2Name: "SRI RAHAYU",
    family2Relation: "Ibu",
    family2Occupation: "Ibu rumah tangga",
    lifestyle: "Alkohol: Tidak, Merokok: Tidak, Tato: Tidak",
    drinksAlcohol: false,
    smokes: false,
    hasTattoo: false,
    lpkInformation: "LPK Sakura",
    lpkOrigin: "LPK Sakura",
    japaneseStudyHours: 420,
    skills: ["Bahasa Jepang N4", "Las dasar", "Microsoft Excel"],
    habits: ["Tidak merokok", "Olahraga"],
    profileStatus: "COMPLETE",
    cvStatus: "DONE",
    completeness: 100
  },
  {
    id: 102,
    email: "siti.n@mail.local",
    phoneNumber: "085777881122",
    fullNameRomaji: "SITI NURHALIZA",
    fullNameKatakana: "シティ ヌルハリザ",
    nickname: "SITI",
    birthDate: new Date("2002-02-08"),
    birthPlace: "Semarang",
    gender: "PEREMPUAN",
    age: 24,
    addressStreet: "Jl. Veteran No. 8",
    addressCity: "Semarang",
    addressProvince: "Jawa Tengah",
    heightCm: 160,
    weightKg: 51,
    bloodType: "A",
    maritalStatus: "Belum menikah",
    religion: "Islam",
    passportStatus: "Dalam proses",
    medicalHistory: "Alergi debu ringan",
    wearsGlasses: false,
    education: "SMA",
    seniorHighSchoolName: "SMA IPA Semarang",
    seniorHighType: "SMA",
    seniorHighMajor: "IPA",
    workExperience: "Magang caregiver 6 bulan",
    hasWorkExperience: true,
    latestJob: "CAREGIVER MAGANG",
    companyNameLatest: "KLINIK CONTOH",
    job1Role: "Caregiver",
    familyInformation: "Tinggal dengan orang tua",
    lifestyle: "Alkohol: Tidak, Merokok: Tidak, Tato: Tidak",
    drinksAlcohol: false,
    smokes: false,
    hasTattoo: false,
    lpkInformation: "LPK Nusantara",
    lpkOrigin: "LPK Nusantara",
    japaneseStudyHours: 260,
    skills: ["Bahasa Jepang N5", "Perawatan lansia"],
    habits: ["Tidak merokok"],
    profileStatus: "COMPLETE",
    cvStatus: "STALE",
    completeness: 92
  },
  {
    id: 103,
    email: "bima.p@mail.local",
    phoneNumber: "082122445566",
    fullNameRomaji: "BIMA PRASETYO",
    birthDate: new Date("2000-11-27"),
    birthPlace: "Yogyakarta",
    gender: "LAKI_LAKI",
    age: 25,
    addressStreet: "Jl. Pahlawan No. 21",
    addressCity: "Yogyakarta",
    heightCm: 176,
    weightKg: 72,
    medicalHistory: "Pernah cedera lutut, sudah pulih",
    education: "D3",
    workExperience: "Teknisi maintenance 1 tahun",
    hasWorkExperience: true,
    latestJob: "TEKNISI MAINTENANCE",
    job1Role: "Teknisi",
    familyInformation: "Anak kedua",
    skills: ["PLC dasar", "Bahasa Jepang N5"],
    habits: ["Merokok", "Kopi"],
    profileStatus: "INCOMPLETE",
    cvStatus: "PENDING",
    completeness: 76
  },
  {
    id: 104,
    email: "dewi.l@mail.local",
    phoneNumber: "089633334444",
    fullNameRomaji: "DEWI LESTARI",
    birthDate: new Date("2003-07-03"),
    birthPlace: "Malang",
    gender: "PEREMPUAN",
    age: 22,
    addressStreet: "Jl. Kenanga No. 3",
    addressCity: "Malang",
    heightCm: 158,
    weightKg: 49,
    medicalHistory: "Tidak ada",
    education: "SMK",
    workExperience: "Housekeeping hotel 1 tahun",
    hasWorkExperience: true,
    latestJob: "HOUSEKEEPING",
    job1Role: "Housekeeping",
    familyInformation: "Anak tunggal",
    skills: ["Bahasa Jepang N4", "Hospitality"],
    habits: ["Tidak merokok", "Disiplin olahraga"],
    profileStatus: "DRAFT",
    cvStatus: "FAILED",
    completeness: 61
  }
];

async function main() {
  const { hashPassword } = await import("better-auth/crypto");
  const hashedPassword = await hashPassword(password);

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { id: candidate.id },
      update: candidate,
      create: candidate
    });
  }

  const users = [
    { id: "seed-admin", email: "admin@lpk.local", name: "Maya Admin", role: "ADMIN" },
    { id: "seed-superadmin", email: "superadmin@lpk.local", name: "Raka Superadmin", role: "SUPERADMIN" },
    { id: "seed-candidate", email: "candidate@lpk.local", name: "Andi Saputra", role: "CANDIDATE", candidateId: 101 }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
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
  }

  await prisma.testResult.createMany({
    data: [
      { id: 1, candidateId: 101, totalScore: 86, attemptNumber: 1, isLatest: false },
      { id: 2, candidateId: 101, totalScore: 91, attemptNumber: 2, isLatest: true },
      { id: 3, candidateId: 102, totalScore: 84, attemptNumber: 1, isLatest: true },
      { id: 4, candidateId: 103, totalScore: 72, attemptNumber: 1, isLatest: true },
      { id: 5, candidateId: 104, totalScore: 79, attemptNumber: 1, isLatest: true }
    ],
    skipDuplicates: true
  });

  await prisma.cvJob.createMany({
    data: [
      { id: 201, candidateId: 101, status: "DONE", outputLanguage: "ID", fileUrl: "#cv-id-andi" },
      { id: 202, candidateId: 101, status: "DONE", outputLanguage: "JA", fileUrl: "#cv-ja-andi" },
      { id: 203, candidateId: 102, status: "STALE", outputLanguage: "ID", fileUrl: "#cv-id-siti" },
      { id: 204, candidateId: 104, status: "FAILED", outputLanguage: "JA", retryCount: 2 }
    ],
    skipDuplicates: true
  });

  await prisma.candidateFile.createMany({
    data: [
      { id: 301, candidateId: 101, type: "PHOTO", name: "Foto Andi.jpg", url: "#photo-andi" },
      { id: 302, candidateId: 101, type: "CV", name: "CV Andi Bahasa Indonesia.pdf", url: "#cv-id-andi", cvJobId: 201 },
      { id: 303, candidateId: 102, type: "DOCUMENT", name: "Ijazah Siti.pdf", url: "#document-siti" },
      { id: 304, candidateId: 103, type: "VIDEO", name: "Perkenalan Bima.mp4", url: "#video-bima" }
    ],
    skipDuplicates: true
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: "seed-admin", action: "seed_database", entityType: "candidate", entityId: 101, newValue: { note: "Initial seed" } },
      { userId: "seed-admin", action: "seed_database", entityType: "candidate", entityId: 102, newValue: { note: "Initial seed" } }
    ]
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
