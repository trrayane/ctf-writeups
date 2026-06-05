<?php
require_once __DIR__ . '/../../config/config.php';

class RefundController
{
    const REFUND_AMOUNT = 5000.00; // DA per claim

    /**
     * [STEP 3 – Refund logic inversion / silent merchant debit failure]
     *
     * The correct order for a refund is:
     *   1. Validate merchant has sufficient balance.
     *   2. Debit merchant.
     *   3. Credit user.
     *
     * This implementation does the opposite:
     *   1. Credit user immediately (no pre-check).
     *   2. Attempt to debit merchant – failure is caught and silently swallowed.
     *
     * All seed merchants start with balance = 0.00.
     * Every call credits the user +5,000 DA while the merchant goes
     * deeper into negative (or stays at 0 if the UPDATE is constrained).
     * The user's credit is NEVER rolled back.
     *
     * Exploit:
     *   POST /refund.php  merchant_id=1  (repeat until balance ≥ 1,000,000)
     *   200 calls × 5,000 DA = 1,000,000 DA
     */
    public function processRefund(int $user_id, int $merchant_id): array
    {
        $db = getDB();

        $stmt = $db->prepare('SELECT id, name, balance FROM merchants WHERE id = ?');
        $stmt->execute([$merchant_id]);
        $merchant = $stmt->fetch();

        if (!$merchant) {
            return ['error' => 'Merchant not found.'];
        }

        // ── STEP 3 ─────────────────────────────────────────────────────────
        // BUG: user is credited BEFORE merchant solvency is validated.
        //      The try/catch below ensures that even if the merchant debit
        //      throws (e.g. negative balance constraint), the credit stands.

        // 1. Credit user – happens unconditionally
        $db->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
           ->execute([self::REFUND_AMOUNT, $user_id]);

        // 2. Attempt to debit merchant – silently ignored on failure
        try {
            $db->prepare('UPDATE merchants SET balance = balance - ? WHERE id = ?')
               ->execute([self::REFUND_AMOUNT, $merchant_id]);
        } catch (Exception $e) {
            // Merchant debit failed. Credit already applied. Nothing to do.
            error_log('[RefundController] merchant debit failed: ' . $e->getMessage());
        }
        // ───────────────────────────────────────────────────────────────────

        $db->prepare(
            "INSERT INTO refunds (user_id, merchant_id, amount, status)
             VALUES (?, ?, ?, 'processed')"
        )->execute([$user_id, $merchant_id, self::REFUND_AMOUNT]);

        $db->prepare(
            "INSERT INTO transactions (receiver_id, amount, type, note)
             VALUES (?, ?, 'refund', 'Merchant refund credit')"
        )->execute([$user_id, self::REFUND_AMOUNT]);

        checkVipStatus($user_id);

        return ['success' => true, 'amount' => self::REFUND_AMOUNT];
    }
}
