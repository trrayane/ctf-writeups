<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/includes/layout.php';
requireAuth();
$user = getCurrentUser();

// Re-evaluate VIP status on every visit (balance may have changed)
checkVipStatus((int)$user['id']);
$user = getCurrentUser();

pageHeader('VIP Zone', $user);
?>
<div class="container">
  <?php if ($user['is_vip']): ?>
  <div class="vip-banner">
    <div style="font-size:48px;margin-bottom:12px">★</div>
    <div style="font-size:24px;font-weight:700;margin-bottom:8px">Congratulations, <?= htmlspecialchars($user['username']) ?></div>
    <div style="color:var(--muted);font-size:14px;margin-bottom:20px">
      You have reached Elite Client status with a balance of <?= formatDA((float)$user['balance']) ?>.
    </div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.8px">Your Exclusive Access Code</div>
    <div class="vip-flag"><?= htmlspecialchars(FLAG) ?></div>
    <div style="margin-top:20px;font-size:12px;color:var(--muted)">
      This code grants access to CBK's private wealth management services. Keep it confidential.
    </div>
  </div>

  <div class="grid-3">
    <div class="card card-sm">
      <div class="card-title">Portfolio Value</div>
      <div class="card-value success"><?= formatDA((float)$user['balance']) ?></div>
    </div>
    <div class="card card-sm">
      <div class="card-title">Client Tier</div>
      <div class="card-value" style="color:var(--warn)">Elite ★★★</div>
    </div>
    <div class="card card-sm">
      <div class="card-title">Wealth Manager</div>
      <div class="card-value" style="font-size:18px">Assigned</div>
    </div>
  </div>

  <?php else: ?>
  <div class="card" style="text-align:center;padding:60px 40px">
    <div style="font-size:56px;margin-bottom:16px;opacity:.3">★</div>
    <div class="page-title" style="margin-bottom:8px">VIP Zone — Access Denied</div>
    <div class="page-sub" style="margin-bottom:28px">
      A minimum balance of <?= formatDA(VIP_THRESHOLD) ?> is required to access this area.
    </div>
    <div style="max-width:400px;margin:0 auto">
      <div style="background:var(--surface);border-radius:8px;padding:16px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
          <span class="text-muted">Your balance</span>
          <span class="amount-neu"><?= formatDA((float)$user['balance']) ?></span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px">
          <span class="text-muted">Required</span>
          <span style="color:var(--warn)"><?= formatDA(VIP_THRESHOLD) ?></span>
        </div>
      </div>
      <div style="background:var(--border);border-radius:6px;height:8px;overflow:hidden">
        <?php $p = min(100, round(((float)$user['balance'] / VIP_THRESHOLD) * 100, 2)); ?>
        <div style="background:linear-gradient(90deg,var(--accent),var(--accent2));height:100%;width:<?= $p ?>%"></div>
      </div>
      <div class="text-muted text-sm" style="margin-top:8px"><?= $p ?>% of target</div>
    </div>
  </div>
  <?php endif; ?>
</div>
<?php pageFooter(); ?>
