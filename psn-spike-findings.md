# PSN Sync Spike — the gate before "syncs all three"

## The real question
Not "does the PSN API respond." It's: **can I reliably get a user's owned-but-unplayed games (their backlog) — and what does it cost the user?**

## What the docs already prove (psn-api, verified June 2026)
| Endpoint | Scope | Returns | Good for backlog? |
|---|---|---|---|
| `getPurchasedGames` | **self only** (token owner) | full owned PS4/PS5 library, incl. unplayed | ✅ but only your own |
| `getUserPlayedGames(accountId)` | any user (privacy-gated) | **played** games only | ❌ unplayed invisible |
| `getRecentlyPlayedGames` | self | recent only | ❌ |

There is **no** endpoint that returns another user's unplayed games. Unplayed = no trophy, no playtime = not returned.

## Consequence (this is the product-shaping part)
- **Steam:** one API key + any public ID → full owned + unplayed. Zero per-user friction. Scales free.
- **PSN:** to see a user's backlog, **that user must authenticate with their own PSN account** (NPSSO → token), because only `getPurchasedGames` (self) exposes unplayed titles. Then:
  - Refresh token lasts **~2 months** → user re-auths every ~2 months.
  - Reverse-engineered/ToS-gray; **excessive requests can ban the PSN account** (limit ~300/15min).
  - Generating a new NPSSO on the same account **expires the old one** → fragile if user logs in elsewhere.

So PSN sync is not a checkbox next to Steam. It's a per-user OAuth-ish flow with recurring re-auth and account-ban risk. **Xbox via OpenXBL is unofficial too** — verify it separately before assuming parity.

## The spike (`psn_spike.mjs`)
Proves it on YOUR own account in ~10 min. It:
1. Authenticates with your NPSSO, prints the refresh-token lifetime (your real re-auth cadence).
2. Pulls your **owned** library (`getPurchasedGames`).
3. Pulls your **played** games (`getUserPlayedGames` — what anyone sees about you).
4. Prints `owned − played` = your **invisible backlog**: the games no other-user endpoint can ever return.

## Decision gate (run it, then pick)
- **`getPurchasedGames` returns your full owned library incl. unplayed, reliably** → PSN backlog is feasible *with per-user login*. Pitch becomes: "Steam: paste ID. PSN/Xbox: one-time sign-in, re-link every ~2 months." Decide if that UX is acceptable.
- **It's flaky / incomplete / auth breaks** → don't promise PSN backlog. Ship **"Steam + Xbox now, PSN coming"** and seed that honestly. Find this out now, not after launch.
- **Either way:** the seeding kit's "auto-syncs Steam/PSN/Xbox" line stays in the drawer until this passes.

## Why this matters for distribution (tie-back)
You were about to seed "syncs all three" as the differentiator. If PSN backlog needs per-user login + 2-month re-link, that's still a real edge over Backloggd — but the *messaging* must say it honestly, or your first power-users hit the wall and post about it. De-risk the claim before the claim does the selling.
