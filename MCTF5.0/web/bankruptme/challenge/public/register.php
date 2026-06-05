<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/includes/layout.php';

if (session_status() === PHP_SESSION_NONE) session_start();
if (!empty($_SESSION['user_id'])) {
    header('Location: /index.php'); exit;
}

$error   = '';
$success = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ctrl   = new AuthController();
    $result = $ctrl->register(
        $_POST['username'] ?? '',
        $_POST['email']    ?? '',
        $_POST['password'] ?? ''
    );
    if (isset($result['success'])) {
        $success = 'Account created successfully. You may now sign in.';
    } else {
        $error = $result['error'] ?? 'Registration failed.';
    }
}

pageHeader('Open Account');
?>
<div class="auth-wrap">
  <div class="auth-box">
    <div class="auth-logo">
      <div class="mark">B</div>
      <h1>Open an Account</h1>
      <p>Start with <?= formatDA(INITIAL_BALANCE) ?> welcome credit</p>
    </div>

    <?php if ($error):   ?><div class="alert alert-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>

    <?php if (!$success): ?>
    <form method="post" autocomplete="off">
      <div class="form-group">
        <label>Username</label>
        <input type="text" name="username" placeholder="Choose a username"
               value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" required autofocus>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" name="email" placeholder="you@example.com"
               value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" name="password" placeholder="Minimum 8 characters" required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Create Account</button>
    </form>
    <?php endif; ?>

    <hr class="divider">
    <div class="auth-footer">
      Already have an account? <a href="/login.php">Sign in</a>
    </div>
  </div>
</div>
<?php pageFooter(); ?>
