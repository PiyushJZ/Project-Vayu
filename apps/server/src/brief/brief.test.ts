import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { analyze } from "./analyze";
import { createBrief, writeForBrief } from "./pipeline";
import { SAMPLES } from "./samples";
import { guessMapping, parseNumber, parseTable, parseTimestamp } from "./table";
import { checkText } from "./write";
import { openStore } from "../store";

const sampleA = SAMPLES[0]!.text;
const sampleB = SAMPLES[1]!.text;
const heuristic = async (t: ReturnType<typeof parseTable>) => guessMapping(t.headers, "test");
const ms = (iso: string) => Date.parse(`${iso}Z`);

describe("parsing", () => {
  it("detects comma and semicolon tables and keeps quoted commas together", () => {
    const a = parseTable(sampleA);
    assert.equal(a.headers.length, 5);
    assert.equal(a.rows.length, 36);
    const b = parseTable(sampleB);
    assert.equal(b.headers[0], "Site");
    assert.equal(b.rows.length, 26);
    assert.equal(b.rows[12]![0], "Paryavaran Parisar, Bhopal - MPPCB");
  });

  it("reads messy numbers", () => {
    assert.deepEqual(parseNumber("142"), { ok: true, value: 142, unit: null });
    assert.deepEqual(parseNumber("0.129 mg/m3"), { ok: true, value: 0.129, unit: "mg" });
    assert.deepEqual(parseNumber("85 µg/m³"), { ok: true, value: 85, unit: "ug" });
    assert.deepEqual(parseNumber("1,234.5"), { ok: true, value: 1234.5, unit: null });
    assert.deepEqual(parseNumber("142,5"), { ok: true, value: 142.5, unit: null });
    assert.deepEqual(parseNumber("-5"), { ok: true, value: -5, unit: null });
    for (const gap of ["", "NA", "n/a", "--", "BDL", "<5", "abc"])
      assert.equal(parseNumber(gap).ok, false, gap);
  });

  it("reads mixed date formats, day first", () => {
    assert.equal(parseTimestamp("2026-11-03 06:00"), ms("2026-11-03T06:00"));
    assert.equal(parseTimestamp("03/11/2026 06:00"), ms("2026-11-03T06:00"));
    assert.equal(parseTimestamp("3 Nov 2026 06:00"), ms("2026-11-03T06:00"));
    assert.equal(parseTimestamp("6-Nov-2026 10:00 PM"), ms("2026-11-06T22:00"));
    assert.equal(parseTimestamp("12:30 AM"), null);
    assert.equal(parseTimestamp("31/02/2026 06:00"), null);
    assert.equal(parseTimestamp("05/11/26 ??:??"), null);
  });
});

describe("analysis of sample A", () => {
  const table = parseTable(sampleA);
  const a = analyze(table, guessMapping(table.headers, "test")!, null);

  it("merges station spellings", () => {
    assert.deepEqual(a.stations.map((s) => s.name).sort(), [
      "Idgah Hills",
      "Paryavaran Parisar",
      "T T Nagar",
    ]);
  });

  it("flags gaps and suspect readings against the exact rows", () => {
    const gapRows = Object.entries(a.rowFlags)
      .filter(([, f]) => f.some((x) => x.kind === "gap"))
      .map(([r]) => +r);
    const suspectRows = Object.entries(a.rowFlags)
      .filter(([, f]) => f.some((x) => x.kind === "suspect"))
      .map(([r]) => +r);
    assert.deepEqual(
      gapRows.sort((x, y) => x - y),
      [2, 11, 19],
    );
    assert.deepEqual(
      suspectRows.sort((x, y) => x - y),
      [22, 29, 33, 34, 35, 36],
    );
  });

  it("converts a cell in mg/m3 and keeps a row whose timestamp is unreadable", () => {
    const tt = a.stations.find((s) => s.name === "T T Nagar")!;
    assert.equal(tt.validPm25, 11);
    assert.equal(tt.mean, 122.8);
    assert.ok(tt.rowIds.includes(11), "value in the row with a bad timestamp is still used");
  });

  it("names the hotspot from stations with enough valid readings and sets the band", () => {
    assert.equal(a.stations[0]!.name, "Idgah Hills");
    assert.equal(a.stations[0]!.validPm25, 7);
    assert.equal(a.band, "very_poor");
    const hotspot = a.findings.find((f) => f.kind === "hotspot")!;
    assert.match(hotspot.display, /^Idgah Hills \(mean 135 µg\/m³ over 7 valid readings\)$/);
    assert.deepEqual(hotspot.rowIds, a.stations[0]!.rowIds);
  });

  it("gives every finding a unique id and no comparison on a first run", () => {
    const ids = a.findings.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(a.comparison, null);
  });
});

