# The Old Quarter Public Library — challenge

Web challenge. Player chains an nginx off-by-slash misconfiguration into a
Python import hijack to read a flag with a random filename.

## Running

```
docker compose up --build
```

Then open `http://localhost:8080/`. The site is a working library catalogue
(homepage, browseable catalogue, per-book pages, search, JSON `/api/books`
and `/api/search` endpoints). All of that is intentional — the front-of-house
behaviour is a decoy/realism layer, not part of the intended path.

## Intended path (and only intended path)

1. **Discover the off-by-slash.** Content-discovery fuzzing turns up
   `/deploy` (403) → `/deploy/nginx.conf` (200, full config). The leaked
   config declares `location /static { alias /app/code/static/; ... }` —
   the classic off-by-slash. A request like `GET /static../app.py`
   resolves to `/app/code/static/../app.py` = `/app/code/app.py`,
   exposing the entire `/app/code/` source tree.

2. **Read the source.** `curl http://host/static../app.py` reveals two
   unguessable staff endpoints:
   - `GET /debugjustfortesting676767` — launches the metadata processor;
     read-only actions only (`status`, `list_fixtures`); no auth.
   - `POST /api/staff/v2/fixtures/upload8765` — writes a fixture into
     the helper's directory; **requires `Authorization: Bearer <jwt>`
     with `role: admin`**.

   The same source disclosure also leaks `STAFF_JWT_SECRET`, hardcoded
   as a string literal at the top of `app.py`. (The Flask
   `SECRET_KEY` is separately generated with `secrets.token_hex(32)` per
   boot — distinct from the staff JWT key.)

   `/static../debug/metadata_processor.py` shows the helper imports
   `requests` at module level and never uses it.

3. **Forge the admin JWT.** Using the leaked `STAFF_JWT_SECRET`, sign an
   HS256 token with payload `{"role": "admin"}`:
   ```
   header  = {"alg":"HS256","typ":"JWT"}
   payload = {"role":"admin"}
   token   = b64(header) + "." + b64(payload) + "." + hmac_sha256(secret, header.payload)
   ```

4. **Authenticated upload of `requests.py`.**
   ```
   curl -X POST --data-binary @evil.py \
     -H "Authorization: Bearer <forged-jwt>" \
     'http://host/api/staff/v2/fixtures/upload8765?filename=requests.py'
   ```
   Flask verifies the token, then writes the body to
   `/app/code/debug/requests.py`. The endpoint refuses
   `metadata_processor.py`, `__init__.py`, and `__main__.py` to prevent
   self-overwrite.

5. **Trigger the import via the unauthenticated launcher.**
   ```
   curl 'http://host/debugjustfortesting676767?action=status'
   ```
   The Flask route runs `python3 metadata_processor.py` as a fresh
   subprocess with `cwd=/app/code/debug`. `sys.path[0]` is therefore the
   helper directory, so `import requests` finds the player's
   `requests.py` *before* the real site-packages `requests/` and executes
   its top-level code.

6. **Read the flag.** The player's `requests.py` does e.g.
   ```python
   import os, glob
   for p in glob.glob('/flags/*'):
       print(p, '::', open(p).read())
   ```
   The flag lives at `/flags/flag_<24 random chars>.txt`. Step 5's stdout
   is returned verbatim by the Flask handler, so the player sees the
   flag.

## Why other paths don't work

- **`/api/*` and the public Flask routes** are read-only DB queries against
  a SQLite catalogue. No SQL injection (parameterised queries), no
  upload, no write.
- **`/login`** is intentionally non-functional (`error: maintenance`) and
  rate-limited to 5 r/m by nginx.
