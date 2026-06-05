<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Controllers/RefundController.php';
require_once __DIR__ . '/includes/layout.php';
requireAuth();
$user = getCurrentUser();

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ctrl   = new RefundController();
    $result = $ctrl->processRefund(
        (int)$user['id'],
        (int)($_POST['merchant_id'] ?? 0)
    );
    if (isset($result['success'])) {
        $success = sprintf('Refund of %s has been credited to your account.', formatDA((float)$result['amount']));
        $user = getCurrentUser();
    } else {
        $error = $result['error'] ?? 'Refund request failed.';
    }
}

$db = getDB();
$merchants = $db->query('SELECT id, name FROM merchants')->fetchAll();

$stmt = $db->prepare(
    "SELECT r.*, m.name AS merchant_name
     FROM refunds r JOIN merchants m ON r.merchant_id = m.id
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC LIMIT 20"
);
$stmt->execute([$user['id']]);
$history = $stmt->fetchAll();

pageHeader('Refund Claims', $user);
?>
<div class="container">
  <div class="page-title">Merchant Refund Claims</div>
  <div class="page-sub">Submit a claim for an eligible merchant transaction</div>

  <div class="grid-2">
    <div>
      <?php if ($error):   ?><div class="alert alert-error"><?=   htmlspecialchars($error)   ?></div><?php endif; ?>
      <?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>

      <div class="card mb-4">
        <div class="section-head">Submit Refund Claim</div>
        <div style="background:var(--surface);border-radius:8px;padding:14px;margin-bottom:18px">
          <div class="card-title">Standard Refund Amount</div>
          <div class="card-value" style="font-size:22px;color:var(--success)"><?= formatDA(RefundController::REFUND_AMOUNT) ?></div>
        </div>
        <form method="post">
          <div class="form-group">
            <label>Select Merchant</label>
            <select name="merchant_id" required>
              <option value="">— Choose a merchant —</option>
              <?php foreach ($merchants as $m): ?>
              <option value="<?= (int)$m['id'] ?>"
                <?= ((int)($_POST['merchant_id'] ?? 0) === (int)$m['id']) ? 'selected' : '' ?>>
                <?= htmlspecialchars($m['name']) ?>
              </option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="alert alert-info mb-4">
            Refunds are processed automatically. Credits are applied immediately pending merchant verification.
          </div>
          <button type="submit" class="btn btn-primary btn-full">Submit Claim</button>
        </form>
      </div>

      <div class="card card-sm">
        <div class="card-title">Your Balance</div>
        <div class="card-value accent"><?= formatDA((float)$user['balance']) ?></div>
      </div>
    </div>

    <div class="card">
      <div class="section-head">Refund History</div>
      <?php if (empty($history)): ?>
      <p class="text-muted text-sm">No refund claims found.</p>
      <?php else: ?>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Merchant</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
          <?php foreach ($history as $r): ?>
            <tr>
              <td class="text-muted text-sm"><?= date('d M Y H:i', strtotime($r['created_at'])) ?></td>
              <td><?= htmlspecialchars($r['merchant_name']) ?></td>
              <td class="amount-pos"><?= formatDA((float)$r['amount']) ?></td>
              <td><span class="badge badge-green"><?= ucfirst($r['status']) ?></span></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>
<?php pageFooter(); ?>
