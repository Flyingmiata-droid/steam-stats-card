// PSN sync spike — smallest test that proves whether reliable PSN BACKLOG sync is feasible.
// Backlog = OWNED but UNPLAYED games. That's the part we need and the part PSN guards.
//
// Run:
//   npm init -y && npm i psn-api
//   PSN_NPSSO="<your 64-char npsso>" node psn_spike.mjs
//
// Get NPSSO: log in at https://my.playstation.com, then visit
//   https://ca.account.sony.com/api/v1/ssocookie  -> copy the "npsso" value.
//
// NOTE: psn-api response field names are not assumed below — the script dumps the raw
// shape first so you confirm, then counts. Adjust the .titles paths if the dump differs.

import { readFileSync } from "node:fs";
import {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  getProfileFromUserName,
  getPurchasedGames,
  getUserPlayedGames,
} from "psn-api";

// Token: put your 64-char NPSSO on a single line in npsso.txt next to this file.
let NPSSO = process.env.PSN_NPSSO;
if (!NPSSO || NPSSO.length < 40) {
  try { NPSSO = readFileSync(new URL("./npsso.txt", import.meta.url), "utf8").trim(); } catch {}
}
if (!NPSSO || NPSSO.length < 40) {
  throw new Error("No valid NPSSO found. Create npsso.txt next to this script with the 64-char token on one line.");
}

// --- AUTH (this is the per-user cost we're evaluating) ---
const accessCode = await exchangeNpssoForAccessCode(NPSSO);
const auth = await exchangeAccessCodeForAuthTokens(accessCode);
console.log("refreshTokenExpiresIn (sec):", auth.refreshTokenExpiresIn,
            "≈", Math.round(auth.refreshTokenExpiresIn / 86400), "days  <-- re-auth cadence");

// my accountId
const me = await getProfileFromUserName(auth, "me");
const myAccountId = me.profile?.accountId ?? me.accountId;
console.log("my accountId:", myAccountId);

// --- TEST 1: my OWNED library (incl. unplayed) — self only ---
const purchased = await getPurchasedGames(auth);
console.log("\n--- getPurchasedGames RAW (confirm shape) ---");
console.log(JSON.stringify(purchased, null, 2).slice(0, 800));
const ownedCount = purchased?.data?.purchasedTitlesRetrieve?.totalCount ?? 0;

// --- TEST 2: my PLAYED games — what ANYONE can see about me by accountId ---
const played = await getUserPlayedGames(auth, myAccountId);
console.log("\n--- getUserPlayedGames RAW (confirm shape) ---");
console.log(JSON.stringify(played, null, 2).slice(0, 600));
const playedCount = (played?.titles ?? played?.data?.titles ?? []).length;

// --- THE NUMBER THAT DECIDES IT ---
console.log("\n================ RESULT ================");
console.log("Owned (getPurchasedGames, self):   ", ownedCount);
console.log("Played (getUserPlayedGames, public):", playedCount);
console.log("Invisible backlog (owned - played):", ownedCount - playedCount);
console.log("\nIf 'invisible backlog' > 0, that gap is exactly what NO other-user");
console.log("endpoint can return. Confirms: PSN backlog requires per-user login.");