- **The off-by-slash alone cannot read the flag.** nginx URI normalisation
  collapses multi-level `../` *before* location matching, so traversal can
  only reach `/app/code/` (the alias's parent). `/flags/` is structurally
  unreachable.
- **Upload without forging the JWT.** The upload endpoint short-circuits
  on `_require_staff_token()`. No token = 401, wrong role = 403. The
  unauthenticated launcher endpoint cannot upload — it accepts only
  `status` and `list_fixtures` and validates the action server-side.
- **Forging without disclosure.** The endpoint name (`upload8765`) is
  unguessable, and even if guessed, the JWT secret is hardcoded only in
  `app.py`, which the player needs source disclosure to read.
- **Hidden-file blocking in nginx** (`location ~ /\.`,
  `\.(env|ini|conf|...)$`) prevents the off-by-slash from leaking dotfiles
  or arbitrary config — only the `/app/code/` Python tree is reachable.

## File layout

```
.
├── Dockerfile
├── docker-compose.yml
├── README.md
├── entrypoint.sh
├── nginx.conf
├── supervisord.conf
├── cleanup/
│   ├── cleanup.sh           # copied to /opt/cleanup/cleanup.sh
│   └── library-cleanup      # copied to /etc/cron.d/library-cleanup
└── app/
    ├── app.py                  # Flask app, public routes + hidden endpoint
    ├── seed.py                 # SQLite catalogue seeder (~25 real books)
    ├── debug/
    │   └── metadata_processor.py   # has the unused `import requests`
    ├── static/
    │   ├── css/style.css
    │   └── img/logo.svg
    └── templates/
        ├── 404.html
        ├── 500.html
        ├── about.html
        ├── base.html
        ├── book.html
        ├── catalog.html
        ├── hours.html
        ├── index.html
        ├── login.html
        └── search.html
```

## Discovering the off-by-slash

The player needs to find the misconfiguration; there are no breadcrumbs in
robots.txt or other obvious places. The intended discovery is via
content-discovery fuzzing:

1. Fuzz common paths against the site (e.g. ffuf, dirsearch, gobuster with
   a standard wordlist that includes `deploy`). `/deploy` returns 403
   while nearly everything else returns 404. A 403 in a sea of 404s is the
   standard "something exists here" signal these tools flag automatically.
2. Fuzz inside `/deploy/` with a file-extension wordlist (or a common-files
   list). `/deploy/nginx.conf` returns 200; everything else returns 404.
3. Reading the config reveals `location /static { alias /app/code/static/; }`
   — the off-by-slash (no trailing slash on the location, trailing slash on
   the alias).

Behind the scenes:

- `/deploy` and `/deploy/` are both `return 403`. There's no autoindex; the
  explicit 403 is what makes the directory show up in fuzzers.
- `/deploy/nginx.conf` is an exact-match `location =` block. That exact
  match beats the generic `\.conf$` deny block elsewhere in the config, so
  this one specific config file leaks while every other `.conf` URL still
  returns 404.
- The leaked copy lives at `/opt/deploy/nginx.conf`, outside `/app/code/`.
  The off-by-slash can't reach it from a different angle —
  `/deploy/nginx.conf` is the only way to it.

## Permission model — what RCE can and cannot do

The Flask worker runs as `www-data` under gunicorn (configured in
`supervisord.conf`). Because the helper is invoked as a fresh subprocess
of that worker, the player's RCE shell also runs as `www-data`. The
filesystem is shaped so this shell is **read-only** for everything that
matters:

| Path | Owner | Mode | Notes |
|---|---|---|---|
| `/app/code/` (recursive) | `root:root` | dirs `0755`, files `0644` | www-data can read, cannot write |
| `/app/code/debug/` | `root:www-data` | `3775` (setgid + sticky + group-write) | www-data can create new files; sticky bit prevents deleting/renaming root-owned `metadata_processor.py` |
| `/app/code/debug/metadata_processor.py` | `root:root` | `0644` | the helper itself is read-only to www-data |
| `/var/lib/library/library.db` | `root:www-data` | `0640` | + Flask opens it `mode=ro&immutable=1` |
| `/flags/` | `root:root` | `0711` | dir traversable but not listable |
| `/flags/flag_<random>.txt` | `root:root` | `0644` | readable once you know the name |
| `/opt/cleanup/cleanup.sh` | `root:root` | `0755` | inside `/opt`, off-by-slash cannot reach |
| `/etc/cron.d/library-cleanup` | `root:root` | `0644` | runs as root |

What this means concretely (verified end-to-end with a live RCE shell):

- ❌ Cannot tamper with the catalogue DB (`Permission denied`)
- ❌ Cannot overwrite `metadata_processor.py` (`Permission denied`)
- ❌ Cannot delete `metadata_processor.py` (`Operation not permitted` — sticky bit)
- ❌ Cannot overwrite `app.py` or any other source file
- ❌ Cannot disable the cleanup cron (root-owned, outside `/app/code/`)
- ✅ Can read the flag (intended)

The cron health-check restart is therefore belt-and-suspenders rather than
the primary defence — even if the player corrupts something inside their
upload window, they cannot reach anything other than their own
`requests.py` in the helper directory, and the cron will wipe it within 60
seconds anyway.

## Automatic maintenance

A cron job runs every minute (`/etc/cron.d/library-cleanup` →
`/opt/cleanup/cleanup.sh`, both **outside** `/app/code/` so the off-by-slash
cannot read or modify them). It:

1. Removes anything in `/app/code/debug/` that isn't `metadata_processor.py`
   — that wipes the player's uploaded `requests.py`, any `__pycache__/`
   Python wrote next to it, and stray `*.pyc`. The next player gets a
   fresh slot.
2. Curls `http://127.0.0.1:5000/health` and, if that fails, calls
   `supervisorctl restart flask` (falling back to `pkill gunicorn` so
   supervisord's `autorestart=true` picks it up).

Activity is logged to `/var/log/library-cleanup.log` inside the container.

The cron schedule has one practical implication for the player: the chain
upload → trigger needs to complete inside a single one-minute window. If
they upload at `:59` and the cleaner runs at `:00`, they'll have to upload
again. This is an acceptable retry, not a bug.

## Cleanup between players

The cron job covers normal between-player cleanup automatically. For a hard
reset (regenerate the random flag, re-seed the DB), restart the container:

```
docker compose restart library
```
