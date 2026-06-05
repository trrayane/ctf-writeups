<?php
require_once __DIR__ . '/../../config/config.php';

class TransferController
{
    /**
     * Process a peer-to-peer transfer.
     *
     * Vulnerabilities embedded here:
     *
     * [STEP 1 – Currency rounding abuse]
     *   The sender is debited the ROUNDED (2 d.p.) amount, but the receiver
     *   is credited the raw floating-point value.
     *   e.g. transfer 0.004:
     *     sender loses  round(0.004, 2) = 0.00
     *     receiver gets              0.004
     *   Net gain per call: +0.004 DA (transfer to self, repeat)
     *
     * [STEP 4 – Type-juggling anti-fraud bypass]
     *   The anti-fraud cap uses an (int) cast on the raw string input.
     *   PHP parses "1e6" as integer 1, but as float 1,000,000.
     *   (int)"1e6"   === 1       → passes the  > 10000 guard
     *   (float)"1e6" === 1000000 → the actual debit/credit amount
     *   Exploit: POST amount=1e6  to transfer 1,000,000 DA in one shot.
     */
    public function transfer(int $sender_id, string $receiver_username, string $amount_raw): array
    {
        // ── STEP 4 ─────────────────────────────────────────────────────────
        // Anti-fraud: block self-service transfers above 10,000 DA.
        // BUG: (int) cast truncates scientific notation at the exponent letter.
        //      (int)"1e6" === 1  →  1 > 10000 is FALSE  →  check passes
        //      but later (float)"1e6" === 1000000.0
        if ((int)$amount_raw > 10000) {
            return ['error' => 'Large transfers require in-branch verification (limit: 10,000 DA).'];
        }
        // ───────────────────────────────────────────────────────────────────

        $amount = (float)$amount_raw;

        if ($amount <= 0) {
            return ['error' => 'Transfer amount must be greater than zero.'];
        }

        $db = getDB();

        $stmt = $db->prepare('SELECT id, username FROM users WHERE username = ?');
        $stmt->execute([$receiver_username]);
        $receiver = $stmt->fetch();
        if (!$receiver) {
            return ['error' => 'Recipient account not found.'];
        }

        // ── STEP 1 ─────────────────────────────────────────────────────────
        // BUG: deduction is rounded to 2 d.p.; credit uses the raw float.
        // round(0.004, 2) === 0.00  →  sender is debited nothing
        // receiver is credited 0.004  →  net money creation
        $amount_shown = round($amount, 2);
        // ───────────────────────────────────────────────────────────────────

        $db->beginTransaction();
        try {
            // Lock sender row
            $stmt = $db->prepare('SELECT balance FROM users WHERE id = ? FOR UPDATE');
            $stmt->execute([$sender_id]);
            $sender = $stmt->fetch();

            if ((float)$sender['balance'] < $amount_shown) {
                $db->rollBack();
                return ['error' => 'Insufficient funds.'];
            }

            // Debit rounded amount from sender
            $db->prepare('UPDATE users SET balance = balance - ? WHERE id = ?')
               ->execute([$amount_shown, $sender_id]);

            // Credit raw float to receiver
            $db->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
               ->execute([$amount, $receiver['id']]);

            $db->prepare(
                "INSERT INTO transactions (sender_id, receiver_id, amount, amount_shown, type)
                 VALUES (?, ?, ?, ?, 'transfer')"
            )->execute([$sender_id, $receiver['id'], $amount, $amount_shown]);

            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            return ['error' => 'Transfer could not be completed. Please try again.'];
        }

        checkVipStatus($receiver['id']);
        checkVipStatus($sender_id);

        return [
            'success'      => true,
            'amount'       => $amount,
            'amount_shown' => $amount_shown,
            'recipient'    => $receiver['username'],
        ];
    }
}