describe("pipeline with an in-memory store", () => {
  const stores: ReturnType<typeof openStore>[] = [];
  const fresh = () => {
    const s = openStore(":memory:");
    stores.push(s);
    return s;
  };
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
    while (stores.length) stores.pop()!.close();
  });

  it("compares sample B with sample A and handles mg/m3 and a station with too few readings", async () => {
    const store = fresh();
    const first = await createBrief(store, { text: sampleA, audience: "ward_officer" }, heuristic);
    assert.equal(first.comparison, null);
    assert.equal(first.sample, "A");

    const second = await createBrief(store, { text: sampleB, audience: "school" }, heuristic);
    assert.equal(second.sample, "B");
    assert.equal(second.mapping.pm25Unit, "mg/m3");
    const idgah = second.stations.find((s) => s.name === "Idgah Hills")!;
    assert.equal(idgah.qualifies, false);
    assert.equal(
      second.stations[0]!.name,
      "TT Nagar",
      "the hotspot moves because Idgah Hills has too few readings",
    );
    const c = second.comparison!;
    assert.equal(c.hotspot.curr, "TT Nagar");
    assert.match(c.hotspot.note!, /Idgah Hills now has too few valid readings/);
    assert.equal(c.stations.find((s) => s.station === "Idgah Hills")!.status, "too few readings");
    assert.equal(c.stations.find((s) => s.station === "TT Nagar")!.status, "higher");
    assert.match(
      second.findings.find((f) => f.kind === "change_hotspot")!.display,
      /not a like-for-like comparison/,
    );
    assert.match(
      second.findings.find((f) => f.kind === "change_overall")!.display,
      /^(about the same as|higher than|lower than) brief #/,
    );
    assert.equal(c.previousId, first.id);
    assert.equal(c.hotspot.prev, "Idgah Hills");
    assert.equal(c.hotspot.changed, true);
    assert.ok(
      second.findings.some((f) => f.kind === "change_hotspot" && f.prevBriefId === first.id),
    );
    assert.deepEqual(
      store.get(second.id)!.findings.map((f) => f.id),
      second.findings.map((f) => f.id),
    );
  });

  it("rejects a table with no PM2.5 column", async () => {
    await assert.rejects(
      createBrief(fresh(), { text: "Station,Reading\nA,1\nB,2", audience: "school" }, heuristic),
      /Could not find a PM2\.5 column/,
    );
  });

  it("keeps model text that passes every check and replaces text that does not", async () => {
    const store = fresh();
    const brief = await createBrief(
      store,
      { text: sampleA, audience: "housing_society" },
      heuristic,
    );
    const id = (kind: string) => brief.findings.find((f) => f.kind === kind)!.id;

    const adv = (extra: Partial<Record<string, string>> = {}, std = false) => ({
      headline: "Air is {BAND} today",
      general: std ? `The mean was {${id("overall_mean")}}.` : "Cut down on hard exercise outside.",
      children: "Keep play short.",
      older_adults: "Avoid long walks.",
      sensitive: "Keep medicines close.",
      ...extra,
    });
    const hindi = (extra: Partial<Record<string, string>> = {}, std = false) => ({
      headline: "आज हवा {BAND} है",
      general: std ? `औसत {${id("overall_mean")}} रहा।` : "बाहर भारी कसरत कम करें।",
      children: "खेल छोटा रखें।",
      older_adults: "लंबी सैर से बचें।",
      sensitive: "दवाइयाँ पास रखें।",
      ...extra,
    });
    const reply = {
      actions: [
        {
          title: "Check the hotspot",
          detail: `Look at {${id("hotspot")}}.`,
          who: "Society committee",
          timeframe: "this week",
          finding_ids: [id("hotspot")],
        },
        {
          title: "Invented figure",
          detail: "Levels hit 300 yesterday.",
          who: "Society committee",
          timeframe: "today",
          finding_ids: [id("band")],
        },
        {
          title: "Ungrounded",
          detail: "Do something.",
          who: "Society committee",
          timeframe: "today",
          finding_ids: ["F999"],
        },
        {
          title: "Share advisory",
          detail: "Post the {BAND} advisory.",
          who: "Society committee",
          timeframe: "today",
          finding_ids: [id("band")],
        },
      ],
      note: {
        headline: "Air was {BAND}",
        summary: `Period {${id("period")}}.`,
        hotspots_and_trend: "The mean rose to 150.",
        data_quality: `Gaps: {${id("gaps")}}.`,
        what_changed: "Better than before.",
      },
      advisory: {
        en: { simple: adv(), standard: adv({}, true) },
        hi: {
          simple: hindi({ children: "बच्चे 2 घंटे खेलें।" }),
          standard: hindi({}, true),
        },
      },
    };
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "```json\n" + JSON.stringify(reply) + "\n```" } }],
        }),
        {
          status: 200,
        },
      )) as typeof fetch;

    const done = await writeForBrief(store, brief.id);
    const w = done.written!;
    assert.equal(done.status, "fallback");
    assert.equal(w.actionsSource, "model");
    assert.deepEqual(
      w.actions.map((a) => a.title),
      ["Check the hotspot", "Share advisory"],
    );
    assert.equal(w.note.summary.source, "model");
    assert.equal(
      w.note.hotspots_and_trend.source,
      "template",
      "a number written outside a placeholder is replaced",
    );
    assert.equal(w.note.what_changed.text, "No earlier brief to compare.");
    assert.equal(w.advisory.en.simple.source, "model");
    assert.equal(w.advisory.hi.simple.source, "fixed", "Hindi text with a digit is replaced");
    assert.match(w.advisory.hi.simple.warning!, /failed an automatic check/);
    assert.equal(w.advisory.hi.standard.source, "model");
    assert.equal(store.get(brief.id)!.written!.advisory.hi.simple.source, "fixed");
  });

  it("falls back to labelled code text when the model call fails", async () => {
    const store = fresh();
    const brief = await createBrief(store, { text: sampleA, audience: "school" }, heuristic);
    globalThis.fetch = (async () => new Response("nope", { status: 401 })) as typeof fetch;
    const done = await writeForBrief(store, brief.id);
    assert.equal(done.status, "fallback");
    assert.match(done.writeError!, /401/);
    assert.equal(done.written!.actionsSource, "template");
    assert.equal(done.written!.advisory.hi.simple.source, "fixed");
    assert.ok(done.written!.actions.length >= 2);
  });
});

describe("checkText", () => {
  const ctx = { ids: new Set(["F1", "F3"]), names: ["Sector 5 Park", "Idgah Hills"] };
  const ok = (t: string, allow = true) => checkText(t, ctx, allow).ok;

  it("accepts placeholders, station names with digits, and PM labels", () => {
    assert.ok(ok("Air is {BAND} at Sector 5 Park."));
    assert.ok(ok("PM2.5 and PM10 were high: {F3}."));
    assert.ok(ok("पीएम 2.5 का स्तर {F3} रहा।"));
  });

  it("rejects stray numbers in either script, unknown ids and simple-level findings", () => {
    assert.equal(ok("It was 142 today."), false);
    assert.equal(ok("स्तर १४२ रहा।"), false);
    assert.equal(ok("See {F2}."), false);
    assert.equal(ok("See {F3}.", false), false);
    assert.equal(ok("See {oops}."), false);
    assert.equal(ok("Open brace { here"), false);
  });
});
