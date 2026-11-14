/**
 * Made-up tables for the tests. Readings are invented; each table carries deliberate mess (three date formats,
 * mg/m3 cells, a stuck sensor, a station that goes offline) so parsing and flagging can be checked row by row.
 * The samples users see are real readings in samples.ts.
 */

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

export function messyA(): string {
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

export function messyB(): string {
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
