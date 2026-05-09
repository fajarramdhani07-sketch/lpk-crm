import type { Candidate, TestResult } from "@prisma/client";
import { buildCandidateCvViewModel, type CandidateCvViewModel } from "./build-cv-view-model.ts";

export function generateCandidateCvHtml(candidate: Candidate, latestTestResult?: TestResult | null) {
  const cv = buildCandidateCvViewModel(candidate, latestTestResult);

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CV ${escapeHtml(cv.identity.full_name_romaji || "Candidate")}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #e5e5e5; color: #111; font-family: Arial, "Yu Gothic", "Meiryo", sans-serif; }
    main { width: 794px; min-height: 1123px; margin: 24px auto; background: #fff; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,.16); font-size: 11px; line-height: 1.25; }
    header { display: grid; grid-template-columns: 92px 1fr 118px; gap: 8px; align-items: start; margin-bottom: 8px; }
    .logo { height: 58px; display: flex; align-items: center; justify-content: center; border: 1px solid #111; font-size: 16px; font-weight: 900; }
    .title { text-align: center; }
    .title h1 { margin: 0; font-size: 23px; line-height: 1; }
    .photo { justify-self: end; width: 96px; height: 128px; border: 1px solid #111; display: flex; align-items: center; justify-content: center; color: #737373; font-size: 9px; object-fit: cover; }
    table { width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #111; }
    th, td { border: 1px solid #111; height: 24px; padding: 4px 6px; vertical-align: middle; overflow-wrap: anywhere; }
    th { width: 92px; background: #f5f5f5; text-align: left; font-weight: 700; }
    .label-id, .sub { font-size: 9px; font-weight: 500; }
    .jp-value { min-height: 11px; font-weight: 600; }
    .id-value { font-size: 10px; }
    .section-title { margin-top: 8px; border: 1px solid #111; border-bottom: 0; background: #f5f5f5; padding: 4px 8px; font-weight: 700; }
    footer { margin-top: 12px; border-top: 1px solid #111; padding-top: 8px; font-size: 9px; line-height: 1.35; }
    @media print {
      body { background: #fff; }
      main { margin: 0; width: 100%; min-height: 0; padding: 12px; box-shadow: none; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="logo">LPK</div>
      <div class="title">
        <div style="font-size:10px;font-weight:600;">LPK Candidate CRM &amp; CV System</div>
        <h1>履歴書</h1>
        <div style="font-size:13px;font-weight:600;">Riwayat Hidup</div>
      </div>
      ${photo(cv.identity.photo_url)}
    </header>

    <table><tbody>
      <tr>${th("フリガナ", "Nama Katakana")}${td(cv.identity.full_name_katakana, 3)}${th("氏名", "Nama")}${td(cv.identity.full_name_romaji, 4, true)}</tr>
      <tr>${th("生年月日", "Tanggal Lahir")}${td(cv.identity.birth_date_ja, 3, false, cv.identity.birth_date)}${th("年齢", "Usia")}${td(cv.identity.age ? `${cv.identity.age} Tahun` : "")}${th("性別", "Jenis Kelamin")}${bilingual(cv.identity.gender_ja, cv.identity.gender)}</tr>
      <tr>${th("出生地", "Tempat lahir")}${bilingual(cv.identity.birth_place_ja, cv.identity.birth_place, 3)}${th("身長", "Tinggi Badan")}${td(unit(cv.identity.height_cm, "CM"))}${th("体重", "Berat Badan")}${td(unit(cv.identity.weight_kg, "KG"))}</tr>
      <tr>${th("血液型", "Gol Darah")}${td(unit(cv.identity.blood_type, "型"))}${th("結婚の有無", "Status Menikah")}${bilingual(cv.identity.marital_status_ja, cv.identity.marital_status, 2)}${th("パスポート", "Paspor")}${bilingual(cv.identity.passport_status_ja, cv.identity.passport_status)}${th("宗教", "Agama")}${bilingual(cv.identity.religion_ja, cv.identity.religion)}</tr>
      <tr>${th("現住所", "Alamat Rumah")}${bilingual(cv.identity.address_ja, cv.identity.address, 8)}</tr>
    </tbody></table>

    ${sectionTitle("学歴", "Riwayat Pendidikan")}
    <table>
      <thead><tr>${th("在籍期間", "Tahun bulan")}${th("学校名", "Nama Sekolah", 4)}${th("種別", "Jenjang", 2)}${th("専攻", "Jurusan", 2)}</tr></thead>
      <tbody>${padRows(cv.educationRows, 4, emptyEducationRow).map((row) => `<tr>${td(row.period)}${bilingual(row.school_name_ja, row.school_name, 4)}${bilingual(row.school_level_ja, row.school_level, 2)}${bilingual(row.major_ja, row.major, 2)}</tr>`).join("")}</tbody>
    </table>

    ${sectionTitle("職歴", "Riwayat Pekerjaan（アルバイトを含む / Termasuk Pekerjaan paruh waktu）")}
    <table>
      <thead><tr>${th("在籍期間", "Tahun bulan")}${th("会社名", "Nama Perusahaan", 5)}${th("職種", "Jenis Kerja", 3)}</tr></thead>
      <tbody>${padRows(cv.workRows, 3, emptyWorkRow).map((row) => `<tr>${td(row.period)}${bilingual(row.company_name_ja, row.company_name, 5)}${bilingual(row.job_role_ja, row.job_role, 3)}</tr>`).join("")}</tbody>
    </table>

    ${sectionTitle("家族構成", "Struktur Keluarga")}
    <table>
      <thead><tr>${th("続柄", "Hub. keluarga", 2)}${th("氏名", "Nama", 4)}${th("年齢", "Usia")}${th("職業", "Pekerjaan", 2)}</tr></thead>
      <tbody>${padRows(cv.familyRows, 6, emptyFamilyRow).map((row) => `<tr>${bilingual(row.relation_ja, row.relation, 2)}${td(row.name, 4)}${td(row.age)}${bilingual(row.occupation_ja, row.occupation, 2)}</tr>`).join("")}</tbody>
    </table>

    <table style="margin-top:8px;"><tbody>
      <tr>${th("病歴", "Riwayat Penyakit", 2)}${bilingual(cv.notes.medical_history_ja, cv.notes.medical_history, 7)}</tr>
      <tr>${th("特記事項", "Catatan Khusus", 2)}${bilingual(cv.notes.special_notes_ja, cv.notes.special_notes, 7)}</tr>
    </tbody></table>

    <table style="margin-top:8px;">
      <thead><tr>${th("飲酒歴", "Alkohol")}${th("タバコ", "Rokok")}${th("眼鏡", "Kacamata")}${th("刺青", "Tato")}${th("推論", "Reasoning")}${th("図形", "Figure")}${th("計算", "Calculation")}${th("単位", "Unit")}${th("合計", "Total")}${th("日本語基礎", "Japanese Basic")}${th("学習時間", "Jam Belajar")}</tr></thead>
      <tbody><tr style="text-align:center;">${td(mark(cv.habits.drinks_alcohol))}${td(mark(cv.habits.smokes))}${td(mark(cv.habits.wears_glasses))}${td(mark(cv.habits.has_tattoo))}${td(cv.scores.reasoning_score)}${td(cv.scores.figure_score)}${td(cv.scores.calculation_score)}${td(cv.scores.unit_score)}${td(cv.scores.total_score)}${td(cv.scores.japanese_basic_score)}${td(cv.scores.japanese_study_hours)}</tr></tbody>
    </table>

    <footer>
      <div><strong>PT Memanfaatkan Karir Indonesia</strong></div>
      <div>JL KAMPUS PRAMITA KAMPUNG PEUSAR RT. 009 RW. 001, BINONG, CURUG KAB. TANGERANG 15810 Banten Indonesia</div>
      <div>Telp : (+62)21- | Fax : (+62)21- | Email: ptmki@idn.leverages.com</div>
    </footer>
  </main>
</body>
</html>`;
}

function th(jp: string, id: string, colSpan = 1) {
  return `<th colspan="${colSpan}"><div>${escapeHtml(jp)}</div><div class="label-id">${escapeHtml(id)}</div></th>`;
}

function td(value: string, colSpan = 1, strong = false, secondary = "") {
  return `<td colspan="${colSpan}"${strong ? ' style="font-weight:700;"' : ""}><div>${escapeHtml(value)}</div>${secondary ? `<div class="sub">${escapeHtml(secondary)}</div>` : ""}</td>`;
}

function bilingual(jp: string, id: string, colSpan = 1) {
  return `<td colspan="${colSpan}"><div class="jp-value">${escapeHtml(jp)}</div><div class="id-value">${escapeHtml(id)}</div></td>`;
}

function sectionTitle(jp: string, id: string) {
  return `<div class="section-title">${escapeHtml(jp)} <span style="font-weight:500;">${escapeHtml(id)}</span></div>`;
}

function photo(value: string) {
  if (!isUsableImage(value)) return '<div class="photo">PHOTO</div>';
  return `<img class="photo" src="${escapeHtml(value)}" alt="" />`;
}

function padRows<T>(rows: T[], length: number, factory: () => T) {
  return [...rows, ...Array.from({ length: Math.max(0, length - rows.length) }, factory)];
}

function emptyEducationRow(): CandidateCvViewModel["educationRows"][number] {
  return { period: "", school_name: "", school_name_ja: "", school_level: "", school_level_ja: "", major: "", major_ja: "" };
}

function emptyWorkRow(): CandidateCvViewModel["workRows"][number] {
  return { period: "", company_name: "", company_name_ja: "", job_role: "", job_role_ja: "" };
}

function emptyFamilyRow(): CandidateCvViewModel["familyRows"][number] {
  return { relation: "", relation_ja: "", name: "", age: "", occupation: "", occupation_ja: "" };
}

function isUsableImage(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/") || value.startsWith("data:image/");
}

function unit(value: string, label: string) {
  return value ? `${value} ${label}` : "";
}

function mark(value: string) {
  if (value === "Ya") return "○";
  if (value === "Tidak") return "×";
  return "";
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
