/**
 * Sample tables. Station names are real Bhopal CPCB monitoring stations; every reading is invented.
 * Each table carries deliberate mess so the demo exercises gap and suspect-reading handling.
 */

export interface Sample {
  id: string;
  /** Stored on the brief, so it names the sample and its period. */
  label: string;
  /** The date interval the readings cover, shown in the sample picker. */
  period: string;
  /** How the table is laid out and what mess it carries. */
  description: string;
  text: string;
}

const HOURS = [6, 12, 18, 22] as const;
const HOUR_OFFSET: Record<number, number> = { 6: 14, 12: -22, 18: 10, 22: 24 };
const pad = (n: number) => String(n).padStart(2, "0");
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Cell {
  station?: string;
  time?: string;
  pm25?: string;
  pm10?: string;
  note?: string;
}

function sampleA(): string {
  const stations = [
    { names: ["T T Nagar", "TT Nagar", "T.T. Nagar, Bhopal - MPPCB"], base: 105 },
    { names: ["Paryavaran Parisar"], base: 82 },
    { names: ["Idgah Hills"], base: 126 },
  ];
  const fmt = [
    (d: number, h: number) => `${pad(d)}/11/2026 ${pad(h)}:00`,
    (d: number, h: number) => `2026-11-${pad(d)} ${pad(h)}:00`,
    (d: number, h: number) => `${d} Nov 2026 ${pad(h)}:00`,
  ];
  // Overrides keyed by "station,day,hourIndex".
  const over: Record<string, Cell> = {
    "0,0,1": { pm25: "NA" },
    "0,0,3": { pm25: "0.129 mg/m3" },
    "0,2,2": { time: "05/11/26 ??:??" },
    "1,0,0": { note: "sensor recalibrated" },
    "1,1,2": { pm25: "" },
    "1,2,1": { pm25: "212", pm10: "180" },
    "2,1,0": { pm25: "-5" },
    "2,2,0": { pm25: "131", note: "power cut?" },
    "2,2,1": { pm25: "131" },
    "2,2,2": { pm25: "131" },
    "2,2,3": { pm25: "131" },
  };
  const lines = ["Station,Date/Time,PM2.5 (µg/m³),PM10 (µg/m³),Remarks"];
  stations.forEach((s, si) => {
    for (let day = 0; day < 3; day++) {
      HOURS.forEach((h, hi) => {
        const pm25 = s.base + day * 8 + HOUR_OFFSET[h]!;
        const o = over[`${si},${day},${hi}`] ?? {};
        const name = s.names[(day * 4 + hi) % s.names.length]!;
        lines.push(
          [
            name.includes(",") ? `"${name}"` : name,
            o.time ?? fmt[si]!(3 + day, h),
            o.pm25 ?? String(pm25),
            o.pm10 ?? String(Math.round(pm25 * 1.7 + 20)),
            o.note ?? "",
          ].join(","),
        );
      });
    }
  });
  return lines.join("\n");
}

function sampleB(): string {
  const stations = [
    { name: "TT Nagar", base: 128, count: 12 },
    { name: "Paryavaran Parisar, Bhopal - MPPCB", base: 90, count: 12 },
    { name: "Idgah Hills", base: 152, count: 2 },
  ];
  const over: Record<string, Cell> = {
    "0,1,1": { pm25: "BDL" },
    "1,2,3": { pm25: "<5" },
    "0,0,0": { note: "post-festival period" },
    "2,0,1": { note: "station offline from 7 Nov" },
  };
  const lines = ["Site;Reading time;PM10 (ug/m3);PM2.5 (mg/m3);Notes"];
  stations.forEach((s, si) => {
    for (let n = 0; n < s.count; n++) {
      const day = Math.floor(n / 4);
      const hi = n % 4;
      const h = HOURS[hi]!;
      const pm25 = s.base + day * 5 + HOUR_OFFSET[h]!;
      const o = over[`${si},${day},${hi}`] ?? {};
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const time = `${6 + day}-${MON[10]}-2026 ${pad(h12)}:00 ${ampm}`;
      lines.push(
        [
          s.name,
          time,
          String(Math.round(pm25 * 1.7 + 20)),
          o.pm25 ?? (pm25 / 1000).toFixed(3),
          o.note ?? "",
        ].join(";"),
      );
    }
  });
  return lines.join("\n");
}

