import path from "node:path";
import ExcelJS from "exceljs";
import type { Task } from "@/features/tasks/types";
import { REPORT_META, formatReportDate } from "./report-meta";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "docs",
  "templates",
  "Daily_Report_Template.xlsx",
);

const DATA_START_ROW = 13;
const PREFILLED_DATA_ROWS = 5;

type WorkbookTask = Pick<Task, "description" | "achieve">;

function thinBorder(): Partial<ExcelJS.Borders> {
  const edge: Partial<ExcelJS.Border> = {
    style: "thin",
    color: { argb: "FF000000" },
  };
  return { top: edge, left: edge, bottom: edge, right: edge };
}

function ensureActivityMerge(ws: ExcelJS.Worksheet, rowNumber: number) {
  const mergeRange = `C${rowNumber}:I${rowNumber}`;
  const alreadyMerged = (ws.model.merges ?? []).includes(mergeRange);
  if (!alreadyMerged) {
    ws.mergeCells(mergeRange);
  }
}

function styleDataRow(ws: ExcelJS.Worksheet, rowNumber: number) {
  const row = ws.getRow(rowNumber);
  if (!row.height || row.height < 30) {
    row.height = 45;
  }

  const noCell = ws.getCell(rowNumber, 1);
  noCell.alignment = { horizontal: "center", vertical: "middle" };
  noCell.border = thinBorder();
  noCell.font = { name: "Calibri" };
  noCell.numFmt = "0";

  const achieveCell = ws.getCell(rowNumber, 2);
  achieveCell.alignment = { horizontal: "center", vertical: "middle" };
  achieveCell.border = thinBorder();
  achieveCell.font = { name: "Calibri" };
  achieveCell.numFmt = "0%";

  const activityCell = ws.getCell(rowNumber, 3);
  activityCell.alignment = {
    vertical: "middle",
    wrapText: true,
    readingOrder: "ltr",
  };
  activityCell.border = thinBorder();
  activityCell.font = { name: "Calibri" };

  for (let col = 4; col <= 9; col += 1) {
    const cell = ws.getCell(rowNumber, col);
    cell.border = thinBorder();
  }

  const remarksCell = ws.getCell(rowNumber, 10);
  remarksCell.alignment = {
    horizontal: "center",
    vertical: "middle",
    readingOrder: "ltr",
  };
  remarksCell.border = thinBorder();
  remarksCell.font = { name: "Calibri" };
}

function clearDataRow(ws: ExcelJS.Worksheet, rowNumber: number) {
  for (let col = 1; col <= 10; col += 1) {
    ws.getCell(rowNumber, col).value = null;
  }
}

export async function generateWorkbook(
  selectedDate: string,
  tasks: WorkbookTask[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Timesheet template has no worksheet");
  }

  worksheet.getCell("C8").value = formatReportDate(selectedDate);

  const rowsToClear = Math.max(tasks.length, PREFILLED_DATA_ROWS);
  for (let i = 0; i < rowsToClear; i += 1) {
    clearDataRow(worksheet, DATA_START_ROW + i);
  }

  tasks.forEach((task, index) => {
    const rowNumber = DATA_START_ROW + index;
    ensureActivityMerge(worksheet, rowNumber);
    styleDataRow(worksheet, rowNumber);

    const achievePct =
      typeof task.achieve === "number" && Number.isFinite(task.achieve)
        ? Math.min(100, Math.max(0, task.achieve))
        : 100;

    worksheet.getCell(rowNumber, 1).value = index + 1;
    worksheet.getCell(rowNumber, 2).value = achievePct / 100;
    worksheet.getCell(rowNumber, 3).value = task.description;
    worksheet.getCell(rowNumber, 10).value = REPORT_META.defaultRemarks;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
