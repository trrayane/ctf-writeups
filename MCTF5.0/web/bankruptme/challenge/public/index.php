<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/includes/layout.php';
requireAuth();
$user = getCurrentUser();

$db = getDB();

// Recent transactions
$stmt = $db->prepare(
    "SELECT t.*, u_s.username AS sender_name, u_r.username AS receiver_name
     FROM transactions t
     LEFT JOIN users u_s ON t.sender_id   = u_s.id
     LEFT JOIN users u_r ON t.receiver_id = u_r.id
     WHERE t.sender_id = :uid1 OR t.receiver_id = :uid2
     ORDER BY t.created_at DESC LIMIT 8"
);
$stmt->execute([':uid1' => $user['id'], ':uid2' => $user['id']]);
$recent = $stmt->fetchAll();

// Active loan count
$loanStmt = $db->prepare("SELECT COUNT(*) FROM loans WHERE user_id = ? AND status = 'active'");
$loanStmt->execute([$user['id']]);
$activeLoans = (int)$loanStmt->fetchColumn();

// Total refunds received
$refStmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM refunds WHERE user_id = ?");
$refStmt->execute([$user['id']]);
$totalRefunds = (float)$refStmt->fetchColumn();

$balance    = (float)$user['balance'];
$progress   = min(100, round(($balance / VIP_THRESHOLD) * 100, 1));
pageHeader('Dashboard', $user);
?>
<div class="container">
  <div class="flex-between mb-4">
    <div>
      <div class="page-title">Account Overview</div>
      <div class="page-sub">Welcome back, <?= htmlspecialchars($user['username']) ?></div>
    </div>
    <?php if ($user['is_vip']): ?>
    <a href="/vip.php" class="btn btn-secondary" style="border-color:var(--warn);color:var(--warn)">★ VIP Access</a>
    <?php endif; ?>
  </div>

  <!-- Balance hero card -->
  <div class="card mb-4" style="background:linear-gradient(135deg,#0f2040,#0f1629);border-color:#1e3a5f">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px">
      <div>
        <div class="card-title">Available Balance</div>
        <div class="card-value big accent" style="font-size:40px"><?= formatDA($balance) ?></div>
        <div style="margin-top:12px;color:var(--muted);font-size:12px">
          Account #CBK-<?= str_pad($user['id'], 8, '0', STR_PAD_LEFT) ?>
          &nbsp;·&nbsp; Member since <?= date('M Y', strtotime($user['created_at'])) ?>
        </div>
      </div>
      <div style="text-align:right">
        <?php if ($user['is_vip']): ?>
        <span class="badge badge-purple" style="font-size:13px;padding:6px 14px">★ VIP CLIENT</span>
        <?php else: ?>
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">VIP Progress</div>
        <div style="background:var(--border);border-radius:6px;height:8px;width:180px;overflow:hidden">
          <div style="background:linear-gradient(90deg,var(--accent),var(--accent2));height:100%;width:<?= $progress ?>%;transition:width .5s"></div>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px"><?= $progress ?>% of <?= formatDA(VIP_THRESHOLD) ?></div>
        <?php endif; ?>
      </div>
    </div>
  </div>

  <!-- Stat cards -->
  <div class="grid-3 mb-4">
    <div class="card card-sm">
      <div class="card-title">Active Loans</div>
      <div class="card-value"><?= $activeLoans ?></div>
      <div class="text-muted text-sm mt-4"><a href="/loan.php">Apply for credit →</a></div>
    </div>
    <div class="card card-sm">
      <div class="card-title">Total Refunds Received</div>
      <div class="card-value"><?= formatDA($totalRefunds) ?></div>
      <div class="text-muted text-sm mt-4"><a href="/refund.php">Submit a claim →</a></div>
    </div>
    <div class="card card-sm">
      <div class="card-title">VIP Threshold</div>
      <div class="card-value"><?= formatDA(VIP_THRESHOLD) ?></div>
      <div class="text-muted text-sm mt-4">Reach this balance to unlock VIP</div>
    </div>
  </div>

  <!-- Recent transactions -->
  <div class="card">
    <div class="flex-between mb-4">
      <div class="section-head" style="margin-bottom:0;border:none;padding:0">Recent Transactions</div>
      <a href="/history.php" class="text-sm">View all →</a>
    </div>
    <?php if (empty($recent)): ?>
    <p class="text-muted text-sm">No transactions yet.</p>
    <?php else: ?>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Description</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>
        <?php foreach ($recent as $tx):
            $isCredit = ((int)$tx['receiver_id'] === (int)$user['id']);
            $sign     = $isCredit ? '+' : '−';
            $cls      = $isCredit ? 'amount-pos' : 'amount-neg';
            $shown    = $tx['amount_shown'] !== null ? (float)$tx['amount_shown'] : (float)$tx['amount'];
            $typeLabels = ['transfer'=>'Transfer','loan'=>'Loan','refund'=>'Refund','system'=>'System'];
            $badgeCls   = ['transfer'=>'badge-blue','loan'=>'badge-purple','refund'=>'badge-green','system'=>'badge-gray'];
            $label = $typeLabels[$tx['type']] ?? $tx['type'];
            $badge = $badgeCls[$tx['type']] ?? 'badge-gray';
            if ($tx['type'] === 'transfer') {
                $desc = $isCredit
                    ? 'Received from ' . htmlspecialchars($tx['sender_name'] ?? 'Unknown')
                    : 'Sent to '       . htmlspecialchars($tx['receiver_name'] ?? 'Unknown');
            } else {
                $desc = htmlspecialchars($tx['note'] ?? $label);
            }
        ?>
          <tr>
            <td class="text-muted text-sm"><?= date('d M Y H:i', strtotime($tx['created_at'])) ?></td>
            <td><span class="badge <?= $badge ?>"><?= $label ?></span></td>
            <td><?= $desc ?></td>
            <td class="<?= $cls ?>"><?= $sign ?><?= formatDA((float)$tx['amount']) ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <?php endif; ?>
  </div>
</div>
<?php pageFooter(); ?>
