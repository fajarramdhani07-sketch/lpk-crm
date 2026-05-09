import type { CandidateCvViewModel } from "@/lib/cv/build-cv-view-model";
import Image from "next/image";

export function CandidateCvTemplate({ cv }: { cv: CandidateCvViewModel }) {
  return (
    <main className="min-h-screen bg-neutral-200 px-3 py-6 text-neutral-950 print:bg-white print:p-0">
      <article className="mx-auto min-h-[1123px] w-[794px] max-w-full bg-white p-5 text-[11px] leading-tight shadow print:min-h-0 print:w-full print:p-3 print:shadow-none">
        <header className="mb-2 grid grid-cols-[92px_1fr_118px] items-start gap-2">
          <div className="flex h-[58px] items-center justify-center border border-neutral-900 text-center text-[16px] font-black tracking-tight">
            LPK
          </div>
          <div className="text-center">
            <div className="text-[10px] font-semibold">LPK Candidate CRM & CV System</div>
            <h1 className="text-[23px] font-bold leading-none">履歴書</h1>
            <div className="text-[13px] font-semibold">Riwayat Hidup</div>
          </div>
          <PhotoBox src={cv.identity.photo_url} />
        </header>

        <table className="cv-table">
          <tbody>
            <tr>
              <Th jp="フリガナ" id="Nama Katakana" />
              <Td value={cv.identity.full_name_katakana} colSpan={3} />
              <Th jp="氏名" id="Nama" />
              <Td value={cv.identity.full_name_romaji} colSpan={4} strong />
            </tr>
            <tr>
              <Th jp="生年月日" id="Tanggal Lahir" />
              <Td value={cv.identity.birth_date_ja} secondary={cv.identity.birth_date} colSpan={3} />
              <Th jp="年齢" id="Usia" />
              <Td value={cv.identity.age ? `${cv.identity.age} Tahun` : ""} />
              <Th jp="性別" id="Jenis Kelamin" />
              <BilingualData jp={cv.identity.gender_ja} id={cv.identity.gender} />
            </tr>
            <tr>
              <Th jp="出生地" id="Tempat lahir" />
              <BilingualData jp={cv.identity.birth_place_ja} id={cv.identity.birth_place} colSpan={3} />
              <Th jp="身長" id="Tinggi Badan" />
              <Td value={unit(cv.identity.height_cm, "CM")} />
              <Th jp="体重" id="Berat Badan" />
              <Td value={unit(cv.identity.weight_kg, "KG")} />
            </tr>
            <tr>
              <Th jp="血液型" id="Gol Darah" />
              <Td value={unit(cv.identity.blood_type, "型")} />
              <Th jp="結婚の有無" id="Status Menikah" />
              <BilingualData jp={cv.identity.marital_status_ja} id={cv.identity.marital_status} colSpan={2} />
              <Th jp="パスポート" id="Paspor" />
              <BilingualData jp={cv.identity.passport_status_ja} id={cv.identity.passport_status} />
              <Th jp="宗教" id="Agama" />
              <BilingualData jp={cv.identity.religion_ja} id={cv.identity.religion} />
            </tr>
            <tr>
              <Th jp="現住所" id="Alamat Rumah" />
              <BilingualData jp={cv.identity.address_ja} id={cv.identity.address} colSpan={8} />
            </tr>
          </tbody>
        </table>

        <SectionTitle jp="学歴" id="Riwayat Pendidikan" />
        <table className="cv-table">
          <thead>
            <tr>
              <Th jp="在籍期間" id="Tahun bulan" />
              <Th jp="学校名" id="Nama Sekolah" colSpan={4} />
              <Th jp="種別" id="Jenjang" colSpan={2} />
              <Th jp="専攻" id="Jurusan" colSpan={2} />
            </tr>
          </thead>
          <tbody>
            {padRows(cv.educationRows, 4, emptyEducationRow).map((row, index) => (
              <tr key={`education-${index}`}>
                <Td value={row.period} />
                <BilingualData jp={row.school_name_ja} id={row.school_name} colSpan={4} />
                <BilingualData jp={row.school_level_ja} id={row.school_level} colSpan={2} />
                <BilingualData jp={row.major_ja} id={row.major} colSpan={2} />
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle jp="職歴" id="Riwayat Pekerjaan（アルバイトを含む / Termasuk Pekerjaan paruh waktu）" />
        <table className="cv-table">
          <thead>
            <tr>
              <Th jp="在籍期間" id="Tahun bulan" />
              <Th jp="会社名" id="Nama Perusahaan" colSpan={5} />
              <Th jp="職種" id="Jenis Kerja" colSpan={3} />
            </tr>
          </thead>
          <tbody>
            {padRows(cv.workRows, 3, emptyWorkRow).map((row, index) => (
              <tr key={`work-${index}`}>
                <Td value={row.period} />
                <BilingualData jp={row.company_name_ja} id={row.company_name} colSpan={5} />
                <BilingualData jp={row.job_role_ja} id={row.job_role} colSpan={3} />
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle jp="家族構成" id="Struktur Keluarga" />
        <table className="cv-table">
          <thead>
            <tr>
              <Th jp="続柄" id="Hub. keluarga" colSpan={2} />
              <Th jp="氏名" id="Nama" colSpan={4} />
              <Th jp="年齢" id="Usia" />
              <Th jp="職業" id="Pekerjaan" colSpan={2} />
            </tr>
          </thead>
          <tbody>
            {padRows(cv.familyRows, 6, emptyFamilyRow).map((row, index) => (
              <tr key={`family-${index}`}>
                <BilingualData jp={row.relation_ja} id={row.relation} colSpan={2} />
                <Td value={row.name} colSpan={4} />
                <Td value={row.age} />
                <BilingualData jp={row.occupation_ja} id={row.occupation} colSpan={2} />
              </tr>
            ))}
          </tbody>
        </table>

        <table className="cv-table mt-2">
          <tbody>
            <tr>
              <Th jp="病歴" id="Riwayat Penyakit" colSpan={2} />
              <BilingualData jp={cv.notes.medical_history_ja} id={cv.notes.medical_history} colSpan={7} />
            </tr>
            <tr>
              <Th jp="特記事項" id="Catatan Khusus" colSpan={2} />
              <BilingualData jp={cv.notes.special_notes_ja} id={cv.notes.special_notes} colSpan={7} />
            </tr>
          </tbody>
        </table>

        <table className="cv-table mt-2">
          <thead>
            <tr>
              <Th jp="飲酒歴" id="Alkohol" />
              <Th jp="タバコ" id="Rokok" />
              <Th jp="眼鏡" id="Kacamata" />
              <Th jp="刺青" id="Tato" />
              <Th jp="推論" id="Reasoning" />
              <Th jp="図形" id="Figure" />
              <Th jp="計算" id="Calculation" />
              <Th jp="単位" id="Unit" />
              <Th jp="合計" id="Total" />
              <Th jp="日本語基礎" id="Japanese Basic" />
              <Th jp="学習時間" id="Jam Belajar" />
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <Td value={mark(cv.habits.drinks_alcohol)} />
              <Td value={mark(cv.habits.smokes)} />
              <Td value={mark(cv.habits.wears_glasses)} />
              <Td value={mark(cv.habits.has_tattoo)} />
              <Td value={cv.scores.reasoning_score} />
              <Td value={cv.scores.figure_score} />
              <Td value={cv.scores.calculation_score} />
              <Td value={cv.scores.unit_score} />
              <Td value={cv.scores.total_score} />
              <Td value={cv.scores.japanese_basic_score} />
              <Td value={cv.scores.japanese_study_hours} />
            </tr>
          </tbody>
        </table>

        <footer className="mt-3 border-t border-neutral-900 pt-2 text-[9px] leading-snug">
          <div className="font-semibold">PT Memanfaatkan Karir Indonesia</div>
          <div>JL KAMPUS PRAMITA KAMPUNG PEUSAR RT. 009 RW. 001, BINONG, CURUG KAB. TANGERANG 15810 Banten Indonesia</div>
          <div>Telp : (+62)21- | Fax : (+62)21- | Email: ptmki@idn.leverages.com</div>
        </footer>
      </article>
    </main>
  );
}

function SectionTitle({ jp, id }: { jp: string; id: string }) {
  return <div className="mt-2 border border-b-0 border-neutral-900 bg-neutral-100 px-2 py-1 text-[11px] font-bold">{jp} <span className="font-medium">{id}</span></div>;
}

function Th({ jp, id, colSpan = 1 }: { jp: string; id: string; colSpan?: number }) {
  return (
    <th colSpan={colSpan} className="w-[92px] bg-neutral-100 px-1.5 py-1 text-left align-middle font-semibold">
      <div>{jp}</div>
      <div className="text-[9px] font-medium">{id}</div>
    </th>
  );
}

function Td({ value, secondary, colSpan = 1, strong = false }: { value: string; secondary?: string; colSpan?: number; strong?: boolean }) {
  return (
    <td colSpan={colSpan} className={`min-h-6 px-1.5 py-1 align-middle ${strong ? "font-bold" : ""}`}>
      <div>{display(value)}</div>
      {secondary ? <div className="text-[9px] text-neutral-700">{secondary}</div> : null}
    </td>
  );
}

function BilingualData({ jp, id, colSpan = 1 }: { jp: string; id: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className="min-h-6 px-1.5 py-1 align-middle">
      <div className="min-h-[11px] font-medium">{jp}</div>
      <div className="text-[10px]">{display(id)}</div>
    </td>
  );
}

function PhotoBox({ src }: { src: string }) {
  if (isUsableImage(src)) {
    return <Image src={src} alt="" width={96} height={128} unoptimized className="h-[128px] w-[96px] justify-self-end border border-neutral-900 object-cover" />;
  }
  return <div className="flex h-[128px] w-[96px] items-center justify-center justify-self-end border border-neutral-900 text-[9px] text-neutral-500">PHOTO</div>;
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

function display(value: string) {
  return value || "";
}

function unit(value: string, label: string) {
  return value ? `${value} ${label}` : "";
}

function mark(value: string) {
  if (value === "Ya") return "○";
  if (value === "Tidak") return "×";
  return "";
}
