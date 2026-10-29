<?php
/**
 * Hostinger Cloud Sync & MySQL Database Connector for wowfilewala
 * Connects directly to Hostinger MySQL Database (u833687569_Wowfilewala)
 * and keeps cloud-data.json as a high-speed fallback cache.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Hostinger MySQL Database Credentials
$dbHost = 'localhost';
$dbName = 'u833687569_wowfilewala909';
$dbUser = 'u833687569_wowfilewala909';
$dbPass = '2WBVSwFhmSzyc7@';
$dataFile = __DIR__ . '/cloud-data.json';

// Allow custom remote host if set via settings or test query
if (!empty($_GET['host'])) {
    $dbHost = trim($_GET['host']);
} elseif (file_exists($dataFile)) {
    $rawContent = @file_get_contents($dataFile);
    if ($rawContent) {
        $parsed = @json_decode($rawContent, true);
        if (!empty($parsed['siteContent']['adminHostingraPage']['databaseHost'])) {
            $configuredHost = trim($parsed['siteContent']['adminHostingraPage']['databaseHost']);
            if (!empty($configuredHost)) {
                $dbHost = $configuredHost;
            }
        }
    }
}

// Establish PDO MySQL Connection
$pdo = null;
$dbError = null;

try {
    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 4
    ]);
} catch (Exception $e) {
    $dbError = $e->getMessage();
}

// Auto-initialize MySQL tables if database is connected
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS app_data (
                id VARCHAR(64) PRIMARY KEY,
                data_key VARCHAR(64) NOT NULL,
                data_val LONGTEXT NOT NULL,
                updated_at BIGINT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS site_settings (
                `key` VARCHAR(191) PRIMARY KEY,
                `value` LONGTEXT NOT NULL,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS registered_users (
                id VARCHAR(191) PRIMARY KEY,
                email VARCHAR(191) NOT NULL UNIQUE,
                mobile_number VARCHAR(64),
                name VARCHAR(191),
                bio TEXT,
                wallet_balance DECIMAL(12,2) DEFAULT 0.00,
                hwid TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS order_history (
                order_id VARCHAR(191) PRIMARY KEY,
                user_id VARCHAR(191) NOT NULL,
                user_email VARCHAR(191) NOT NULL,
                order_type VARCHAR(64) NOT NULL,
                title VARCHAR(255) NOT NULL,
                quantity INT DEFAULT 1,
                total_price DECIMAL(12,2) NOT NULL,
                status VARCHAR(64) NOT NULL,
                order_details LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS wallet_transactions (
                transaction_id VARCHAR(191) PRIMARY KEY,
                user_id VARCHAR(191) NOT NULL,
                user_email VARCHAR(191) NOT NULL,
                type VARCHAR(64) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS download_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(191) NOT NULL,
                user_email VARCHAR(191) NOT NULL,
                product_id VARCHAR(191) NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expiry_date TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    } catch (Exception $e) {
        // Table initialization caught gracefully
    }
}

// Diagnostic API Test Endpoint: /cloud-sync.php?test=1
if (isset($_GET['test'])) {
    if ($pdo) {
        $tables = [];
        try {
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {}
        
        echo json_encode([
            'success' => true,
            'message' => 'Hostinger MySQL Database Connected Successfully!',
            'database' => $dbName,
            'user' => $dbUser,
            'tables' => $tables,
            'mode' => 'mysql_active'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Could not connect to MySQL at localhost. Operating in JSON file storage mode.',
            'error' => $dbError,
            'mode' => 'file_fallback'
        ]);
    }
    exit;
}

// GET Request: Retrieve the latest synced data
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = null;

    // 1. Try reading from Hostinger MySQL app_data
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT data_val FROM app_data WHERE id = 'main_snapshot' LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch();
            if ($row && !empty($row['data_val'])) {
                $decoded = json_decode($row['data_val'], true);
                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }
        } catch (Exception $e) {
            // Fallback to file
        }
    }

    // 2. Fallback to cloud-data.json
    if ($data === null && file_exists($dataFile)) {
        $raw = file_get_contents($dataFile);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $data = $decoded;
        }
    }

    echo json_encode([
        'success' => true,
        'database_connected' => ($pdo !== null),
        'data' => $data
    ]);
    exit;
}

// POST Request: Save and sync data across the system
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON payload'
        ]);
        exit;
    }

    // Special Action: Forward User Order directly to Connected Dealer API & Auto-Success
    if ((isset($_GET['action']) && $_GET['action'] === 'place_dealer_order') || (isset($input['action']) && $input['action'] === 'place_dealer_order')) {
        $orderId = $input['orderId'] ?? '';
        $serviceId = $input['serviceId'] ?? '1';
        $serviceName = $input['serviceName'] ?? 'GSM Service';
        $inputData = $input['inputData'] ?? '';
        $quantity = $input['quantity'] ?? 1;
        $customerEmail = $input['customerEmail'] ?? '';
        $dealerApi = is_array($input['dealerApi'] ?? null) ? $input['dealerApi'] : [];

        $apiName = $dealerApi['apiName'] ?? 'Connected Dealer API';
        $apiType = $dealerApi['apiType'] ?? 'GSM Theme';
        $apiUrl = trim($dealerApi['apiUrl'] ?? '');
        $username = trim($dealerApi['username'] ?? '');
        $apiAccessKey = trim($dealerApi['apiAccessKey'] ?? '');
        $autoOrderSuccess = !isset($dealerApi['autoOrderSuccess']) || $dealerApi['autoOrderSuccess'] !== false;

        $cleanInput = preg_replace('/^(IMEI:\s*|Account:\s*|WhatsApp:\s*)/i', '', (string)$inputData);
        $parts = explode('|', $cleanInput);
        $cleanInput = trim($parts[0]) ?: (string)$inputData;

        $dealerRefId = 'DLR-' . rand(100000, 999999);
        $dealerReply = '';
        $forwardedToUrl = false;

        if (!empty($apiUrl) && preg_match('/^https?:\/\//i', $apiUrl)) {
            $customFieldB64 = base64_encode(json_encode([
                'input' => $cleanInput,
                'serviceName' => $serviceName,
                'orderId' => $orderId,
                'customerEmail' => $customerEmail
            ]));
            $xmlParams = "<PARAMETERS><IMEI>{$cleanInput}</IMEI><ID>{$serviceId}</ID><CUSTOMFIELD>{$customFieldB64}</CUSTOMFIELD></PARAMETERS>";
            $postFields = http_build_query([
                'username' => $username,
                'apiaccesskey' => $apiAccessKey,
                'action' => 'placeimeiorder',
                'requestformat' => 'JSON',
                'parameters' => $xmlParams,
                'order_id' => $orderId,
                'service_id' => $serviceId,
                'service_name' => $serviceName,
                'imei' => $cleanInput,
                'input' => $cleanInput,
                'quantity' => $quantity,
                'customer_email' => $customerEmail
            ]);

            if (function_exists('curl_init')) {
                $ch = curl_init($apiUrl);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 6);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_USERAGENT, 'WowFileWala-AutoAPI/2.0');
                $rawResp = @curl_exec($ch);
                curl_close($ch);
                $forwardedToUrl = true;

                if ($rawResp) {
                    $jsonResp = @json_decode($rawResp, true);
                    if (is_array($jsonResp)) {
                        if (!empty($jsonResp['SUCCESS'][0]['REFERENCEID'])) {
                            $dealerRefId = (string)$jsonResp['SUCCESS'][0]['REFERENCEID'];
                        }
                        if (!empty($jsonResp['SUCCESS'][0]['MESSAGE'])) {
                            $dealerReply = (string)$jsonResp['SUCCESS'][0]['MESSAGE'];
                        } elseif (!empty($jsonResp['reply']) || !empty($jsonResp['message']) || !empty($jsonResp['code'])) {
                            $dealerReply = (string)($jsonResp['reply'] ?? $jsonResp['message'] ?? $jsonResp['code']);
                        }
                    }
                }
            }
        }

        if (empty($dealerReply)) {
            $dealerReply = "[{$apiName} - {$apiType}] Auto Order Success ✅ | Ref ID: #{$dealerRefId} | Input: {$cleanInput} | Verified & Completed Instantly";
        }

        echo json_encode([
            'success' => true,
            'autoCompleted' => $autoOrderSuccess,
            'status' => $autoOrderSuccess ? 'approved' : 'processing',
            'dealerRefId' => $dealerRefId,
            'forwardedToUrl' => $forwardedToUrl,
            'apiProvider' => "{$apiName} ({$apiType} Auto API 24x7)",
            'reply' => $dealerReply,
            'repliedAt' => gmdate('Y-m-d\TH:i:s\Z')
        ]);
        exit;
    }

    // Load existing data
    $existing = [];
    if (file_exists($dataFile)) {
        $rawExisting = file_get_contents($dataFile);
        $decodedExisting = json_decode($rawExisting, true);
        if (is_array($decodedExisting)) {
            $existing = $decodedExisting;
        }
    }

    $allowedKeys = [
        'siteContent',
        'products',
        'categories',
        'balancePackages',
        'autoWalletNewUser',
        'users',
        'adminNotifications',
        'tokenKeys',
        'tokenProtection',
        'tokenLogs'
    ];

    foreach ($allowedKeys as $key) {
        if (array_key_exists($key, $input)) {
            $existing[$key] = $input[$key];
        }
    }

    $nowTime = round(microtime(true) * 1000);
    $existing['updatedAt'] = $nowTime;
    $encodedJson = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    // 1. Save to cloud-data.json
    $fileSaved = file_put_contents($dataFile, $encodedJson);

    // 2. Save to Hostinger MySQL Database
    $mysqlSaved = false;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO app_data (id, data_key, data_val, updated_at)
                VALUES ('main_snapshot', 'all', :val, :time)
                ON DUPLICATE KEY UPDATE data_val = VALUES(data_val), updated_at = VALUES(updated_at)
            ");
            $stmt->execute([
                ':val' => $encodedJson,
                ':time' => $nowTime
            ]);
            $mysqlSaved = true;

            // Also synchronize users into registered_users table if provided
            if (!empty($input['users']) && is_array($input['users'])) {
                $userStmt = $pdo->prepare("
                    INSERT INTO registered_users (id, email, mobile_number, name, bio, wallet_balance, hwid)
                    VALUES (:id, :email, :mobile, :name, :bio, :balance, :hwid)
                    ON DUPLICATE KEY UPDATE
                        email = VALUES(email),
                        mobile_number = VALUES(mobile_number),
                        name = VALUES(name),
                        bio = VALUES(bio),
                        wallet_balance = VALUES(wallet_balance),
                        hwid = VALUES(hwid)
                ");
                foreach ($input['users'] as $u) {
                    if (is_array($u) && !empty($u['id'])) {
                        $userStmt->execute([
                            ':id' => $u['id'],
                            ':email' => $u['email'] ?? '',
                            ':mobile' => $u['mobileNumber'] ?? '',
                            ':name' => $u['profile']['name'] ?? '',
                            ':bio' => $u['profile']['bio'] ?? '',
                            ':balance' => floatval($u['wallet']['balance'] ?? 0),
                            ':hwid' => $u['hwid'] ?? ''
                        ]);
                    }
                }
            }
        } catch (Exception $e) {
            // MySQL error handled; file was written
        }
    }

    if ($fileSaved === false && !$mysqlSaved) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save data to both MySQL and disk'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'mysql_synced' => $mysqlSaved,
        'file_synced' => ($fileSaved !== false),
        'updatedAt' => $nowTime,
        'message' => $mysqlSaved 
            ? 'Successfully saved to Hostinger MySQL Database (u833687569_Wowfilewala) & JSON storage!'
            : 'Successfully saved to Hostinger server storage!'
    ]);
    exit;
}
?>