function sampleC(): string {
  const stations = [
    { name: "TT Nagar", base: 96 },
    { name: "Paryavaran Parisar", base: 71 },
    { name: "Idgah Hills", base: 112 },
  ];
  const over: Record<string, Cell> = {
    "0,0,2": { pm25: "98,5" },
    "0,2,0": { station: "" },
    "1,1,1": { pm25: "—", pm10: "—" },
    "1,1,2": { pm25: "—", pm10: "—" },
    "2,0,3": { time: "2026-11-09T22:00 IST" },
    "2,1,1": { pm25: "1450", note: "check" },
    "2,2,2": { note: "cleaning drive nearby" },
  };
  const lines = ["Timestamp\tMonitoring station\tPM 2.5 µg/m³\tPM 10 µg/m³\tComment"];
  stations.forEach((s, si) => {
    for (let day = 0; day < 3; day++) {
      HOURS.forEach((h, hi) => {
        const pm25 = s.base - day * 6 + HOUR_OFFSET[h]!;
        const o = over[`${si},${day},${hi}`] ?? {};
        lines.push(
          [
            o.time ?? `2026-11-${pad(9 + day)}T${pad(h)}:00`,
            o.station ?? s.name,
            o.pm25 ?? String(pm25),
            o.pm10 ?? String(Math.round(pm25 * 1.6 + 25)),
            o.note ?? "",
          ].join("\t"),
        );
      });
    }
  });
  return lines.join("\n");
}

function sampleD(): string {
  const stations = [
    { name: "T.T. Nagar", base: 74 },
    { name: "Paryavaran Parisar", base: 58 },
    { name: "Idgah Hills", base: 88 },
  ];
  const over: Record<string, Cell> = {
    "0,1,3": { pm25: ">500" },
    "1,0,0": { pm25: "NA" },
    "2,1,0": { pm25: "88" },
    "2,1,1": { pm25: "88" },
    "2,1,2": { pm25: "88" },
    "2,1,3": { pm25: "88", note: "value not changing" },
  };
  const lines = ["| Time | PM10 | Station | PM2.5 (µg/m3) | Remarks |", "|---|---|---|---|---|"];
  stations.forEach((s, si) => {
    for (let day = 0; day < 3; day++) {
      HOURS.forEach((h, hi) => {
        const pm25 = s.base - day * 4 + HOUR_OFFSET[h]!;
        const o = over[`${si},${day},${hi}`] ?? {};
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const cells = [
          `Nov ${12 + day}, 2026 ${h12}:00 ${ampm}`,
          String(Math.round(pm25 * 1.8 + 15)),
          s.name,
          o.pm25 ?? String(pm25),
          o.note ?? "",
        ];
        lines.push(`| ${cells.join(" | ")} |`);
      });
    }
  });
  return lines.join("\n");
}

/** Daily averages for a month, laid out in space-aligned columns as when copied from a PDF bulletin. */
function sampleE(): string {
  const stations = [
    { name: "TT Nagar", base: 58 },
    { name: "Paryavaran Parisar", base: 44 },
    { name: "Idgah Hills", base: 66 },
  ];
  // Paryavaran Parisar was offline from 14 to 19 Oct; a few other days are not reported.
  const missing = new Set(["1,14", "1,15", "1,16", "1,17", "1,18", "1,19", "0,5", "2,22", "2,23"]);
  const wobble = [3, -4, 6, -2, 0, 5, -5, 2, -3, 4];
  const cols = [12, 22, 10, 10];
  const row = (cells: string[]) =>
    cells.map((c, i) => (i < cells.length - 1 ? c.padEnd(cols[i]!) : c)).join("");
  const lines = [row(["Date", "Station", "PM2.5", "PM10"])];
  stations.forEach((s, si) => {
    for (let d = 1; d <= 31; d++) {
      // Readings climb through the month as the weather cools and the festival season starts.
      const pm25 = Math.round(s.base + d * 1.6 + wobble[(d + si) % wobble.length]!);
      const gap = missing.has(`${si},${d}`);
      lines.push(
        row([
          `${pad(d)}-10-2026`,
          s.name,
          gap ? "ND" : String(pm25),
          gap ? "ND" : String(Math.round(pm25 * 1.9 + 10)),
        ]),
      );
    }
  });
  return lines.join("\n");
}

export const SAMPLES: Sample[] = [
  {
    id: "A",
    label: "Sample A: Bhopal, 3 to 5 Nov 2026",
    period: "3 to 5 Nov 2026",
    description: "Comma-separated, three date formats, gaps and a stuck sensor",
    text: sampleA(),
  },
  {
    id: "B",
    label: "Sample B: Bhopal, 6 to 8 Nov 2026",
    period: "6 to 8 Nov 2026",
    description: "Semicolon-separated, PM2.5 in mg/m³, a station that went offline",
    text: sampleB(),
  },
  {
    id: "C",
    label: "Sample C: Bhopal, 9 to 11 Nov 2026",
    period: "9 to 11 Nov 2026",
    description: "Tab-separated, decimal commas, an impossible spike, a missing station name",
    text: sampleC(),
  },
  {
    id: "D",
    label: "Sample D: Bhopal, 12 to 14 Nov 2026",
    period: "12 to 14 Nov 2026",
    description: "Markdown table, columns reordered, 12-hour times, a capped reading",
    text: sampleD(),
  },
  {
    id: "E",
    label: "Sample E: Bhopal, 1 to 31 Oct 2026",
    period: "1 to 31 Oct 2026",
    description: "Daily averages for a month, space-aligned columns, a week offline",
    text: sampleE(),
  },
];
