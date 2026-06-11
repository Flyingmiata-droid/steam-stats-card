# Shareable Stats Card — Build Spec (Hook B)

**Supersedes the backlog framing in `steam-tool-spec.md`.** Same Steam plumbing, new output: instead of a shame number, a **stats card people post with pride**. The card is the acquisition wedge; "what to play next / backlog" becomes a retention feature for the subset who need it (Hook A rides along).

## Why this shape
- A backlog count is *hidden*. A stats card is *shared*. With zero audience, shareability is the whole game.
- It's the same `GetOwnedGames` pull you already built — minimal rework.
- The card's "gamer type" label **self-segments your audience**: the people who get labeled "Collector / Backlog Baron" ARE the backlog-anxiety users. The viral object is also your user-discovery mechanism.

## Success criteria (verifiable)
1. Enter Steam ID/vanity → render a card with avatar, name, total hours, games owned/played, top-5 by hours, and a derived "gamer type." ✅ on your own account + two public IDs.
2. Card exports as a **single image** worth posting (download + copy-link).
3. A shared link (`/?id=…`) regenerates the card for a viewer and prompts them to make their own → loop.
4. `?src=` tag + optional email captured on "make mine / notify me," stored with the gamer-type label.

## Data sources & cost (all confirmed live on a real account)
**Cheap — 2 calls, the whole core card:**
- `ISteamUser/GetPlayerSummaries/v2` → `personaname`, `avatarfull`. (1 call)
- `IPlayerService/GetOwnedGames/v1?include_appinfo=true&include_played_free_games=true` → per game `name`, `playtime_forever`. (1 call) → total hours, owned, played, top-5.

**Expensive / optional — defer to an opt-in "deep dive":**
- `ISteamUserStats/GetPlayerAchievements/v1?appid=` → completion %, but **one call per game** AND **noisy for multiplayer libraries** (confirmed: R6 Siege 0/48 at 4,000+ hrs). Only run for played singleplayer titles, with a progress bar, on demand. Not in the core card.
- Genres/tags → needs store `appdetails` per appid (unofficial, rate-limited). Defer.

## The card (core v1 — cheap data only)
```
[avatar]  GeorgeWhorewell
─────────────────────────
4,332 hrs played   ·   66 games   ·   57 played
Most played:  Rainbow Six Siege  (X,XXX hrs)
Top 5:  R6 · Rust · Hunt · …
Gamer type:  THE MARATHONER
─────────────────────────
made at <yoururl>?src=card   ·   make your own →
```

### "Gamer type" derivation (simple rules, only data we have)
Compute from `playedRatio = played/owned`, `totalHours`, and top-game concentration:
- huge hours, one game dominates (>50% of hours) → **The Loyalist**
- high hours + high playedRatio → **The Marathoner / Completionist**
- many games, low playedRatio (<0.4) → **The Collector / Backlog Baron**  ← these are your Hook-A users; tag the signup so you can find them
- low hours, few games → **The Casual**
Keep it to ~5 labels. The label is the shareable hook AND the segmentation signal.

## Share mechanic
- Render the card to an image client-side (canvas or SVG→PNG). Buttons: **Download image**, **Copy link**.
- Shareable link `/?id=STEAMID` regenerates the card for any viewer + a prominent "Make your own" input → viral loop.
- Link unfurls: set OpenGraph meta so pasted links preview the card. v1 = static OG image + title; dynamic per-card OG image is a fast-follow (server-rendered).
- Preserve `?src=` through to the signup record.

## Hook A as the retention layer (don't build yet, just leave the seam)
- Add a quiet secondary line/CTA: "See what's still in your backlog →" that filters `playtime_forever === 0` (with the junk filter below). Only the Collector/Backlog-Baron types will care — and their behavior tells you if Hook A has legs.
- **Junk filter (carry over from real-data finding):** drop entries matching `Test Server|Playtest|Staging|Beta|Legacy Edition|SotF|Dedicated Server` so "unplayed" ≈ real backlog.

## Measurement (this settles A vs B with behavior, not opinion)
Record per use: `{steamid, gamerType, totalHours, sharedImage?, clickedBacklog?, email?, src, ts}`.
- High **share rate** on stats cards → Hook B is the engine. Pour in.
- "Backlog Baron" users disproportionately click backlog / leave email → Hook A has a real market; build the tracker for *them*.
- Neither shares nor converts → the wedge is wrong; cheap to have learned it.

## Build plan (each step verifies)
1. Reuse the running server; add `GetPlayerSummaries` to the `/api/library` response → verify name+avatar return for your ID.
2. Compute card fields (total hours, owned/played, top-5, gamerType) server-side → verify numbers match your real Steam.
3. Front end: render the card layout from the JSON → verify it reads like the mock above.
4. Card → image export (download + copy-link) → verify the PNG looks postable.
5. `/?id=` shareable view + "make your own" + `?src=` email capture with gamerType → verify a shared link regenerates and a signup lands tagged.
6. Add the quiet "backlog →" seam with the junk filter → verify it shows ~real unplayed, not test servers.
Ship at 5; step 6 is the A/B seam. Then seed with the kit and read the share/signup data.

## What this de-risks vs. the backlog framing
- Built on the hook you actually live (founder fit ✅).
- Output is shareable → organic distribution with no audience.
- Same reliable Steam-only tech; zero PSN dependency.
- The card itself finds your backlog users instead of you guessing who they are.
