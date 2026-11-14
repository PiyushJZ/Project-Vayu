/**
 * Turns an opened table file into the text the table box takes. CSV-like files are read as text;
 * an .xlsx workbook's first sheet is unzipped in the browser and written out as CSV, so the
 * server only ever sees text and the user can check what was read before generating.
 * No library: an .xlsx file is a zip of XML parts, and the browser can inflate and parse both.
 */

export const TABLE_FILE_ACCEPT = ".csv,.tsv,.txt,.xlsx";

export async function readTableFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) return xlsxToCsv(await file.arrayBuffer());
  if (name.endsWith(".xls"))
    throw new Error(
      "Old .xls workbooks cannot be read. Save the file as .xlsx or .csv and open it again.",
    );
  return decodeText(await file.arrayBuffer());
}

/** UTF-8 when the bytes are valid UTF-8, otherwise Windows-1252, which is what Excel's plain "CSV" export uses. */
function decodeText(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

async function unzip(buffer: ArrayBuffer): Promise<Map<string, () => Promise<string>>> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  // The end-of-central-directory record sits in the last 64 KiB (it may be followed by a comment).
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("This file is not a valid .xlsx workbook.");
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const entries = new Map<string, () => Promise<string>>();
  const utf8 = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) break;
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = utf8.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + size);
    entries.set(name, async () => {
      if (method === 0) return utf8.decode(data);
      if (method !== 8)
        throw new Error("This workbook uses a compression method that cannot be read.");
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return new Response(stream).text();
    });
  }
  return entries;
}

const xml = (text: string) => new DOMParser().parseFromString(text, "application/xml");
const all = (node: Document | Element, tag: string) => [...node.getElementsByTagNameNS("*", tag)];

/** Built-in number formats that show a date or time. */
const DATE_FORMAT_IDS = new Set([
  14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 30, 36, 45, 46, 47, 50, 57,
]);

function isDateFormat(code: string): boolean {
  // Drop quoted text, escaped characters and [colour]/[condition] sections, then look for date parts.
  const bare = code.replace(/"[^"]*"|\\.|\[[^\]]*\]/g, "");
  return /[dmyhs]/i.test(bare);
}

function columnIndex(ref: string): number {
  let n = 0;
  for (const ch of ref.replace(/\d+$/, "")) n = n * 26 + (ch.toUpperCase().charCodeAt(0) - 64);
  return n - 1;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Excel stores dates as days since 1899-12-30 (or 1904-01-01). Written without a time zone, as the cell shows it. */
function formatSerial(serial: number, date1904: boolean): string {
  const ms = Math.round((serial + (date1904 ? 24107 : 0) - 25569) * 86_400_000);
  const d = new Date(ms);
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  if (serial < 1) return time;
  return Number.isInteger(serial) ? date : `${date} ${time}`;
}

function csvField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

async function xlsxToCsv(buffer: ArrayBuffer): Promise<string> {
  const zip = await unzip(buffer);
  const read = async (path: string) => {
    const get = zip.get(path);
    return get ? xml(await get()) : null;
  };

  const workbook = await read("xl/workbook.xml");
  if (!workbook) throw new Error("This file is not a valid .xlsx workbook.");
  const date1904 = all(workbook, "workbookPr")[0]?.getAttribute("date1904") === "1";

  // The first sheet in the workbook's tab order, found through the workbook's relationships.
  const firstSheet = all(workbook, "sheet")[0];
  const relId =
    firstSheet?.getAttributeNS(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "id",
    ) ?? firstSheet?.getAttribute("r:id");
  const rels = await read("xl/_rels/workbook.xml.rels");
  const target =
    rels &&
    all(rels, "Relationship")
      .find((r) => r.getAttribute("Id") === relId)
      ?.getAttribute("Target");
  const sheetPath = target
    ? target.startsWith("/")
      ? target.slice(1)
      : `xl/${target.replace(/^\.\//, "")}`
    : "xl/worksheets/sheet1.xml";
  const sheet = await read(sheetPath);
  if (!sheet) throw new Error("Could not find the first sheet in this workbook.");

  const shared = await read("xl/sharedStrings.xml");
  const strings = shared
    ? all(shared, "si").map((si) =>
        all(si, "t")
          .map((t) => t.textContent ?? "")
          .join(""),
      )
    : [];

  const styles = await read("xl/styles.xml");
  const customFormats = new Map<number, string>();
  const dateStyles = new Set<number>();
  if (styles) {
    for (const f of all(styles, "numFmt")) {
      customFormats.set(Number(f.getAttribute("numFmtId")), f.getAttribute("formatCode") ?? "");
    }
    const cellXfs = all(styles, "cellXfs")[0];
    (cellXfs ? all(cellXfs, "xf") : []).forEach((xf, i) => {
      const id = Number(xf.getAttribute("numFmtId") ?? 0);
      const custom = customFormats.get(id);
      if (custom !== undefined ? isDateFormat(custom) : DATE_FORMAT_IDS.has(id)) dateStyles.add(i);
    });
  }

  const rows: string[][] = [];
  for (const row of all(sheet, "row")) {
    const cells: string[] = [];
    let next = 0;
    for (const c of all(row, "c")) {
      const ref = c.getAttribute("r");
      const col = ref ? columnIndex(ref) : next;
      next = col + 1;
      const type = c.getAttribute("t");
      const v = all(c, "v")[0]?.textContent ?? "";
      let value: string;
      if (type === "s") value = strings[Number(v)] ?? "";
      else if (type === "inlineStr")
        value = all(c, "t")
          .map((t) => t.textContent ?? "")
          .join("");
      else if (type === "b") value = v === "1" ? "TRUE" : "FALSE";
      else if (type === "str" || type === "e" || v === "") value = v;
      else if (dateStyles.has(Number(c.getAttribute("s") ?? 0)))
        value = formatSerial(Number(v), date1904);
      // Number() drops float noise such as 0.12900000000000001.
      else value = String(Number(v));
      cells[col] = value;
    }
    const filled = Array.from(cells, (x) => x ?? "");
    if (filled.some((x) => x.trim() !== "")) rows.push(filled);
  }
  if (rows.length === 0) throw new Error("The first sheet of this workbook is empty.");
  return rows.map((r) => r.map(csvField).join(",")).join("\n");
}
