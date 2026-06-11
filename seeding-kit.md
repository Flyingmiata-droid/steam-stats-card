# Community Seeding Kit — Game Backlog Tracker

**Wedge:** native app + real Steam/PSN/Xbox backlog sync. No incumbent does all three.
**Discipline (read first — these keep you un-banned):**
1. Every comment must fully answer the question *without* the link. Tool is a P.S., not the point.
2. Disclose you built it, every time. "I'm building a little tool for this —". Hiding it converts worse and gets you flagged.
3. Never claim credentials you don't have. Honest indie-maker framing only.
4. One good comment a day > ten link-drops. Volume gets flagged; quality gets upvoted.
5. Read each sub's sidebar before posting. Rules below are starting points, not gospel — confirm.
6. Source-tag every signup so you know which channel actually worked (see Measurement at bottom).

---

## PHASE 0 — NOW (idea stage, nothing to link)

You can't seed a product that doesn't exist. Two jobs right now:
- **Build account credibility:** comment genuinely on existing backlog threads for 1–2 weeks. No links. Just be a real backlog gamer (you are one).
- **Validate the wedge** with authentic first-person posts. These are honest because it's *your actual problem* — not a pitch.

### r/backlog — https://www.reddit.com/r/backlog/
Small, dedicated, tool-friendly. Best place to start.
**Rule note:** generally relaxed; still no naked promo. This is a genuine discussion post.

> **Title:** How do you all track a backlog that's split across Steam, PSN, and Xbox?
>
> Mine's a mess — Steam library, a pile of PS5 games, and Game Pass all in separate places, so I genuinely don't know how big my backlog is. I've tried Backloggd but I'm adding everything by hand and it never stays current.
>
> How are you handling cross-platform? Is everyone just manually maintaining one list, or is there something that actually pulls from all three? Curious what's working for people.

### r/patientgamers — https://www.reddit.com/r/patientgamers/
Large (~1M+), strict, leans toward game discussion over meta/tool posts.
**Rule note:** self-promo restricted; tool/meta posts often funneled to weekly threads. Do NOT post a tool here yet. *Participate only* — comment on backlog/"what to play next" threads. Save this sub for genuine value comments once the tool exists.

### r/12in12 — https://www.reddit.com/r/12in12/
Backlog-challenge community (12 games in 12 months). Exactly your user.
**Rule note:** small, friendly; confirm sidebar. Genuine discussion welcome.

> **Title:** Anyone else lose track of their backlog because it's spread across platforms?
>
> Doing the challenge this year but half my problem is just *seeing* everything — Steam, PS5, Game Pass all separate. How do you keep your one master list, and do you count games across all platforms or just one?

**Phase 0 goal:** read the replies. The words people use for this pain become your landing-page copy and your free-tool framing. If nobody feels the cross-platform pain, that's a signal *before* you build.

---

## PHASE 1 — WHEN THE FREE STEAM TOOL SHIPS (you have a link)

The free tool = paste public Steam ID → see your backlog + total hours-to-beat. No login. Shareable. This is what you seed. Each template fully answers first, link is the P.S. Replace `<tool-url>` and keep one source tag per sub.

### Recurring question: "How do I see how long my Steam backlog would take to finish?"
Found in: r/Steam (https://www.reddit.com/r/Steam/), r/patientgamers, r/backlog

> You can pull it manually: make your Steam profile + game details public, then cross-reference each game against HowLongToBeat for "main story" times and add them up. Tedious but it works, and seeing the total hours is genuinely sobering / motivating.
>
> I got tired of doing it by hand so I'm building a free thing that does it automatically — paste your Steam ID, it pulls your library and totals the hours-to-beat. No login, no signup wall: `<tool-url>?src=steam-hltb`. Still rough, feedback welcome.

### Recurring question: "Best way to track games across Steam + PlayStation + Xbox?"
Found in: r/backlog, r/gamingsuggestions (**promo-restricted — comment value only, link only if a mod-allowed context**), r/patientgamers

> Honestly there's no clean all-in-one yet. Backloggd is the best manual tracker but you add everything by hand and there's no real auto-sync (their Steam import is still just roadmap). For PC, Playnite pulls Steam/Epic/GOG into one desktop library but it's PC-only — no PSN/Xbox. So most people end up with one manual master list.
>
> The gap (native app that auto-syncs all three) is exactly what I'm building. First piece is live and free — Steam library → backlog + hours: `<tool-url>?src=crossplatform`. Curious if PSN sync is the part people care most about.

### Recurring question: "Is there a Backloggd alternative with automatic import?"
Found in: r/backlog, r/IndieGaming

> Backloggd's import has been "coming soon" for a while; for now the community workarounds are a Firefox extension and a GitHub sync script (GameListSyncAutomator), both Steam-only and a bit fiddly.
>
> I'm building toward proper auto-sync. The free Steam piece is up now (no login): `<tool-url>?src=backloggd-alt`. Would love to know if you'd want PSN/Xbox in the same list.

### Build-in-public launch post (for the free tool itself)
Post to: r/SideProject (https://www.reddit.com/r/SideProject/), r/InternetIsBeautiful (high bar — only if it's polished), r/IndieGaming
**Rule note:** these *welcome* "I built this" posts. Lead with the free value, not the future app.

> **Title:** I built a free tool that shows how many hours it'd take to beat your entire Steam backlog
>
> Paste your Steam ID (public profile), it pulls your library and totals the main-story hours from HowLongToBeat. No login, no signup. Built it because my backlog is split across three platforms and I couldn't even see how deep the hole was.
>
> `<tool-url>?src=sideproject`
>
> It's the first piece of a bigger thing I'm building — a backlog tracker that auto-syncs Steam/PSN/Xbox, since nothing does all three. Tear it apart, tell me what's broken.

---

## Thread-finding keywords (search these to find live threads daily)
- "track backlog across platforms" / "Steam PSN Xbox one list"
- "Backloggd alternative" / "Backloggd auto import"
- "how long to beat my backlog" / "Steam backlog hours"
- "best backlog tracker" / "app to track games I own"
- "12 in 12" / "beat my backlog 2026"
Reddit search + the search bar inside r/patientgamers, r/backlog, r/Steam.

## Measurement loop (this decides what you build next)
- Every link carries `?src=<tag>` (steam-hltb, crossplatform, backloggd-alt, sideproject…).
- After ~1 week, whichever tag actually drives clicks/signups tells you the real demand.
- If `crossplatform` / PSN questions dominate → the sync wedge is validated, prioritize it.
- If `steam-hltb` dominates → people want the *stat*, maybe the hours-tool is the product.
- Data picks the roadmap, not a guess.

## Subs to AVOID seeding (for now)
- r/gaming, r/pcgaming — massive, strict, promo = instant removal. Not worth the risk early.
- Any sub where you have <2 weeks history and no comment karma. Build credibility first.
