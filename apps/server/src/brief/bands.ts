import type { AdvisoryText, Audience, BandKey } from "./types";

export interface Band {
  key: BandKey;
  en: string;
  hi: string;
  range: string;
}

/**
 * PM2.5 categories from the CPCB National Air Quality Index (24-hour breakpoints, µg/m³).
 * Applied here to the mean of the readings supplied, so it is a guide and not a formal AQI.
 */
export const BANDS: Record<BandKey, Band> = {
  good: { key: "good", en: "Good", hi: "अच्छा", range: "0-30 µg/m³" },
  satisfactory: { key: "satisfactory", en: "Satisfactory", hi: "संतोषजनक", range: "31-60 µg/m³" },
  moderate: { key: "moderate", en: "Moderate", hi: "मध्यम", range: "61-90 µg/m³" },
  poor: { key: "poor", en: "Poor", hi: "खराब", range: "91-120 µg/m³" },
  very_poor: { key: "very_poor", en: "Very Poor", hi: "बहुत खराब", range: "121-250 µg/m³" },
  severe: { key: "severe", en: "Severe", hi: "गंभीर", range: "above 250 µg/m³" },
  unknown: { key: "unknown", en: "Unknown", hi: "अज्ञात", range: "not enough reliable readings" },
};

export const BAND_SOURCE =
  "CPCB National AQI categories for PM2.5 (24-hour breakpoints), applied to the mean of the readings supplied";

export function bandForPm25(mean: number | null): BandKey {
  if (mean === null) return "unknown";
  const v = Math.round(mean);
  if (v <= 30) return "good";
  if (v <= 60) return "satisfactory";
  if (v <= 90) return "moderate";
  if (v <= 120) return "poor";
  if (v <= 250) return "very_poor";
  return "severe";
}

const BAND_ORDER: BandKey[] = ["good", "satisfactory", "moderate", "poor", "very_poor", "severe"];

export function bandRank(key: BandKey): number {
  return BAND_ORDER.indexOf(key);
}

type Guidance = Omit<AdvisoryText, "headline">;

/** Fixed health guidance. The model may reword it; it may not add or remove precautions. */
export const GUIDANCE: Record<BandKey, Guidance> = {
  good: {
    general: "Air quality is good. Normal outdoor activity is fine.",
    children: "Children can play outside as usual.",
    older_adults: "Older adults can go outside as usual.",
    sensitive:
      "People with asthma, or heart or lung conditions, can follow their normal routine. Keep any prescribed medicine with you.",
  },
  satisfactory: {
    general: "Air quality is acceptable for most people.",
    children: "Children can play outside. Watch for coughing or wheezing in children with asthma.",
    older_adults: "Older adults can go outside. Take a break if you feel breathless.",
    sensitive:
      "People who are sensitive to air pollution may feel mild discomfort. Keep reliever medicine within reach.",
  },
  moderate: {
    general:
      "Most people can continue outdoor activity. Cut back on long or heavy exercise outdoors if you cough or your throat feels irritated.",
    children:
      "Keep long, hard outdoor play short. Children with asthma should carry their reliever inhaler.",
    older_adults:
      "Older adults should avoid long walks along busy roads and rest if they feel breathless.",
    sensitive:
      "People with lung or heart conditions should reduce heavy outdoor effort and keep their medicines handy.",
  },
  poor: {
    general:
      "Everyone should cut down on heavy outdoor exercise. Avoid busy roads and places where waste is burned.",
    children:
      "Move sports and long play indoors. Children with asthma should stay indoors where possible.",
    older_adults: "Older adults should stay indoors for most of the day and avoid outdoor effort.",
    sensitive:
      "People with asthma, or heart or lung disease, should stay indoors, keep windows closed at peak pollution hours, and follow their doctor's plan. Seek medical help if symptoms get worse.",
  },
  very_poor: {
    general: "Avoid outdoor exercise. Limit time outside to what is necessary.",
    children: "Keep children indoors. Cancel outdoor sports and assemblies.",
    older_adults: "Older adults should stay indoors and go out only if necessary.",
    sensitive:
      "People with asthma, or heart or lung disease, should stay indoors, avoid any exertion, and contact a doctor if they have chest tightness, breathlessness or heavy coughing.",
  },
  severe: {
    general: "Avoid all outdoor physical activity. Stay indoors as much as possible.",
    children: "Keep children indoors. Stop outdoor school activity.",
    older_adults: "Older adults should stay indoors and avoid all outdoor activity.",
    sensitive:
      "People with asthma, or heart or lung disease, should stay indoors and get medical help promptly for chest pain, severe breathlessness, or wheezing that does not settle.",
  },
  unknown: {
    general:
      "There are not enough reliable readings to give an air quality band. Please follow the official CPCB or SAFAR bulletin for your city.",
    children: "Until the data is clear, keep children's outdoor play light and watch for coughing.",
    older_adults: "Until the data is clear, older adults should avoid long outdoor effort.",
    sensitive:
      "People with asthma, or heart or lung disease, should follow their doctor's plan and keep medicines handy.",
  },
};

export function fixedAdvisory(band: BandKey): AdvisoryText {
  return { headline: `Air quality: ${BANDS[band].en}`, ...GUIDANCE[band] };
}

export const AUDIENCE_LABEL: Record<Audience, string> = {
  ward_officer: "Ward officer",
  housing_society: "Housing society",
  school: "School",
};

/** What each audience can realistically do. Shown to the model so actions stay in the asker's power. */
export const AUDIENCE_LEVERS: Record<Audience, string> = {
  ward_officer:
    "Municipal ward team. Can: order road-dust control (sweeping, water sprinkling) and check construction sites for dust cover; enforce against open burning of waste or biomass; ask traffic police for diversions or idling checks; send alerts through ward channels, anganwadis and clinics; request extra sensors where data is missing; escalate to the pollution control board. Cannot: change school timetables or control private homes.",
  housing_society:
    "Residents' welfare association or society committee. Can: stop waste, leaf or garden burning on the premises; limit generator use; sprinkle water on internal roads and cover construction material; schedule dust-heavy cleaning outside peak hours; keep a clean-air room or closed community hall for elders; share the advisory on the society's groups; report hotspots with this brief's evidence to the ward office. Cannot: regulate public roads or other neighbourhoods.",
  school:
    "School management. Can: move sports, assembly and long outdoor breaks indoors; adjust timings away from peak pollution hours; keep windows closed at peak hours and ventilate when air is better; identify children with asthma and keep their inhalers accessible; inform parents; check bus idling at the gate. Cannot: enforce against pollution sources outside the campus, but can report them to the ward office.",
};
