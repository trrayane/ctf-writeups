<?php
define('DB_HOST',     getenv('DB_HOST')     ?: 'db');
define('DB_NAME',     getenv('DB_NAME')     ?: 'bankruptme');
define('DB_USER',     getenv('DB_USER')     ?: 'bankruptme');
define('DB_PASS',     getenv('DB_PASS')     ?: 'bankruptme_secret');
define('FLAG',        getenv('FLAG')        ?: 'MCTF{s3t_th3_FLAG_3nv_v4r}');
define('VIP_THRESHOLD',  1000000);
define('INITIAL_BALANCE', 1000.00);

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function requireAuth(): void {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['user_id'])) {
        header('Location: /login.php');
        exit;
    }
}

function getCurrentUser(): ?array {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['user_id'])) return null;
    $stmt = getDB()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}

function checkVipStatus(int $user_id): void {
    $stmt = getDB()->prepare('SELECT balance FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $row = $stmt->fetch();
    if ($row && (float)$row['balance'] >= VIP_THRESHOLD) {
        getDB()->prepare('UPDATE users SET is_vip = 1 WHERE id = ?')->execute([$user_id]);
    }
}

function formatDA(float $amount): string {
    return number_format($amount, 2, '.', ',') . ' DA';
}
