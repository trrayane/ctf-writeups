<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/includes/layout.php';

if (session_status() === PHP_SESSION_NONE) session_start();
if (!empty($_SESSION['user_id'])) {
    header('Location: /index.php'); exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ctrl   = new AuthController();
    $result = $ctrl->login(
        $_POST['username'] ?? '',
        $_POST['password'] ?? ''
    );
    if (isset($result['success'])) {
        header('Location: /index.php'); exit;
    }
    $error = $result['error'] ?? 'Login failed.';
}

pageHeader('Sign In');
?>
<div class="auth-wrap">
  <div class="auth-box">
    <div class="auth-logo">
      <div class="mark">B</div>
      <h1>CBK Client Portal</h1>
      <p>CipherBank International — Secure Access</p>
    </div>

    <?php if ($error): ?>
    <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="post" autocomplete="off">
      <div class="form-group">
        <label>Username</label>
        <input type="text" name="username" placeholder="Enter your username"
               value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" required autofocus>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" name="password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Sign In</button>
    </form>

    <hr class="divider">
    <div class="auth-footer">
      New to CBK? <a href="/register.php">Open an account</a>
    </div>
    <!-- debug=1 (reserved for internal diagnostics) -->
  </div>
</div>
<?php pageFooter(); ?>
