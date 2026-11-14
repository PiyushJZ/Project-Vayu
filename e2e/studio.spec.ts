import { crc32, deflateRawSync } from "node:zlib";

import { type APIRequestContext, type Page, expect, test } from "@playwright/test";

const STUB_MODEL = "http://127.0.0.1:8788";

/** Switches the stub model's writing call off or back on. */
async function setModelDown(request: APIRequestContext, down: boolean) {
  const res = await request.post(`${STUB_MODEL}/__control`, { data: { failWrites: down } });
  expect(res.ok()).toBe(true);
}

/** Picks a sample from the sample menu. */
async function loadSample(page: Page, sample: string) {
  await page.getByRole("button", { name: /^(Load a sample|Sample [A-Z]:)/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp(`^Sample ${sample} `) }).click();
  await expect(page.getByLabel("Air quality table")).not.toBeEmpty();
}

/** Loads a sample table, optionally picks the audience, and starts a brief. */
async function generate(page: Page, sample: "A" | "B", audience?: string) {
  await loadSample(page, sample);
  if (audience) await page.getByRole("button", { name: audience }).click();
  await page.getByRole("button", { name: "Generate brief" }).click();
}

/** The number in the "Brief #n for a ..." heading. */
async function briefId(page: Page): Promise<number> {
  const heading = page.getByRole("heading", { name: /^Brief #\d+ for a / });
  await expect(heading).toBeVisible();
  return Number((await heading.innerText()).match(/#(\d+)/)![1]);
}

/** One titled section of the brief. */
const section = (page: Page, title: string) =>
  page.getByRole("region", { name: title, exact: true });

test.beforeEach(async ({ page, request }) => {
  await setModelDown(request, false);
  await page.goto("/");
});

test("loads the studio with the sample tables and nothing broken", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));
  await page.reload();

  await expect(page).toHaveTitle("Vayu");
  await expect(page.getByRole("heading", { level: 1, name: "Vayu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Vayu" }).locator("img")).toHaveAttribute(
    "src",
    "/vayu-logo.svg",
  );

  await expect(page.getByRole("button", { name: "Generate brief" })).toBeDisabled();

  // Every sample is in the menu with its date interval, and the trigger then names the one loaded.
  await page.getByRole("button", { name: "Load a sample" }).click();
  for (const [id, period] of [
    ["A", "3 to 5 Nov 2026"],
    ["B", "6 to 8 Nov 2026"],
    ["C", "9 to 11 Nov 2026"],
    ["D", "12 to 14 Nov 2026"],
    ["E", "1 to 31 Oct 2026"],
  ]) {
    await expect(
      page.getByRole("menuitemradio", { name: new RegExp(`^Sample ${id} · ${period}`) }),
    ).toBeVisible();
  }
  await page.getByRole("menuitemradio", { name: /^Sample C / }).click();
  await expect(page.getByRole("button", { name: "Sample C: 9 to 11 Nov 2026" })).toBeVisible();
  await expect(page.getByLabel("Air quality table")).toHaveValue(/^Timestamp\tMonitoring station/);
  await expect(page.getByRole("button", { name: /Ward officer/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(problems).toEqual([]);
});

/** A minimal .xlsx: one sheet with shared strings, a date-styled column and a deflated part. */
function xlsx(): Buffer {
  const parts: [string, string][] = [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    ],
    [
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Readings" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ],
    [
      "xl/styles.xml",
      `<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy hh:mm"/></numFmts><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="164" applyNumberFormat="1"/></cellXfs></styleSheet>`,
    ],
    [
      "xl/sharedStrings.xml",
      `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Station</t></si><si><t>Date/Time</t></si><si><t>PM2.5 (µg/m³)</t></si><si><t>Idgah Hills</t></si><si><r><t>TT </t></r><r><t>Nagar</t></r></si></sst>`,
    ],
    [
      "xl/worksheets/sheet1.xml",
      // 46330.25 is 4 Nov 2026 06:00 in Excel's date numbering.
      `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>` +
        `<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>` +
        [
          [3, 46330.25, 140],
          [3, 46330.5, 118],
          [4, 46330.25, 96.5],
          [4, 46330.5, 0.10000000000000001],
        ]
          .map(
            ([s, t, v], i) =>
              `<row r="${i + 2}"><c r="A${i + 2}" t="s"><v>${s}</v></c><c r="B${i + 2}" s="1"><v>${t}</v></c><c r="C${i + 2}"><v>${v}</v></c></row>`,
          )
          .join("") +
        `</sheetData></worksheet>`,
    ],
  ];
  const locals: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  parts.forEach(([name, text], i) => {
    const raw = Buffer.from(text);
    const deflate = i % 2 === 0;
    const data = deflate ? deflateRawSync(raw) : raw;
    const nameBuf = Buffer.from(name);
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0);
    head.writeUInt16LE(20, 4);
    head.writeUInt16LE(deflate ? 8 : 0, 8);
    head.writeUInt32LE(crc32(raw), 14);
    head.writeUInt32LE(data.length, 18);
    head.writeUInt32LE(raw.length, 22);
    head.writeUInt16LE(nameBuf.length, 26);
    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0);
    dir.writeUInt16LE(20, 4);
    dir.writeUInt16LE(20, 6);
    dir.writeUInt16LE(deflate ? 8 : 0, 10);
    dir.writeUInt32LE(crc32(raw), 16);
    dir.writeUInt32LE(data.length, 20);
    dir.writeUInt32LE(raw.length, 24);
    dir.writeUInt16LE(nameBuf.length, 28);
    dir.writeUInt32LE(offset, 42);
    locals.push(head, nameBuf, data);
    central.push(dir, nameBuf);
    offset += head.length + nameBuf.length + data.length;
  });
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(parts.length, 8);
  end.writeUInt16LE(parts.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

test("reads an .xlsx workbook into the table box and writes a brief from it", async ({ page }) => {
  await page.getByLabel("Open a .csv or .xlsx file").setInputFiles({
    name: "readings.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: xlsx(),
  });
  await expect(page.getByText("From readings.xlsx")).toBeVisible();
  await expect(page.getByLabel("Air quality table")).toHaveValue(
    [
      "Station,Date/Time,PM2.5 (µg/m³)",
      "Idgah Hills,2026-11-04 06:00,140",
      "Idgah Hills,2026-11-04 12:00,118",
      "TT Nagar,2026-11-04 06:00,96.5",
      "TT Nagar,2026-11-04 12:00,0.1",
    ].join("\n"),
  );
  await page.getByRole("button", { name: "Generate brief" }).click();
  await expect(
    page.getByRole("heading", { name: /^Brief #\d+ for a ward officer$/ }),
  ).toBeVisible();
});

test("reads a .csv file, including one saved in Windows-1252", async ({ page }) => {
  // "µg/m³" in Windows-1252, as Excel writes a plain CSV.
  const csv = Buffer.concat([
    Buffer.from("Station,Date,PM2.5 ("),
    Buffer.from([0xb5]),
    Buffer.from("g/m"),
    Buffer.from([0xb3]),
    Buffer.from(")\nTT Nagar,04/11/2026,98\n"),
  ]);
  await page
    .getByLabel("Open a .csv or .xlsx file")
    .setInputFiles({ name: "readings.csv", mimeType: "text/csv", buffer: csv });
  await expect(page.getByLabel("Air quality table")).toHaveValue(
    "Station,Date,PM2.5 (µg/m³)\nTT Nagar,04/11/2026,98\n",
  );
  // Editing the text means it no longer is the file as opened.
  await page.getByLabel("Air quality table").press("End");
  await page.getByLabel("Air quality table").pressSequentially("x");
  await expect(page.getByText("From readings.csv")).toBeHidden();
});

test("writes a brief for sample A and links every figure to its source rows", async ({ page }) => {
  await generate(page, "A");

  await expect(
    page.getByRole("heading", { name: /^Brief #\d+ for a ward officer$/ }),
  ).toBeVisible();
  await expect(page.getByText("Sample data. Station names are real")).toBeVisible();
  await expect(
    page.getByText(/^\d+ of 36 rows had a usable PM2\.5 reading\. \d+ rows have gaps/),
  ).toBeVisible();

  // Numbers come from code, so they are on screen before the model has written anything.
  await expect(
    section(page, "Stations and likely hotspot").getByRole("cell", {
      name: "Idgah Hills Likely hotspot",
    }),
  ).toBeVisible();
  await expect(
    section(page, "What changed since the last brief").getByText(
      /No earlier brief|Compared with brief #/,
    ),
  ).toBeVisible();

  const actions = section(page, "Priority actions");
  await expect(actions.getByText("Inspect the station with the highest readings")).toBeVisible();
  await expect(actions.getByRole("listitem")).toHaveCount(3);
  // Placeholders the model puts in a title are filled in like everywhere else.
  await expect(actions.getByText("Share the Very Poor advisory with residents")).toBeVisible();

  const note = section(page, "Internal briefing note");
  await expect(note.getByText("Stub model summary.")).toBeVisible();

  // A figure in the text opens the finding it came from, with the rows of the pasted table.
  await note
    .getByRole("button", { name: /^Show the source rows for F\d+$/ })
    .first()
    .click();
  const openFinding = section(page, "Findings and their source rows").locator("details[open]");
  await expect(openFinding).toHaveCount(1);
  await expect(openFinding.getByRole("columnheader", { name: "PM2.5 (µg/m³)" })).toBeVisible();
  await expect(openFinding.getByRole("row")).not.toHaveCount(1);

  // A finding from one row says so in the singular.
  const findings = section(page, "Findings and their source rows");
  await expect(findings.getByText("1 source row", { exact: true })).toBeVisible();
  await expect(findings.getByText("1 source rows", { exact: true })).toHaveCount(0);
});

test("shows the advisory in English and Hindi at both reading levels", async ({ page }) => {
  await generate(page, "A", "School");
  const advisory = section(page, "Citizen advisory");
  const article = advisory.getByRole("article");

  await expect(article).toHaveAttribute("lang", "en");
  await expect(article.getByRole("heading", { level: 4 })).toHaveText("Air quality is Very Poor");
  await expect(article.getByText("Cut down on hard exercise outside.")).toBeVisible();
  await expect(article.getByRole("button", { name: /Show the source rows/ })).toHaveCount(0);

  await advisory.getByRole("button", { name: "Standard" }).click();
  await expect(article.getByRole("button", { name: /Show the source rows/ })).toHaveCount(1);

  await advisory.getByRole("button", { name: "हिन्दी" }).click();
  await expect(article).toHaveAttribute("lang", "hi");
  await expect(article.getByRole("heading", { level: 4 })).toHaveText("हवा की गुणवत्ता बहुत खराब है");
  await expect(advisory.getByText("Machine-translated. Have a Hindi speaker review")).toBeVisible();
});

test("compares a second brief with the one before it", async ({ page }) => {
  await generate(page, "A");
  const first = await briefId(page);
  await expect(section(page, "Priority actions")).toBeVisible();

  await generate(page, "B", "Housing society");
  await expect(
    page.getByRole("heading", { name: `Brief #${first + 1} for a housing society` }),
  ).toBeVisible();

  const changed = section(page, "What changed since the last brief");
  await expect(changed.getByText(`Compared with brief #${first} (Sample A`)).toBeVisible();
  await expect(changed.getByRole("row", { name: /Idgah Hills.*too few readings/ })).toBeVisible();
  await expect(page.getByText("mg/m³ (converted to µg/m³)")).toBeHidden(); // inside a closed disclosure
  await page.getByText("How the columns were read").click();
  await expect(
    page.getByText(/column 4: PM2\.5 \(mg\/m3\), unit mg\/m³ \(converted/),
  ).toBeVisible();
});

test("explains a table it cannot use", async ({ page }) => {
  await page.getByLabel("Air quality table").fill("Station,Reading\nA,1\nB,2");
  await page.getByRole("button", { name: "Generate brief" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    'Could not find a PM2.5 column. The columns found were: Station, Reading. Add a column whose header contains "PM2.5".',
  );
  await expect(page.getByRole("button", { name: "Generate brief" })).toBeEnabled();
});

test("falls back to code-written guidance when the model fails, then recovers on retry", async ({
  page,
  request,
}) => {
  await setModelDown(request, true);
  await generate(page, "A");

  const alert = page.getByRole("alert");
  await expect(alert).toContainText("The model could not write the brief (OpenRouter returned 503");
  await expect(alert).toContainText("The statistics above are still correct");
  await expect(
    section(page, "Stations and likely hotspot").getByRole("cell", {
      name: "Idgah Hills Likely hotspot",
    }),
  ).toBeVisible();
  await expect(
    section(page, "Priority actions").getByText("These actions were written by code"),
  ).toBeVisible();
  await expect(
    section(page, "Citizen advisory").getByText(/^Fixed English guidance is shown because/),
  ).toBeVisible();

  await setModelDown(request, false);
  await alert.getByRole("button", { name: "Try writing again" }).click();

  await expect(
    section(page, "Priority actions").getByText("Share the Very Poor advisory with residents"),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("remembers the chosen theme", async ({ page }) => {
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
});

test("keeps API and page routes apart on one origin", async ({ page, request }) => {
  const health = await request.get("/api/health");
  expect(await health.text()).toBe("OK");

  const missing = await request.get("/api/nope");
  expect(missing.status()).toBe(404);
  expect(await missing.json()).toEqual({ error: "No API route for GET /api/nope." });

  // A path the Worker has no file for still gets the app, so client-side routes survive a reload.
  await page.goto("/some/deep/link");
  await expect(page.getByRole("link", { name: "Vayu" })).toBeVisible();
});

test("fits a phone screen without sideways scrolling @mobile", async ({ page }) => {
  await generate(page, "A");
  await expect(section(page, "Citizen advisory")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  // The hotspot marker must not need sideways scrolling inside the stations table.
  const marker = section(page, "Stations and likely hotspot").getByText("Likely hotspot", {
    exact: true,
  });
  const box = (await marker.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);

  // The comparison table wraps instead of scrolling, so every change reads without a swipe.
  await generate(page, "B");
  const change = section(page, "What changed since the last brief").getByRole("columnheader", {
    name: "Change",
  });
  const changeBox = (await change.boundingBox())!;
  expect(changeBox.x + changeBox.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});
