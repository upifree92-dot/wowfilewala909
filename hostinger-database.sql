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

-- 7. Table for Appointments & Support Bookings
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `device_model` VARCHAR(191) NOT NULL,
  `service_needed` VARCHAR(191) NOT NULL,
  `appointment_date` VARCHAR(64) NOT NULL,
  `appointment_time` VARCHAR(64) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'pending',
  `user_id` VARCHAR(191) DEFAULT 'anonymous',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
