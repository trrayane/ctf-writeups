<?php
require_once __DIR__ . '/../../config/config.php';

class LoanController
{
    const LOAN_AMOUNT   = 500000.00;  // DA
    const MIN_BALANCE   = 100.00;     // minimum account balance to qualify

    /**
     * [STEP 2 – Loan race condition]
     *
     * Eligibility is checked with a plain SELECT (no FOR UPDATE / no mutex).
     * Two concurrent requests will both read loan_count = 0, both pass the
     * guard, and both insert a loan record → user receives 2 × LOAN_AMOUNT.
     *
     * Exploit:
     *   Send two simultaneous POST requests to /loan.php.
     *   The usleep() below widens the race window to make it reliable.
     *
     *   curl -b cookies.txt -X POST http://localhost:8080/loan.php &
     *   curl -b cookies.txt -X POST http://localhost:8080/loan.php &
     *   wait
     */
    public function requestLoan(int $user_id): array
    {
        $db = getDB();

        // ── STEP 2 ─────────────────────────────────────────────────────────
        // BUG: eligibility check is NOT wrapped in a transaction with a row
        //      lock.  Concurrent requests both see loan_count = 0 and proceed.
        $stmt = $db->prepare(
            "SELECT COUNT(*) AS cnt FROM loans WHERE user_id = ? AND status = 'active'"
        );
        $stmt->execute([$user_id]);
        if ((int)$stmt->fetchColumn() > 0) {
            return ['error' => 'An active loan already exists on this account.'];
        }

        // Balance eligibility check (also un-locked)
        $stmt = $db->prepare('SELECT balance FROM users WHERE id = ?');
        $stmt->execute([$user_id]);
        $balance = (float)$stmt->fetchColumn();

        if ($balance < self::MIN_BALANCE) {
            return ['error' => sprintf(
                'A minimum account balance of %s is required to qualify.',
                formatDA(self::MIN_BALANCE)
            )];
        }

        // Artificial processing delay – widens the race window intentionally
        usleep(500000); // 500 ms
        // ───────────────────────────────────────────────────────────────────

        // Record the loan
        $db->prepare("INSERT INTO loans (user_id, amount, status) VALUES (?, ?, 'active')")
           ->execute([$user_id, self::LOAN_AMOUNT]);

        // Credit user
        $db->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
           ->execute([self::LOAN_AMOUNT, $user_id]);

        $db->prepare(
            "INSERT INTO transactions (receiver_id, amount, type, note)
             VALUES (?, ?, 'loan', 'Personal loan disbursement')"
        )->execute([$user_id, self::LOAN_AMOUNT]);

        checkVipStatus($user_id);

        return ['success' => true, 'amount' => self::LOAN_AMOUNT];
    }
}
