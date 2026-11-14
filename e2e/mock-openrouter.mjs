// Stands in for OpenRouter during the browser tests, so they need no API key and always get the same text.
// The Worker is pointed here through OPENROUTER_BASE_URL (see playwright.config.ts).
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_OPENROUTER_PORT ?? 8788);

/** Tests switch this through POST /__control to see what the app does when the model is down. */
let failWrites = false;

/** Finds the columns from the "index: header" lines of the mapping prompt. */
function mappingReply(prompt) {
  const headers = [...prompt.matchAll(/^(\d+): (.*)$/gm)].map((m) => ({
    index: Number(m[1]),
    header: m[2],
  }));
  const find = (re) => headers.find((h) => re.test(h.header)) ?? null;
  const unit = (h) =>
    !h
      ? "unspecified"
      : /mg/i.test(h.header)
        ? "mg/m3"
        : /[µμu]g/i.test(h.header)
          ? "ug/m3"
          : "unspecified";
  const pm25 = find(/pm\s*2\.?5/i);
  const pm10 = find(/pm\s*10/i);
  return {
    station: find(/station|site/i)?.index ?? null,
    timestamp: find(/date|time/i)?.index ?? null,
    pm25: pm25?.index ?? null,
    pm10: pm10?.index ?? null,
    pm25_unit: unit(pm25),
    pm10_unit: unit(pm10),
  };
}

/** Builds a brief that passes every check in write.ts: no typed digits, and only finding ids from the prompt. */
function writeReply(prompt) {
  const ids = [...prompt.matchAll(/^(F\d+) \| /gm)].map((m) => m[1]);
  const [first, second = first, third = first] = ids;
  const last = ids.at(-1);
  const english = (standard) => ({
    headline: "Air quality is {BAND}",
    general: standard
      ? `Cut down on long or hard exercise outdoors. The readings show {${first}}.`
      : "Cut down on hard exercise outside.",
    children: "Keep outdoor play short.",
    older_adults: "Avoid long walks near busy roads.",
    sensitive: "Keep your usual medicines close.",
  });
  const hindi = (standard) => ({
    headline: "हवा की गुणवत्ता {BAND} है",
    general: standard
      ? `बाहर लंबी या भारी कसरत कम करें। आँकड़े बताते हैं: {${first}}।`
      : "बाहर भारी कसरत कम करें।",
    children: "बाहर खेल का समय छोटा रखें।",
    older_adults: "व्यस्त सड़कों के पास लंबी सैर से बचें।",
    sensitive: "अपनी रोज़ की दवाइयाँ पास रखें।",
  });
  return {
    actions: [
      {
        title: "Inspect the station with the highest readings",
        detail: `Send a team to check for local dust or smoke. The data shows {${second}}.`,
        who: "Field team",
        timeframe: "today",
        finding_ids: [second],
      },
      {
        title: "Share the {BAND} advisory with residents",
        detail: "Post it on notice boards and messaging groups.",
        who: "Communications lead",
        timeframe: "today",
        finding_ids: [first],
      },
      {
        title: "Fix the gaps in the monitoring data",
        detail: `Ask the monitoring agency about missing and unreliable readings: {${third}}.`,
        who: "Data officer",
        timeframe: "this week",
        finding_ids: [third],
      },
    ],
    note: {
      headline: "Air quality was {BAND} over this period",
      summary: `Stub model summary. The overall picture: {${first}}.`,
      hotspots_and_trend: `The station to watch: {${second}}. This is the highest mean, not a located source.`,
      data_quality: `Read these figures with care: {${third}}.`,
      what_changed: prompt.includes("There is no earlier brief")
        ? "No earlier brief to compare."
        : `Compared with the earlier brief: {${last}}.`,
    },
    advisory: {
      en: { simple: english(false), standard: english(true) },
      hi: { simple: hindi(false), standard: hindi(true) },
    },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });

  if (req.method === "POST" && req.url === "/__control") {
    failWrites = Boolean(JSON.parse(await readBody(req)).failWrites);
    return send(res, 200, { failWrites });
  }

  if (req.method === "POST" && req.url === "/chat/completions") {
    const { messages } = JSON.parse(await readBody(req));
    const system = messages.find((m) => m.role === "system")?.content ?? "";
    const user = messages.find((m) => m.role === "user")?.content ?? "";
    const isMapping = system.startsWith("You map the columns");
    if (!isMapping && failWrites) {
      return send(res, 503, { error: { message: "stub model is switched off" } });
    }
    const reply = isMapping ? mappingReply(user) : writeReply(user);
    return send(res, 200, {
      model: "stub/model",
      choices: [{ message: { content: JSON.stringify(reply) }, finish_reason: "stop" }],
    });
  }

  send(res, 404, { error: { message: `no stub for ${req.method} ${req.url}` } });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Stub OpenRouter listening on http://127.0.0.1:${PORT}`);
});
