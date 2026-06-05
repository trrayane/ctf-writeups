# Hints

## Hint 1 — Orientation
Look closely at the `/history.php` page after making a small transfer.
Notice anything unusual between the **Raw Amount** column and the **Displayed** column?

---

## Hint 2 — Follow the Money
The banking platform has four financial operations: transfers, loans, refunds, and a VIP gate.
Each one has a subtle flaw. You don't need all four — but finding even one should point you toward the others.

---

## Hint 3 — Concurrency
What happens if two loan requests arrive at the same time?
The server checks your eligibility before granting the loan — but does it hold a lock while doing so?

---

## Hint 4 — Credit Before Debit
Submit a refund and watch your balance. Now check the merchant's balance.
What would happen if the merchant had no funds? Is the user's credit reversed?

---

## Hint 5 — Type Coercion
The transfer form enforces a 10,000 MAD per-transaction limit.
PHP's `(int)` cast and `(float)` cast don't always agree on the same string.
What does PHP say `(int)"1e5"` equals? What about `(float)"1e5"`?
