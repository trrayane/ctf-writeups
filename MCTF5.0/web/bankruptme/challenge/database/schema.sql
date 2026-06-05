-- BankruptMe – database schema
CREATE DATABASE IF NOT EXISTS bankruptme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bankruptme;

-- ─────────────────────────────────────────────
--  users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    username      VARCHAR(50)     NOT NULL,
    email         VARCHAR(100)    NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,
    balance       DECIMAL(18,8)   NOT NULL DEFAULT 1000.00000000,
    is_vip        TINYINT(1)      NOT NULL DEFAULT 0,
    is_admin      TINYINT(1)      NOT NULL DEFAULT 0,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_username (username),
    UNIQUE KEY uq_email    (email)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  transactions  (all money movement)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    sender_id     INT UNSIGNED,
    receiver_id   INT UNSIGNED,
    amount        DECIMAL(18,8)   NOT NULL,
    amount_shown  DECIMAL(10,2),
    type          ENUM('transfer','loan','refund','system') NOT NULL DEFAULT 'transfer',
    note          VARCHAR(255),
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sender   (sender_id),
    KEY idx_receiver (receiver_id),
    CONSTRAINT fk_tx_sender   FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tx_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  loans
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
    id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id    INT UNSIGNED    NOT NULL,
    amount     DECIMAL(10,2)   NOT NULL,
    status     ENUM('active','repaid','defaulted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_loan_user (user_id),
    CONSTRAINT fk_loan_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  merchants  (used by refund flow)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
    id      INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    name    VARCHAR(100)   NOT NULL,
    balance DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  refunds
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refunds (
    id          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED   NOT NULL,
    merchant_id INT UNSIGNED   NOT NULL,
    amount      DECIMAL(10,2)  NOT NULL,
    status      VARCHAR(20)    NOT NULL DEFAULT 'processed',
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_refund_user     (user_id),
    KEY idx_refund_merchant (merchant_id),
    CONSTRAINT fk_refund_user     FOREIGN KEY (user_id)     REFERENCES users(id),
    CONSTRAINT fk_refund_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  seed data
-- ─────────────────────────────────────────────

-- Default admin  (password: Adm1n@BNM2024!)
INSERT INTO users (username, email, password_hash, balance, is_admin) VALUES (
    'admin',
    'admin@bnm.internal',
    '$2y$12$LQv3c1yqBWVHxkd0LQ4YCOiXVSbzGY9YXBQmLQk4UQ5A.X8VqOZEe',
    999999999.00000000,
    1
);

-- Merchants – zero balance so refund exploit works immediately
INSERT INTO merchants (name, balance) VALUES
    ('GlobalPay Terminal', 0.00),
    ('SouqMarket',         0.00),
    ('MaghrebShop',        0.00);
