// Admit — MCTF admissions platform
// Callable Cloud Functions
//
// author: z.

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────────────────────
// requestPromotion
//
// Reviewers become admins through a two-step flow:
//   1) A senior lead flips their `promotion_eligibility/<uid>.approved` to true.
//   2) The reviewer calls this function to have the custom claim stamped.
//
// We double-check a few invariants server-side so nobody can backdoor the
// promotion by poking Firestore directly:
//   - caller must be signed in
//   - caller's email must be on the microclub.info staff domain
//   - caller's email must be verified (so we know it's actually theirs)
//   - caller's eligibility record must say approved=true
//
// Then we set role='admin' via the Admin SDK. The client is expected to force
// an ID token refresh (getIdToken(true)) to pick up the new claim.
// ─────────────────────────────────────────────────────────────────────────────
export const requestPromotion = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "sign in first.");
  }
  const uid = request.auth.uid;

  // Refetch the user so we trust the source of truth, not the client token.
  const user = await admin.auth().getUser(uid);

  if (!user.emailVerified) {
    throw new HttpsError("permission-denied", "email not verified.");
  }
  if (!user.email || !user.email.toLowerCase().endsWith("@microclub.info")) {
    throw new HttpsError("permission-denied", "not a staff address.");
  }

  const eligSnap = await db.doc(`promotion_eligibility/${uid}`).get();
  const elig = eligSnap.data();
  if (!elig || elig.approved !== true) {
    throw new HttpsError("permission-denied", "not approved for promotion yet.");
  }

  await admin.auth().setCustomUserClaims(uid, { role: "admin" });

  // Audit log (sealed_verdicts is read-only from client; writes happen via admin SDK).
  await db.collection("promotion_audit").add({
    uid,
    email: user.email,
    at: Date.now(),
  });

  return {
    ok: true,
    message: "Promoted. Refresh your ID token to pick up the claim.",
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// hello (health check — used by the dashboard's status card)
// ─────────────────────────────────────────────────────────────────────────────
export const hello = onCall(async () => ({ ok: true, product: "Admit", version: "1.0.0" }));
