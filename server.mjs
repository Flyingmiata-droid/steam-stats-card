// Steam stats-card tool — server.
// Routes:
//   GET /api/card?id=<steamid|vanity>  -> card data (summary + owned games -> stats)
//   GET /api/avatar?u=<steam avatar url> -> same-origin proxy so canvas export isn't tainted
// Steam key stays server-side. Run: npm start

import express from "express";
import fs from "node:fs";

const KEY = process.env.STEAM_API_KEY;
if (!KEY) throw new Error("Missing STEAM_API_KEY. Copy .env.example to .env and add your key.");

const app = express();
app.use(express.static("public"));
app.use(express.json());

const isSteamId64 = (s) => /^\d{17}$/.test(s);
const JUNK = /test server|playtest|staging|beta|legacy edition|sotf|survival of the fittest|dedicated server/i;
const cleanName = (n = "") => n.replace(/^Tom Clancy's\s+/i, "").replace(/[™®]/g, "").replace(/\s+/g, " ").trim();

async function resolveToSteamId64(input) {
  const id = input.trim();
  if (isSteamId64(id)) return id;
  const vanity = id.replace(/\/+$/, "").split("/").pop();
  const r = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(vanity)}`);
  const j = await r.json();
  return j?.response?.success === 1 ? j.response.steamid : null;
}

// Avg Steam account leaves ~33% of its library unplayed (Steam Global Stats Project / gamediscover).
const AVG_UNPLAYED_PCT = 33;

const TYPES = {
  "The Casual":     "Quality over quantity. Mostly quality.",
  "The Loyalist":   "You find your game and you commit.",
  "The Marathoner": "You actually finish what you start.",
  "The Collector":  "Your backlog could outlive you.",
  "The Regular":    "A balanced gaming diet.",
};

function gamerType({ owned, played, totalHours, topConcentration }) {
  const ratio = owned ? played / owned : 0;
  if (totalHours < 20) return "The Casual";
  if (topConcentration > 0.5) return "The Loyalist";
  if (ratio >= 0.7 && totalHours >= 200) return "The Marathoner";
  if (ratio < 0.4) return "The Collector";          // <- backlog-anxiety user; tagged on signup
  return "The Regular";
}

// Honest social-comparison line vs the real benchmark.
function compareLine(unplayedPct) {
  if (unplayedPct <= AVG_UNPLAYED_PCT - 8)
    return `Only ${unplayedPct}% of your library is unplayed. The average gamer leaves ${AVG_UNPLAYED_PCT}%.`;
  if (unplayedPct >= AVG_UNPLAYED_PCT + 8)
    return `${unplayedPct}% of your library is unplayed — above the ${AVG_UNPLAYED_PCT}% average. Respect the pile.`;
  return `${unplayedPct}% unplayed — right around the ${AVG_UNPLAYED_PCT}% average.`;
}

app.get("/api/card", async (req, res) => {
  try {
    const input = req.query.id;
    if (!input) return res.status(400).json({ error: "Pass ?id=<steam id or vanity name>" });
    const steamid = await resolveToSteamId64(String(input));
    if (!steamid) return res.status(404).json({ error: "Couldn't resolve that Steam ID or vanity name." });

    const [sumR, gamesR] = await Promise.all([
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${KEY}&steamids=${steamid}`).then(r => r.json()),
      fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true&format=json`).then(r => r.json()),
    ]);

    const player = sumR?.response?.players?.[0];
    const games = gamesR?.response?.games;
    if (!games) {
      return res.status(403).json({ error: "No games returned — profile/game details are likely private. Set them to Public and retry.", steamid });
    }

    const totalMin = games.reduce((s, g) => s + (g.playtime_forever || 0), 0);
    const played = games.filter(g => g.playtime_forever > 0);
    const top5 = [...games].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 5)
      .map(g => ({ name: cleanName(g.name), hours: Math.round(g.playtime_forever / 60) }));
    const mostPlayedMin = top5[0] ? top5[0].hours * 60 : 0;
    const backlog = games.filter(g => g.playtime_forever === 0 && !JUNK.test(g.name || ""));

    const stats = {
      owned: games.length,
      played: played.length,
      totalHours: Math.round(totalMin / 60),
      topConcentration: totalMin ? mostPlayedMin / totalMin : 0,
    };

    const type = gamerType(stats);
    const unplayedPct = stats.owned ? Math.round(100 * (stats.owned - stats.played) / stats.owned) : 0;
    const topGameDays = top5[0] ? Math.round(top5[0].hours / 24) : 0;

    res.json({
      steamid,
      name: player?.personaname || "Unknown",
      avatar: player?.avatarfull || "",
      totalHours: stats.totalHours,
      daysPlayed: Math.round(stats.totalHours / 24),    // visceral "days of your life"
      owned: stats.owned,
      played: stats.played,
      unplayedPct,
      top5,
      topGameDays,                                       // hero flex: days in #1 game
      gamerType: type,
      gamerBlurb: TYPES[type] || "",                     // identity one-liner
      compareLine: compareLine(unplayedPct),             // honest social comparison
      backlogCount: backlog.length,                      // junk-filtered real backlog, Hook-A seam
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Dead-simple capture: append one JSON line per signup. The measurement instrument.
// (For serverless/Vercel where disk isn't persistent, swap this for a Formspree POST — see README.)
app.post("/api/signup", (req, res) => {
  try {
    const { email, src, steamid, gamerType, totalHours, unplayedPct } = req.body || {};
    if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: "valid email required" });
    const row = JSON.stringify({
      email, src: src || "direct", steamid, gamerType, totalHours, unplayedPct,
      ts: new Date().toISOString(),
    });
    fs.appendFileSync(new URL("./signups.jsonl", import.meta.url), row + "\n");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Avatar proxy: same-origin image so the exported canvas isn't tainted.
app.get("/api/avatar", async (req, res) => {
  try {
    const u = String(req.query.u || "");
    if (!/^https:\/\/(avatars\.)?steamstatic\.com\//.test(u) && !/steamstatic\.com\//.test(u)) {
      return res.status(400).end();
    }
    const r = await fetch(u);
    res.set("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    const buf = Buffer.from(await r.arrayBuffer());
    res.end(buf);
  } catch {
    res.status(500).end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running: http://localhost:${PORT}`));
