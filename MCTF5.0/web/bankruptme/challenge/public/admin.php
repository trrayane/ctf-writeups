<?php
// ─────────────────────────────────────────────────────────────────────────────
//  CBK Internal Administration Panel
//  Access restricted to bank staff with is_admin = 1 flag in the database.
//  This is intentionally a hard wall — nothing injectable or bypassable here.
// ─────────────────────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/includes/layout.php';

if (session_status() === PHP_SESSION_NONE) session_start();

// Require active session
if (empty($_SESSION['user_id'])) {
    header('Location: /login.php'); exit;
}

// Require admin flag — checked in DB, not just session
$stmt = getDB()->prepare('SELECT is_admin FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$row = $stmt->fetch();

if (!$row || !(bool)$row['is_admin']) {
    http_response_code(403);
    pageHeader('Forbidden');
    ?>
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg)">
      <div style="text-align:center;padding:40px">
        <div style="font-size:72px;font-weight:900;color:var(--danger);opacity:.3">403</div>
        <div style="font-size:20px;font-weight:700;margin-bottom:8px">Access Forbidden</div>
        <div style="color:var(--muted);font-size:13px;margin-bottom:24px">
          This area is restricted to authorised bank staff only.<br>
          Your access attempt has been logged.
        </div>
        <!-- Session ID is encoded for display purposes only -->
        <div style="font-family:monospace;font-size:11px;color:var(--border)">
          ref: <?= base64_encode(session_id()) ?>
        </div>
        <br>
        <a href="/index.php" class="btn btn-secondary" style="display:inline-flex">Return to Dashboard</a>
      </div>
    </div>
    <?php
    pageFooter(); exit;
}

// ── Admin dashboard (only reachable with is_admin = 1) ──────────────────────
$db = getDB();
$userCount = $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
$txCount   = $db->query('SELECT COUNT(*) FROM transactions')->fetchColumn();
$loanSum   = $db->query("SELECT COALESCE(SUM(amount),0) FROM loans WHERE status='active'")->fetchColumn();

$recentUsers = $db->query(
    'SELECT id, username, email, balance, is_vip, created_at FROM users ORDER BY created_at DESC LIMIT 20'
)->fetchAll();

$user = getCurrentUser();
pageHeader('Admin Panel', $user);
?>
<div class="container">
  <div class="page-title">Administration Panel</div>
  <div class="page-sub">Internal staff access — CBK Operations</div>

  <div class="grid-3 mb-4">
    <div class="card card-sm"><div class="card-title">Total Accounts</div><div class="card-value"><?= number_format((int)$userCount) ?></div></div>
    <div class="card card-sm"><div class="card-title">Total Transactions</div><div class="card-value"><?= number_format((int)$txCount) ?></div></div>
    <div class="card card-sm"><div class="card-title">Active Loan Exposure</div><div class="card-value"><?= formatDA((float)$loanSum) ?></div></div>
  </div>

  <div class="card">
    <div class="section-head">Recent Accounts</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Username</th><th>Email</th><th>Balance</th><th>VIP</th><th>Joined</th></tr></thead>
        <tbody>
        <?php foreach ($recentUsers as $u): ?>
          <tr>
            <td class="text-muted text-sm"><?= (int)$u['id'] ?></td>
            <td><?= htmlspecialchars($u['username']) ?></td>
            <td class="text-muted"><?= htmlspecialchars($u['email']) ?></td>
            <td class="amount-neu"><?= formatDA((float)$u['balance']) ?></td>
            <td><?= $u['is_vip'] ? '<span class="badge badge-purple">VIP</span>' : '<span class="badge badge-gray">—</span>' ?></td>
            <td class="text-muted text-sm"><?= date('d M Y', strtotime($u['created_at'])) ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>
<?php pageFooter(); ?>
