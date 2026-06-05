# Admit — Hints

### 1 · The backend

`/__/config.json` names the backend. It's the Firebase Emulator Suite — a dev tool that exposes admin endpoints production Firebase does not.

### 2 · The staff email

`requestPromotion` demands a verified `@microclub.info` address — yours isn't. The emulator has an admin endpoint that lists every out-of-band verification code it has generated, regardless of who it was "sent to."

### 3 · The approval

`promotion_eligibility/<uid>` is the other check the function makes. Compare the `allow create:` rule with `allow update:` — one constrains fields, the other doesn't.

### 4 · The token

Firebase tokens encode claims at issue-time, so changing email or custom-claims on the account doesn't affect tokens already in your hand. The emulator's `accounts:update` (oobCode-apply) does **not** return a fresh `idToken` — your existing one still claims `attacker@x.com`. Mint a new token after each account-state change: either `accounts:signInWithPassword` with the new email, or `securetoken.googleapis.com/v1/token` with `grant_type=refresh_token`.
