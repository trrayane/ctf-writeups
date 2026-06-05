<?php
require_once __DIR__ . '/../../config/config.php';

class AuthController
{
    public function register(string $username, string $email, string $password): array
    {
        $username = trim($username);
        $email    = trim($email);

        if (strlen($username) < 3 || strlen($username) > 50) {
            return ['error' => 'Username must be between 3 and 50 characters.'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Please enter a valid email address.'];
        }
        if (strlen($password) < 8) {
            return ['error' => 'Password must be at least 8 characters.'];
        }

        $db   = getDB();
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            return ['error' => 'Username or email is already registered.'];
        }

        $hash   = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $insert = $db->prepare(
            'INSERT INTO users (username, email, password_hash, balance) VALUES (?, ?, ?, ?)'
        );
        $insert->execute([$username, $email, $hash, INITIAL_BALANCE]);
        $user_id = (int)$db->lastInsertId();

        // Record welcome credit
        $db->prepare(
            "INSERT INTO transactions (receiver_id, amount, type, note)
             VALUES (?, ?, 'system', 'Welcome bonus – account opening credit')"
        )->execute([$user_id, INITIAL_BALANCE]);

        return ['success' => true, 'user_id' => $user_id];
    }

    public function login(string $username, string $password): array
    {
        $db   = getDB();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([trim($username)]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ['error' => 'Invalid username or password.'];
        }

        if (session_status() === PHP_SESSION_NONE) session_start();
        session_regenerate_id(true);
        $_SESSION['user_id']  = $user['id'];
        $_SESSION['username'] = $user['username'];

        return ['success' => true, 'is_admin' => (bool)$user['is_admin']];
    }

    public function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $_SESSION = [];
        session_destroy();
    }
}
