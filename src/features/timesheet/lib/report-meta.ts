export const REPORT_META = {
  companyTitle: "TIMESHEET PT Adi Data Informatika",
  name: "Muhammad Riko Bediatra",
  position: "Frontend Engineer",
  project: "Internal",
  pmContact: "Almas Barliyan",
  defaultRemarks: "WFO",
  logoSrc: "/brand/adidata-logo.png",
} as const;

export const DEFAULT_GMAIL_BODY = `Selamat Sore Mas,
Berikut saya melampirkan timesheet daily report saya.

Atas waktu dan perhatian nya saya ucapkan terima kasih
Regard, Muhammad Riko Bediatra
`;

/** selectedDate YYYY-MM-DD → DD/MM/YYYY */
export function formatReportDate(workDate: string): string {
  const [year, month, day] = workDate.split("-");
  return `${day}/${month}/${year}`;
}

/** selectedDate YYYY-MM-DD → Daily Report_Muhammad Riko Bediatra_DDMMYYYY */
export function buildReportFileName(workDate: string): string {
  const [year, month, day] = workDate.split("-");
  return `Daily Report_Muhammad Riko Bediatra_${day}${month}${year}`;
}
