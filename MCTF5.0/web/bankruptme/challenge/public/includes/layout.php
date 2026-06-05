<?php
// Shared layout helpers
function pageHeader(string $title, ?array $user = null): void { ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($title) ?> — CBK Online</title>
<style>
  :root {
    --bg:      #080d1a;
    --surface: #0f1629;
    --card:    #151e35;
    --border:  #1e2d4a;
    --accent:  #0ea5e9;
    --accent2: #7c3aed;
    --success: #10b981;
    --danger:  #ef4444;
    --warn:    #f59e0b;
    --text:    #e2e8f0;
    --muted:   #64748b;
    --mono:    'Courier New', Courier, monospace;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    min-height: 100vh;
  }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* ── Top bar ── */
  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 56px;
  }
  .topbar-brand {
    display: flex; align-items: center; gap: 10px;
    font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: .5px;
  }
  .topbar-brand .logo-mark {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 16px; color: #fff;
  }
  .topbar-right { display: flex; align-items: center; gap: 20px; font-size: 13px; }
  .topbar-user  { color: var(--muted); }
  .topbar-user span { color: var(--text); font-weight: 600; }
  .btn-logout {
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); padding: 5px 14px; border-radius: 6px;
    cursor: pointer; font-size: 12px; transition: all .15s;
  }
  .btn-logout:hover { border-color: var(--danger); color: var(--danger); }

  /* ── Nav ── */
  .nav {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 32px; gap: 2px;
  }
  .nav a {
    color: var(--muted); padding: 14px 16px;
    font-size: 13px; font-weight: 500; border-bottom: 2px solid transparent;
    transition: all .15s; display: flex; align-items: center; gap: 6px;
  }
  .nav a:hover { color: var(--text); text-decoration: none; }
  .nav a.active { color: var(--accent); border-bottom-color: var(--accent); }

  /* ── Layout ── */
  .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
  .page-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .page-sub   { color: var(--muted); font-size: 13px; margin-bottom: 28px; }

  /* ── Cards ── */
  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px;
  }
  .card-sm { padding: 18px 22px; }
  .card-title { font-size: 12px; text-transform: uppercase;
    letter-spacing: .8px; color: var(--muted); margin-bottom: 8px; }
  .card-value {
    font-size: 28px; font-weight: 700;
    font-family: var(--mono); color: var(--text);
  }
  .card-value.big { font-size: 36px; }
  .card-value.accent { color: var(--accent); }
  .card-value.success { color: var(--success); }

  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
  @media (max-width: 768px) {
    .grid-3, .grid-2 { grid-template-columns: 1fr; }
    .topbar, .nav { padding: 0 16px; }
    .container { padding: 20px 16px; }
  }

  /* ── Forms ── */
  .form-group { margin-bottom: 18px; }
  label { display: block; font-size: 12px; font-weight: 600;
    color: var(--muted); text-transform: uppercase; letter-spacing: .6px;
    margin-bottom: 7px; }
  input[type=text], input[type=email], input[type=password],
  input[type=number], select, textarea {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    color: var(--text); padding: 10px 14px; border-radius: 8px; font-size: 14px;
    outline: none; transition: border-color .15s;
  }
  input:focus, select:focus { border-color: var(--accent); }
  input::placeholder { color: var(--muted); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px 24px; border-radius: 8px; border: none;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all .15s;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #0284c7);
    color: #fff;
  }
  .btn-primary:hover { opacity: .9; }
  .btn-secondary {
    background: var(--surface); border: 1px solid var(--border); color: var(--text);
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background: var(--danger); color: #fff; }
  .btn-danger:hover { opacity: .85; }
  .btn-full { width: 100%; }

  /* ── Alerts ── */
  .alert {
    padding: 12px 16px; border-radius: 8px; font-size: 13px;
    margin-bottom: 20px; display: flex; align-items: flex-start; gap: 10px;
  }
  .alert-error   { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: #fca5a5; }
  .alert-success { background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3); color: #6ee7b7; }
  .alert-info    { background: rgba(14,165,233,.12); border: 1px solid rgba(14,165,233,.3); color: #7dd3fc; }
  .alert-warn    { background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.3); color: #fcd34d; }

  /* ── Tables ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { color: var(--muted); font-size: 11px; text-transform: uppercase;
    letter-spacing: .6px; padding: 10px 14px; border-bottom: 1px solid var(--border);
    text-align: left; }
  td { padding: 12px 14px; border-bottom: 1px solid rgba(30,45,74,.6); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(14,165,233,.04); }

  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
  }
  .badge-green  { background: rgba(16,185,129,.15); color: #34d399; }
  .badge-blue   { background: rgba(14,165,233,.15); color: #38bdf8; }
  .badge-purple { background: rgba(124,58,237,.15); color: #a78bfa; }
  .badge-gray   { background: rgba(100,116,139,.15); color: #94a3b8; }
  .badge-red    { background: rgba(239,68,68,.15);   color: #f87171; }

  .amount-pos { color: var(--success); font-family: var(--mono); font-weight: 600; }
  .amount-neg { color: var(--danger);  font-family: var(--mono); font-weight: 600; }
  .amount-neu { color: var(--muted);   font-family: var(--mono); }

  /* ── VIP ── */
  .vip-banner {
    background: linear-gradient(135deg, #7c3aed22, #0ea5e922);
    border: 1px solid #7c3aed55;
    border-radius: 12px; padding: 28px 32px; margin-bottom: 28px;
    text-align: center;
  }
  .vip-flag {
    font-family: var(--mono); font-size: 18px; font-weight: 700;
    color: var(--success); letter-spacing: 2px;
    background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.3);
    border-radius: 8px; padding: 16px 24px; display: inline-block; margin-top: 16px;
    word-break: break-all;
  }
  /* ── Auth pages ── */
  .auth-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at 50% 0%, #0f2040 0%, var(--bg) 60%);
  }
  .auth-box {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 36px 40px; width: 100%; max-width: 420px;
  }
  .auth-logo { text-align: center; margin-bottom: 28px; }
  .auth-logo .mark {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 24px; color: #fff; margin: 0 auto 12px;
  }
  .auth-logo h1 { font-size: 18px; font-weight: 700; }
  .auth-logo p  { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .auth-footer  { text-align: center; margin-top: 20px; font-size: 12px; color: var(--muted); }
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
  .section-head { font-size: 15px; font-weight: 700; margin-bottom: 16px; padding-bottom: 10px;
    border-bottom: 1px solid var(--border); }
  .mt-4 { margin-top: 16px; }
  .mb-4 { margin-bottom: 16px; }
  .text-muted { color: var(--muted); }
  .text-sm { font-size: 12px; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
</style>
</head>
<body>
<?php if ($user): ?>
<header class="topbar">
  <div class="topbar-brand">
    <div class="logo-mark">B</div>
    CipherBank International &nbsp;<span style="color:var(--muted);font-weight:400">— Client Portal</span>
  </div>
  <div class="topbar-right">
    <span class="topbar-user">Logged in as <span><?= htmlspecialchars($user['username']) ?></span></span>
    <form method="post" action="/logout.php" style="display:inline">
      <button type="submit" class="btn-logout">Sign out</button>
    </form>
  </div>
</header>
<nav class="nav">
  <a href="/index.php"    class="<?= basename($_SERVER['PHP_SELF']) === 'index.php'    ? 'active' : '' ?>">Dashboard</a>
  <a href="/transfer.php" class="<?= basename($_SERVER['PHP_SELF']) === 'transfer.php' ? 'active' : '' ?>">Transfer</a>
  <a href="/loan.php"     class="<?= basename($_SERVER['PHP_SELF']) === 'loan.php'     ? 'active' : '' ?>">Loans</a>
  <a href="/refund.php"   class="<?= basename($_SERVER['PHP_SELF']) === 'refund.php'   ? 'active' : '' ?>">Refunds</a>
  <a href="/history.php"  class="<?= basename($_SERVER['PHP_SELF']) === 'history.php'  ? 'active' : '' ?>">History</a>
  <?php if ($user['is_vip']): ?>
  <a href="/vip.php"      class="<?= basename($_SERVER['PHP_SELF']) === 'vip.php'      ? 'active' : '' ?>" style="color:var(--warn)">★ VIP</a>
  <?php endif; ?>
</nav>
<?php endif; ?>
<?php }

function pageFooter(): void { ?>
</body>
</html>
<?php }
?>
