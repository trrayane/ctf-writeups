<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Controllers/LoanController.php';
require_once __DIR__ . '/includes/layout.php';
requireAuth();
$user = getCurrentUser();
// Release session lock so concurrent requests are not serialized
session_write_close();

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ctrl   = new LoanController();
    $result = $ctrl->requestLoan((int)$user['id']);
    if (isset($result['success'])) {
        $success = sprintf('Loan of %s has been approved and disbursed to your account.', formatDA((float)$result['amount']));
        $user = getCurrentUser();
    } else {
        $error = $result['error'] ?? 'Loan request failed.';
    }
}

$db = getDB();
$stmt = $db->prepare("SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$user['id']]);
$loans = $stmt->fetchAll();

pageHeader('Loan Center', $user);
?>
<div class="container">
  <div class="page-title">Loan Center</div>
  <div class="page-sub">Fast personal credit — no collateral required</div>

  <div class="grid-2">
    <div>
      <?php if ($error):   ?><div class="alert alert-error"><?=   htmlspecialchars($error)   ?></div><?php endif; ?>
      <?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>

      <div class="card mb-4">
        <div class="section-head">Personal Loan Application</div>
        <div class="grid-2 mb-4">
          <div style="background:var(--surface);border-radius:8px;padding:14px">
            <div class="card-title">Loan Amount</div>
            <div class="card-value" style="font-size:22px;color:var(--accent)"><?= formatDA(LoanController::LOAN_AMOUNT) ?></div>
          </div>
          <div style="background:var(--surface);border-radius:8px;padding:14px">
            <div class="card-title">Min. Balance Required</div>
            <div class="card-value" style="font-size:22px"><?= formatDA(LoanController::MIN_BALANCE) ?></div>
          </div>
        </div>
        <div class="alert alert-info mb-4">
          Funds are disbursed immediately upon approval. One active loan per account.
        </div>
        <form method="post">
          <button type="submit" class="btn btn-primary btn-full">Request Loan</button>
        </form>
      </div>

      <div class="card card-sm">
        <div class="card-title">Your Balance</div>
        <div class="card-value accent"><?= formatDA((float)$user['balance']) ?></div>
      </div>
    </div>

    <div class="card">
      <div class="section-head">Loan History</div>
      <?php if (empty($loans)): ?>
      <p class="text-muted text-sm">No loan records found.</p>
      <?php else: ?>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
          <?php foreach ($loans as $loan):
            $bc = ['active'=>'badge-blue','repaid'=>'badge-green','defaulted'=>'badge-red'][$loan['status']] ?? 'badge-gray';
          ?>
            <tr>
              <td class="text-muted text-sm"><?= date('d M Y', strtotime($loan['created_at'])) ?></td>
              <td class="amount-pos"><?= formatDA((float)$loan['amount']) ?></td>
              <td><span class="badge <?= $bc ?>"><?= ucfirst($loan['status']) ?></span></td>
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
