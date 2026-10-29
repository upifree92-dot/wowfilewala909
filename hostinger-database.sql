-- =======================================================
-- Hostinger MySQL Database Schema for wowfilewala
-- Database: u833687569_Wowfilewala
-- User: u833687569_Wowfilewala
-- =======================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Table for App Data Snapshot & Syncing
CREATE TABLE IF NOT EXISTS `app_data` (
  `id` VARCHAR(64) NOT NULL,
  `data_key` VARCHAR(64) NOT NULL,
  `data_val` LONGTEXT NOT NULL,
  `updated_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table for Site Settings (Colors, Banners, Headers, Footers)
CREATE TABLE IF NOT EXISTS `site_settings` (
  `key` VARCHAR(191) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table for Registered Users & Wallets
CREATE TABLE IF NOT EXISTS `registered_users` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobile_number` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(191) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `wallet_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `hwid` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table for Orders (IMEI Orders, Activation Orders)
CREATE TABLE IF NOT EXISTS `order_history` (
  `order_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `user_email` VARCHAR(191) NOT NULL,
  `order_type` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `total_price` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'pending',
  `order_details` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table for Wallet Transactions (Add Funds, Deductions)
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `transaction_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `user_email` VARCHAR(191) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table for Download History
CREATE TABLE IF NOT EXISTS `download_history` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `user_email` VARCHAR(191) NOT NULL,
  `product_id` VARCHAR(191) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `downloaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expiry_date` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- 7. Table for Token Verification Keys
CREATE TABLE IF NOT EXISTS `token_keys` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'active',
  `usage_count` INT NOT NULL DEFAULT 0,
  `max_usage` INT DEFAULT NULL,
  `expiry_date` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table for Token Protection Configuration
CREATE TABLE IF NOT EXISTS `token_protection` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `whatsapp_contact` VARCHAR(64) NOT NULL DEFAULT '919876543210',
  `custom_message` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table for Token Access Verification Logs
CREATE TABLE IF NOT EXISTS `token_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `file_id` VARCHAR(191) DEFAULT NULL,
  `ip_address` VARCHAR(64) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `verified_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Seed Data for Token Keys & Protection
INSERT INTO `token_keys` (`id`, `key`, `note`, `status`, `usage_count`, `max_usage`) 
VALUES 
  ('tok-flash-msba-fhct', 'FLASH-MSBA-FHCT', 'ACER Official Tested Flash File Token Key', 'active', 0, NULL),
  ('tok-flash-wow-9090', 'FLASH-WOW-9090', 'VIP Firmware Download Token', 'active', 0, NULL)
ON DUPLICATE KEY UPDATE `status`='active';

INSERT INTO `token_protection` (`id`, `enabled`, `whatsapp_contact`, `custom_message`) 
VALUES (1, 1, '919876543210', 'Token verification active for protected firmware files.')
ON DUPLICATE KEY UPDATE `enabled` = VALUES(`enabled`);

COMMIT;

