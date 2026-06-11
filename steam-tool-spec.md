# Free Steam Backlog Tool — Build Spec

**What it is:** paste a Steam ID → see your unplayed backlog and the total hours to beat it all. No login, no signup wall. The lead magnet + demand sensor for the bigger app.

**Why this first:** it's dogfoodable, it's days of work, and its `?src=` tags turn community seeding into behavioral demand data. It also tests the real question — do people want the *inventory* (the list) or the *verdict* (the hours)? Build to find out.

## Success criteria (verifiable — build until these pass)
1. Enter a public Steam vanity name or 64-bit ID → returns that account's owned games. ✅ when it works on your own ID and two public test IDs.
2. Backlog = owned games with `playtime_forever == 0`. Count is correct vs. your real Steam library.
3. Each backlog game shows an HLTB "main story" hour estimate; total hours rendered as the headline number.
4. Unmatched games (no HLTB hit) are shown as "unknown," never crash the run.
5. A shareable result + an email-capture box that records `email + src tag + steamid`. ✅ when a submit lands in your store with the right `src`.

## Scope
**In (the whole MVP):**
- One page: input box → results.
- Server route that calls Steam + HLTB (Steam key MUST stay server-side).
- Backlog computation + total-hours headline.
- Email capture with source tag.

**Out (resist these — not now):**
- ❌ User accounts / auth ❌ database of users ❌ PSN/Xbox ❌ saving libraries ❌ fancy filtering/sorting ❌ native app shell. Every one of these is post-validation.

## Data sources & exact endpoints
**Steam Web API** (free key: https://steamcommunity.com/dev/apikey)
- Resolve vanity → SteamID64: `GET ISteamUser/ResolveVanityURL/v1/?key=KEY&vanityurl=NAME`
- Owned games + playtime: `GET IPlayerService/GetOwnedGames/v1/?key=KEY&steamid=ID&include_appinfo=true&include_played_free_games=true`
  - Returns per game: `appid`, `name`, `playtime_forever` (minutes). Requires the user's **game details + profile = Public**. Handle the empty/private case with a clear message ("set your Steam profile to Public").

**HowLongToBeat** (no official API — fragile, community-scraped)
- Use **`hltb-js`** (toasttsunami) — the maintained fork. The old `howlongtobeat` npm is dead.
- Match by game `name` → take "main story" hours.
- ⚠️ **Known risk:** HLTB breaks scrapers when they change their site. Mitigations baked into MVP:
  - **Cache** every `appid → hours` result to a local JSON/SQLite. Most games are looked up once, ever.
  - **Concurrency-limit** lookups (e.g. 5 at a time) and only look up **unplayed** games to cut volume.
  - **Degrade, don't die:** a failed/again-unmatched lookup → "unknown hours," tool still returns. If `hltb-js` itself breaks on install, the Steam half still ships.

## Known edge case (verified live — handle in step 3/4)
**Playtime privacy is separate from game-list privacy.** An account can have its game list Public but playtime Private — Steam then returns `playtime_forever: 0` for *every* game, so the tool reports 100% backlog (wrong). Detect it: if `ownedCount > 50 && backlogCount === ownedCount`, show "Your playtime looks private — set it to Public for an accurate backlog" instead of a result. (Found while testing `st4ck`: 4,636 owned, all reading as unplayed.)

## The backlog computation (the product, in one line)
```
backlog = ownedGames.filter(g => g.playtime_forever === 0)
totalHours = sum(hltbMainStory(g) for g in backlog where matched)
```
Headline: "**{backlog.length} unplayed games · ~{totalHours} hours to clear your backlog.**"
That sentence is the shareable hook. Everything else is supporting detail.

## The one growth feature (don't skip — it's the point)
- Read `src` from the URL (`?src=steam-hltb`, `crossplatform`, etc.). Default `direct`.
- After results render: "Want this to auto-sync Steam + more, in a native app? Drop your email." → store `{email, src, steamid, backlogCount, totalHours, ts}`.
- Store = whatever's fastest you'll actually ship: a Google Sheet via webhook, Airtable, or a one-table SQLite. Not a user system.
- This is your validation instrument: which `src` converts, and whether people who see a big backlog number are *more* likely to sign up (→ verdict matters) or not (→ inventory matters).

## Stack & deploy (pick the one you'll finish)
- **Fastest:** static `index.html` + one serverless function (Vercel/Netlify) holding the Steam key. Deploy free.
- Front end: vanilla HTML/JS or one small React file. No framework ceremony.
- Keep `npsso.txt`, `.env`, and the Steam key out of git — add a `.gitignore` first commit.

## One-evening build plan (each step has a verify check)
1. Scaffold repo + `.gitignore` (node_modules, .env, npsso.txt) → verify `git status` is clean of secrets.
2. Serverless fn: vanity/ID → `GetOwnedGames` → return JSON → verify your own library count matches Steam.
3. Front page: input → call fn → render game count + unplayed count → verify unplayed matches reality.
4. Add `hltb-js` lookup for unplayed games, with cache + concurrency limit → verify total-hours number is plausible for ~5 known games.
5. Headline + shareable result + `?src=` email capture → verify a test submit lands in your store with correct `src`.
6. Deploy → verify it runs on a friend's public Steam ID from a phone.
Ship when 1–6 pass. Don't polish past that — seed it and let the data talk.

## What this de-risks
- Proves demand *behaviorally* before the native app exists.
- Tells you inventory-vs-verdict via the email/src data.
- Gives the seeding kit its link. The kit goes live the day this deploys.
- Zero PSN dependency — built entirely on the reliable leg.
