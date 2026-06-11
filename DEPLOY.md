# Deploy — get the card live so you can seed it

The capture (`/api/signup`) appends to `signups.jsonl` on disk. So deploy to a host with a
**persistent disk / always-on process** — Render or Railway, not Vercel (serverless wipes the file).
(If you'd rather use Vercel, swap the front-end signup POST for a Formspree form URL — see bottom.)

## Option A — Render (free, recommended)
1. Push this folder to a GitHub repo. Confirm `.gitignore` is excluding `.env`, `npsso.txt`, `signups.jsonl` first:
   ```
   cd "C:\Users\nkrum\Documents\Claude\Projects\Game Tracker"
   git init && git add . && git status   # <- verify no .env / npsso.txt / signups.jsonl listed
   git commit -m "steam stats card"
   ```
   Create a repo on github.com and follow its "push existing repo" lines.
2. On render.com → New → Web Service → connect the repo.
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variable: `STEAM_API_KEY` = your key (same value as in `.env`).
3. Deploy. You get a public URL like `https://your-app.onrender.com`.
4. Test it: open the URL, make your card, submit a test email, confirm it works.

To read your signups: Render shell → `cat signups.jsonl`. (Free tier disk resets on redeploy — fine for a first test; export the file before redeploying.)

## Option B — Railway
Same idea: new project from repo, set `STEAM_API_KEY` var, start command `npm start`. Gives a public URL.

## After it's live
- Update the card footer / share links — they use `location.host`, so they auto-point at the deployed URL. Nothing to change.
- Go to `seeding-kit.md`, drop the live URL into the `<tool-url>` slots, and seed per the kit (one quality post/comment a day, value first).
- Watch `signups.jsonl`: which `src` tag converts, which `gamerType` signs up. That's the A-vs-B answer.

## Persistence note / Formspree swap (only if you use Vercel)
Serverless = `signups.jsonl` won't survive. Instead:
1. Make a free form at formspree.io (2 min, your email).
2. In `public/index.html`, change the signup `fetch("/api/signup", …)` to POST the same JSON to your Formspree endpoint URL.
3. Then any static/serverless host works and submissions email to you + store in Formspree.
