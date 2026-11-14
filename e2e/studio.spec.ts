import { type APIRequestContext, type Page, expect, test } from "@playwright/test";

const STUB_MODEL = "http://127.0.0.1:8788";

/** Switches the stub model's writing call off or back on. */
async function setModelDown(request: APIRequestContext, down: boolean) {
  const res = await request.post(`${STUB_MODEL}/__control`, { data: { failWrites: down } });
  expect(res.ok()).toBe(true);
}

/** Loads a sample table, optionally picks the audience, and starts a brief. */
async function generate(page: Page, sample: "A" | "B", audience?: string) {
  await page.getByRole("button", { name: `Load Sample ${sample}` }).click();
  await expect(page.getByLabel("Air quality table")).not.toBeEmpty();
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

  await expect(page).toHaveTitle("Civic Air Quality Briefing Studio");
  await expect(
    page.getByRole("heading", { level: 1, name: "Civic Air Quality Briefing Studio" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Load Sample A" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Load Sample B" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Ward officer/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Generate brief" })).toBeDisabled();
  expect(problems).toEqual([]);
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
  await expect(alert).toContainText("The model could not write this brief");
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
  await expect(page.getByRole("link", { name: "Briefing Studio" })).toBeVisible();
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
