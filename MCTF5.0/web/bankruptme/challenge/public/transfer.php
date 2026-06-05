<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Controllers/TransferController.php';
require_once __DIR__ . '/includes/layout.php';
requireAuth();
$user = getCurrentUser();

$error   = '';
$success = '';
$result  = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ctrl   = new TransferController();
    $result = $ctrl->transfer(
        (int)$user['id'],
        trim($_POST['recipient'] ?? ''),
        trim($_POST['amount']    ?? '0')
    );
    if (isset($result['success'])) {
        $success = sprintf(
            'Transfer of %s to %s completed successfully.',
            formatDA((float)$result['amount']),
            htmlspecialchars($result['recipient'])
        );
        $user = getCurrentUser(); // refresh balance
    } else {
        $error = $result['error'] ?? 'Transfer failed.';
    }
}

pageHeader('Transfer Funds', $user);
?>
<div class="container">
  <div class="page-title">Transfer Funds</div>
  <div class="page-sub">Send money to another CBK account holder</div>

  <div class="grid-2">
    <div>
      <?php if ($error):   ?><div class="alert alert-error"><?=   htmlspecialchars($error)   ?></div><?php endif; ?>
      <?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>

      <div class="card">
        <div class="section-head">New Transfer</div>
        <form method="post" autocomplete="off">
          <div class="form-group">
            <label>Recipient Username</label>
            <input type="text" name="recipient" placeholder="Enter recipient's username"
                   value="<?= htmlspecialchars($_POST['recipient'] ?? '') ?>" required>
          </div>
          <div class="form-group">
            <label>Amount (MAD)</label>
            <input type="text" name="amount" placeholder="0.00"
                   value="<?= htmlspecialchars($_POST['amount'] ?? '') ?>" required>
            <div class="text-muted text-sm mt-4">Self-service limit: 10,000 DA per transaction</div>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Send Transfer</button>
        </form>
      </div>

      <div class="alert alert-info mt-4">
        <div>
          <strong>Tip:</strong> Transfers are processed instantly. The displayed deduction may differ
          slightly from the raw transaction amount due to rounding in our legacy settlement engine.
        </div>
      </div>
    </div>

    <div>
      <div class="card card-sm mb-4">
        <div class="card-title">Your Balance</div>
        <div class="card-value accent"><?= formatDA((float)$user['balance']) ?></div>
      </div>
      <div class="card">
        <div class="section-head">Transfer Guidelines</div>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:10px">
          <li style="font-size:13px;color:var(--muted)">· Maximum 10,000 DA per self-service transfer</li>
          <li style="font-size:13px;color:var(--muted)">· Transfers above the limit require branch verification</li>
          <li style="font-size:13px;color:var(--muted)">· All transfers are logged and audited</li>
          <li style="font-size:13px;color:var(--muted)">· Recipient must be a registered CBK client</li>
        </ul>
      </div>
    </div>
  </div>
</div>
<?php pageFooter(); ?>
