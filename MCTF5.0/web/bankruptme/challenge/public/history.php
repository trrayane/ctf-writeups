<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/includes/layout.php';
requireAuth();
$user = getCurrentUser();

$db    = getDB();
$page  = max(1, (int)($_GET['page'] ?? 1));
$limit = 25;
$offset = ($page - 1) * $limit;

$countStmt = $db->prepare(
    'SELECT COUNT(*) FROM transactions WHERE sender_id = :uid1 OR receiver_id = :uid2'
);
$countStmt->execute([':uid1' => $user['id'], ':uid2' => $user['id']]);
$total = (int)$countStmt->fetchColumn();
$pages = max(1, (int)ceil($total / $limit));

$stmt = $db->prepare(
    "SELECT t.*, u_s.username AS sender_name, u_r.username AS receiver_name
     FROM transactions t
     LEFT JOIN users u_s ON t.sender_id   = u_s.id
     LEFT JOIN users u_r ON t.receiver_id = u_r.id
     WHERE t.sender_id = :uid1 OR t.receiver_id = :uid2
     ORDER BY t.created_at DESC
     LIMIT :lim OFFSET :off"
);
$stmt->bindValue(':uid1', $user['id'], PDO::PARAM_INT);
$stmt->bindValue(':uid2', $user['id'], PDO::PARAM_INT);
$stmt->bindValue(':lim', $limit,      PDO::PARAM_INT);
$stmt->bindValue(':off', $offset,     PDO::PARAM_INT);
$stmt->execute();
$txs = $stmt->fetchAll();

pageHeader('Transaction History', $user);
?>
<div class="container">
  <div class="page-title">Transaction History</div>
  <div class="page-sub"><?= number_format($total) ?> total records — including all credits, debits, loans, and refunds</div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Date &amp; Time</th><th>Type</th>
            <th>From</th><th>To</th>
            <th>Raw Amount</th><th>Displayed</th>
          </tr>
        </thead>
        <tbody>
        <?php if (empty($txs)): ?>
          <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted)">No transactions found.</td></tr>
        <?php else: ?>
        <?php foreach ($txs as $tx):
            $isCredit = ((int)$tx['receiver_id'] === (int)$user['id']);
            $sign     = $isCredit ? '+' : '−';
            $cls      = $isCredit ? 'amount-pos' : 'amount-neg';
            $typeLabels = ['transfer'=>'Transfer','loan'=>'Loan','refund'=>'Refund','system'=>'System'];
            $badgeCls   = ['transfer'=>'badge-blue','loan'=>'badge-purple','refund'=>'badge-green','system'=>'badge-gray'];
            $label = $typeLabels[$tx['type']] ?? $tx['type'];
            $badge = $badgeCls[$tx['type']]   ?? 'badge-gray';
            $rawAmount  = number_format((float)$tx['amount'], 8, '.', ',');
            $shownAmount = $tx['amount_shown'] !== null
                ? number_format((float)$tx['amount_shown'], 2, '.', ',')
                : '—';
        ?>
          <tr>
            <td class="text-muted text-sm">#<?= (int)$tx['id'] ?></td>
            <td class="text-muted text-sm"><?= date('d M Y H:i:s', strtotime($tx['created_at'])) ?></td>
            <td><span class="badge <?= $badge ?>"><?= $label ?></span></td>
            <td class="text-muted"><?= htmlspecialchars($tx['sender_name']   ?? '—') ?></td>
            <td class="text-muted"><?= htmlspecialchars($tx['receiver_name'] ?? '—') ?></td>
            <td class="<?= $cls ?>" style="font-family:var(--mono);font-size:12px">
              <?= $sign ?><?= $rawAmount ?> DA
            </td>
            <td class="amount-neu" style="font-size:12px">
              <?= $shownAmount !== '—' ? $sign . $shownAmount . ' DA' : '—' ?>
            </td>
          </tr>
        <?php endforeach; ?>
        <?php endif; ?>
        </tbody>
      </table>
    </div>

    <?php if ($pages > 1): ?>
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
      <?php for ($i = 1; $i <= $pages; $i++): ?>
        <a href="?page=<?= $i ?>"
           style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;font-size:12px;
                  <?= $i === $page ? 'background:var(--accent);color:#fff;' : 'background:var(--surface);color:var(--muted);border:1px solid var(--border);' ?>">
          <?= $i ?>
        </a>
      <?php endfor; ?>
    </div>
    <?php endif; ?>
  </div>

  <div class="alert alert-info mt-4">
    <div><strong>Note:</strong> The <em>Raw Amount</em> column shows the exact floating-point value recorded in the ledger.
    The <em>Displayed</em> column reflects what was shown in the transaction confirmation screen.</div>
  </div>
</div>
<?php pageFooter(); ?>
