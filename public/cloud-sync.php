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

// Helper: Merge two user lists without overwriting newer wallet balances with stale visitor snapshots
function mergeUsersListPhp($existingUsers, $incomingUsers, $isUserDeletion = false) {
    if ($isUserDeletion && is_array($incomingUsers)) {
        return array_values($incomingUsers);
    }
    $existingArr = is_array($existingUsers) ? array_values($existingUsers) : [];
    $incomingArr = is_array($incomingUsers) ? array_values($incomingUsers) : [];
    if (empty($incomingArr)) return $existingArr;
    if (empty($existingArr)) return $incomingArr;

    $mergedById = [];
    $idByEmail = [];

    foreach ($existingArr as $u) {
        if (!is_array($u) || empty($u['id'])) continue;
        $mergedById[$u['id']] = $u;
        if (!empty($u['email'])) {
            $idByEmail[strtolower(trim($u['email']))] = $u['id'];
        }
    }

    foreach ($incomingArr as $inc) {
        if (!is_array($inc) || empty($inc['id'])) continue;
        $emailKey = !empty($inc['email']) ? strtolower(trim($inc['email'])) : '';
        $matchedId = isset($mergedById[$inc['id']])
            ? $inc['id']
            : (($emailKey && isset($idByEmail[$emailKey])) ? $idByEmail[$emailKey] : $inc['id']);
        $prev = $mergedById[$matchedId] ?? null;

        if (!$prev) {
            $mergedById[$matchedId] = $inc;
            if ($emailKey) $idByEmail[$emailKey] = $matchedId;
            continue;
        }

        $prevWalletTs = intval($prev['walletUpdatedAt'] ?? 0);
        $incWalletTs = intval($inc['walletUpdatedAt'] ?? 0);
        $prevBal = floatval($prev['wallet']['balance'] ?? 0);
        $incBal = floatval($inc['wallet']['balance'] ?? 0);

        $chosenBalance = $incBal;
        $chosenWalletTs = max($prevWalletTs, $incWalletTs);
        if ($prevWalletTs > $incWalletTs) {
            $chosenBalance = $prevBal;
        } elseif ($incWalletTs === 0 && $prevWalletTs === 0 && $prevBal > 0 && $incBal == 0) {
            $chosenBalance = $prevBal;
        }

        // Merge transaction history by id
        $txMap = [];
        $txList = array_merge(
            is_array($inc['transactionHistory'] ?? null) ? $inc['transactionHistory'] : [],
            is_array($prev['transactionHistory'] ?? null) ? $prev['transactionHistory'] : []
        );
        foreach ($txList as $tx) {
            if (is_array($tx) && !empty($tx['id']) && !isset($txMap[$tx['id']])) {
                $txMap[$tx['id']] = $tx;
            }
        }

        // Merge notifications by id
        $notifMap = [];
        $notifList = array_merge(
            is_array($inc['notifications'] ?? null) ? $inc['notifications'] : [],
            is_array($prev['notifications'] ?? null) ? $prev['notifications'] : []
        );
        foreach ($notifList as $n) {
            if (is_array($n) && !empty($n['id']) && !isset($notifMap[$n['id']])) {
                $notifMap[$n['id']] = $n;
            }
        }

        $mergedUser = array_merge($prev, $inc);
        $mergedUser['id'] = $matchedId;
        $mergedUser['wallet'] = ['balance' => $chosenBalance];
        $mergedUser['walletUpdatedAt'] = $chosenWalletTs;
        $mergedUser['transactionHistory'] = array_values($txMap);
        $mergedUser['notifications'] = array_values($notifMap);
        $mergedById[$matchedId] = $mergedUser;
        if ($emailKey) $idByEmail[$emailKey] = $matchedId;
    }

    return array_values($mergedById);
}

// GET Request: Retrieve the latest synced data or specific action
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'get_users') {
        $rows = [];
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM registered_users ORDER BY created_at DESC");
                $rows = $stmt->fetchAll();
            } catch (Exception $e) {}
        }
        $cloudUsers = [];
        if (file_exists($dataFile)) {
            $decoded = @json_decode(@file_get_contents($dataFile), true);
            if (!empty($decoded['users']) && is_array($decoded['users'])) {
                $cloudUsers = $decoded['users'];
            }
        }
        $mergedMap = [];
        foreach ($rows as $r) {
            $mergedMap[$r['id']] = $r;
        }
        foreach ($cloudUsers as $cu) {
            if (!is_array($cu) || empty($cu['id'])) continue;
            $existingRow = $mergedMap[$cu['id']] ?? null;
            $cloudBal = floatval($cu['wallet']['balance'] ?? 0);
            $dbBal = $existingRow ? floatval($existingRow['wallet_balance'] ?? 0) : 0;
            $bestBal = (!empty($cu['walletUpdatedAt']) || $cloudBal > $dbBal) ? $cloudBal : $dbBal;
            $mergedMap[$cu['id']] = [
                'id' => $cu['id'],
                'email' => $cu['email'] ?? ($existingRow['email'] ?? ''),
                'mobile_number' => $cu['mobileNumber'] ?? ($existingRow['mobile_number'] ?? ''),
                'name' => $cu['profile']['name'] ?? ($existingRow['name'] ?? ''),
                'bio' => $cu['profile']['bio'] ?? ($existingRow['bio'] ?? ''),
                'wallet_balance' => $bestBal,
                'hwid' => $cu['hwid'] ?? ($existingRow['hwid'] ?? ''),
                'created_at' => $cu['registeredAt'] ?? ($existingRow['created_at'] ?? gmdate('Y-m-d\TH:i:s\Z'))
            ];
        }
        echo json_encode(['success' => true, 'data' => array_values($mergedMap)]);
        exit;
    }

    if ($action === 'get_user') {
        $userId = trim($_GET['id'] ?? '');
        $foundCloud = null;
        if (file_exists($dataFile)) {
            $decoded = @json_decode(@file_get_contents($dataFile), true);
            if (!empty($decoded['users']) && is_array($decoded['users'])) {
                foreach ($decoded['users'] as $u) {
                    if (is_array($u) && (($u['id'] ?? '') === $userId || strtolower($u['email'] ?? '') === strtolower($userId))) {
                        $foundCloud = $u;
                        break;
                    }
                }
            }
        }
        $dbRow = null;
        if ($pdo && !empty($userId)) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM registered_users WHERE id = :id OR email = :email LIMIT 1");
                $stmt->execute([':id' => $userId, ':email' => $userId]);
                $dbRow = $stmt->fetch();
            } catch (Exception $e) {}
        }
        if ($foundCloud || $dbRow) {
            $cloudBal = $foundCloud ? floatval($foundCloud['wallet']['balance'] ?? 0) : 0;
            $dbBal = $dbRow ? floatval($dbRow['wallet_balance'] ?? 0) : 0;
            $bestBal = ($foundCloud && (!empty($foundCloud['walletUpdatedAt']) || $cloudBal >= $dbBal)) ? $cloudBal : $dbBal;
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $foundCloud['id'] ?? $dbRow['id'],
                    'email' => $foundCloud['email'] ?? $dbRow['email'] ?? '',
                    'mobile_number' => $foundCloud['mobileNumber'] ?? $dbRow['mobile_number'] ?? '',
                    'name' => $foundCloud['profile']['name'] ?? $dbRow['name'] ?? '',
                    'bio' => $foundCloud['profile']['bio'] ?? $dbRow['bio'] ?? '',
                    'wallet_balance' => $bestBal,
                    'walletUpdatedAt' => intval($foundCloud['walletUpdatedAt'] ?? 0),
                    'hwid' => $foundCloud['hwid'] ?? $dbRow['hwid'] ?? ''
                ]
            ]);
        } else {
            echo json_encode(['success' => true, 'data' => null]);
        }
        exit;
    }

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
    } elseif (is_array($data) && file_exists($dataFile)) {
        // Ensure file users with newer walletUpdatedAt are merged in
        $rawFile = @file_get_contents($dataFile);
        $decodedFile = @json_decode($rawFile, true);
        if (is_array($decodedFile) && !empty($decodedFile['users'])) {
            $data['users'] = mergeUsersListPhp($data['users'] ?? [], $decodedFile['users'], false);
            $data['updatedAt'] = max(intval($data['updatedAt'] ?? 0), intval($decodedFile['updatedAt'] ?? 0));
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

    $action = $_GET['action'] ?? ($input['action'] ?? '');

    // Helper function to normalize Dealer API status into 'pending' | 'processing' | 'approved' | 'rejected'
    function parseDealerStatusPhp($rawStatus) {
        if ($rawStatus === null || $rawStatus === '') return null;
        $str = strtolower(trim((string)$rawStatus));
        if ($str === '4' || $str === 'success' || $str === 'completed' || $str === 'approved' || $str === 'available' || $str === 'done') {
            return 'approved';
        }
        if ($str === '3' || $str === 'rejected' || $str === 'reject' || $str === 'cancelled' || $str === 'canceled' || $str === 'failed' || $str === 'error') {
            return 'rejected';
        }
        if ($str === '2' || $str === '1' || $str === 'processing' || $str === 'inprocess' || $str === 'in_process' || $str === 'working') {
            return 'processing';
        }
        if ($str === '0' || $str === 'waiting' || $str === 'pending' || $str === 'new' || $str === 'queued') {
            return 'pending';
        }
        return null;
    }

    // Special Action 0: Atomic Admin Wallet Balance Add / Deduct (Guaranteed delivery to user)
    if ($action === 'admin_adjust_balance') {
        $userId = trim((string)($input['userId'] ?? ''));
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $mobileNumber = preg_replace('/\D/', '', (string)($input['mobileNumber'] ?? ''));
        $delta = floatval($input['amount'] ?? 0);
        $reason = trim((string)($input['reason'] ?? ($delta >= 0 ? 'Wallet Payment Added by Admin' : 'Wallet Balance Adjusted by Admin')));

        if ((empty($userId) && empty($email)) || $delta == 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Valid userId/email and non-zero amount required']);
            exit;
        }

        $nowMs = round(microtime(true) * 1000);
        $nowIso = gmdate('Y-m-d\TH:i:s\Z');
        $txId = (string)($input['transactionId'] ?? ('txn-admin-' . $nowMs));
        $notifId = 'notif-wallet-' . $nowMs;

        $cloudData = [];
        if (file_exists($dataFile)) {
            $cloudData = @json_decode(@file_get_contents($dataFile), true) ?: [];
        }
        if (empty($cloudData['users']) && $pdo) {
            try {
                $stmtSnap = $pdo->prepare("SELECT data_val FROM app_data WHERE id = 'main_snapshot' LIMIT 1");
                $stmtSnap->execute();
                $rowSnap = $stmtSnap->fetch();
                if ($rowSnap && !empty($rowSnap['data_val'])) {
                    $fromDb = @json_decode($rowSnap['data_val'], true);
                    if (is_array($fromDb)) $cloudData = $fromDb;
                }
            } catch (Exception $e) {}
        }

        if (!isset($cloudData['users']) || !is_array($cloudData['users'])) {
            $cloudData['users'] = [];
        }

        $matchedUser = null;
        $newBalance = isset($input['newBalance']) && is_numeric($input['newBalance']) ? max(0, round(floatval($input['newBalance']), 2)) : 0;

        foreach ($cloudData['users'] as &$u) {
            if (!is_array($u)) continue;
            $uIdMatch = !empty($userId) && ($u['id'] ?? '') === $userId;
            $uEmailMatch = !empty($email) && strtolower(trim((string)($u['email'] ?? ''))) === $email;
            $uMobileClean = preg_replace('/\D/', '', (string)($u['mobileNumber'] ?? ''));
            $uMobileMatch = strlen($mobileNumber) >= 10 && strlen($uMobileClean) >= 10 && substr($uMobileClean, -10) === substr($mobileNumber, -10);

            if ($uIdMatch || $uEmailMatch || $uMobileMatch) {
                $currentBal = floatval($u['wallet']['balance'] ?? 0);
                $computedBalance = isset($input['newBalance']) && is_numeric($input['newBalance'])
                    ? max(0, round(floatval($input['newBalance']), 2))
                    : max(0, round($currentBal + $delta, 2));
                $newBalance = $computedBalance;

                $newTx = [
                    'id' => $txId,
                    'timestamp' => $nowIso,
                    'type' => $delta > 0 ? 'deposit' : 'admin_adjustment',
                    'amount' => $delta,
                    'description' => $reason
                ];

                $newNotif = [
                    'id' => $notifId,
                    'title' => $delta > 0
                        ? 'Wallet Credited: +₹' . number_format($delta, 2, '.', '') . ' ✅'
                        : 'Wallet Deducted: -₹' . number_format(abs($delta), 2, '.', ''),
                    'message' => $delta > 0
                        ? 'Admin has added ₹' . number_format($delta, 2, '.', '') . ' to your wallet (' . $reason . '). Your updated wallet balance is ₹' . number_format($computedBalance, 2, '.', '') . '.'
                        : 'Admin adjusted ₹' . number_format(abs($delta), 2, '.', '') . ' from your wallet (' . $reason . '). Your updated wallet balance is ₹' . number_format($computedBalance, 2, '.', '') . '.',
                    'timestamp' => $nowIso,
                    'read' => false,
                    'status' => 'approved'
                ];

                $existingTx = is_array($u['transactionHistory'] ?? null) ? $u['transactionHistory'] : [];
                $filteredTx = array_values(array_filter($existingTx, function($t) use ($txId) {
                    return ($t['id'] ?? '') !== $txId;
                }));
                array_unshift($filteredTx, $newTx);

                $existingNotifs = is_array($u['notifications'] ?? null) ? $u['notifications'] : [];
                array_unshift($existingNotifs, $newNotif);

                $u['wallet'] = ['balance' => $computedBalance];
                $u['walletUpdatedAt'] = $nowMs;
                $u['transactionHistory'] = $filteredTx;
                $u['notifications'] = $existingNotifs;
                $u['lifetimePointsPurchased'] = floatval($u['lifetimePointsPurchased'] ?? 0) + ($delta > 0 ? $delta : 0);

                $matchedUser = $u;
            }
        }
        unset($u);

        if (!$matchedUser) {
            $computedBalance = isset($input['newBalance']) && is_numeric($input['newBalance'])
                ? max(0, round(floatval($input['newBalance']), 2))
                : max(0, round($delta, 2));
            $newBalance = $computedBalance;
            $matchedUser = [
                'id' => $userId ?: ('user-' . $nowMs),
                'email' => $input['email'] ?? '',
                'password' => 'password',
                'mobileNumber' => $input['mobileNumber'] ?? '',
                'profile' => [
                    'name' => $input['name'] ?? (!empty($email) ? explode('@', $email)[0] : 'User'),
                    'bio' => '',
                    'emailNotifications' => ['systemUpdates' => true, 'newFileReleases' => true]
                ],
                'wallet' => ['balance' => $computedBalance],
                'walletUpdatedAt' => $nowMs,
                'purchasedProductIds' => [],
                'favoriteProductIds' => [],
                'visitedProductIds' => [],
                'registeredAt' => $nowIso,
                'isBlocked' => false,
                'notifications' => [[
                    'id' => $notifId,
                    'title' => $delta > 0 ? 'Wallet Credited: +₹' . number_format($delta, 2, '.', '') . ' ✅' : 'Wallet Adjusted',
                    'message' => 'Your updated wallet balance is ₹' . number_format($computedBalance, 2, '.', '') . '.',
                    'timestamp' => $nowIso,
                    'read' => false,
                    'status' => 'approved'
                ]],
                'transactionHistory' => [[
                    'id' => $txId,
                    'timestamp' => $nowIso,
                    'type' => $delta > 0 ? 'deposit' : 'admin_adjustment',
                    'amount' => $delta,
                    'description' => $reason
                ]],
                'referredUsers' => [],
                'lifetimePointsPurchased' => $delta > 0 ? $delta : 0
            ];
            $cloudData['users'][] = $matchedUser;
        }

        $cloudData['updatedAt'] = $nowMs;
        $encoded = json_encode($cloudData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        file_put_contents($dataFile, $encoded);

        if ($pdo) {
            try {
                $stmtApp = $pdo->prepare("
                    INSERT INTO app_data (id, data_key, data_val, updated_at)
                    VALUES ('main_snapshot', 'all', :val, :time)
                    ON DUPLICATE KEY UPDATE data_val = VALUES(data_val), updated_at = VALUES(updated_at)
                ");
                $stmtApp->execute([':val' => $encoded, ':time' => $nowMs]);

                $stmtUser = $pdo->prepare("
                    INSERT INTO registered_users (id, email, mobile_number, name, bio, wallet_balance, hwid)
                    VALUES (:id, :email, :mobile, :name, :bio, :balance, :hwid)
                    ON DUPLICATE KEY UPDATE
                        wallet_balance = VALUES(wallet_balance),
                        mobile_number = COALESCE(NULLIF(VALUES(mobile_number), ''), mobile_number),
                        name = COALESCE(NULLIF(VALUES(name), ''), name)
                ");
                $stmtUser->execute([
                    ':id' => $matchedUser['id'],
                    ':email' => $matchedUser['email'] ?? '',
                    ':mobile' => $matchedUser['mobileNumber'] ?? '',
                    ':name' => $matchedUser['profile']['name'] ?? '',
                    ':bio' => $matchedUser['profile']['bio'] ?? '',
                    ':balance' => $newBalance,
                    ':hwid' => $matchedUser['hwid'] ?? ''
                ]);

                $stmtTx = $pdo->prepare("
                    INSERT INTO wallet_transactions (transaction_id, user_id, user_email, type, amount, description)
                    VALUES (:tid, :uid, :uemail, :type, :amount, :desc)
                    ON DUPLICATE KEY UPDATE amount = VALUES(amount), description = VALUES(description)
                ");
                $stmtTx->execute([
                    ':tid' => $txId,
                    ':uid' => $matchedUser['id'],
                    ':uemail' => $matchedUser['email'] ?? '',
                    ':type' => $delta > 0 ? 'deposit' : 'admin_adjustment',
                    ':amount' => $delta,
                    ':desc' => $reason
                ]);
            } catch (Exception $e) {}
        }

        echo json_encode([
            'success' => true,
            'userId' => $matchedUser['id'],
            'email' => $matchedUser['email'] ?? '',
            'newBalance' => $newBalance,
            'walletUpdatedAt' => $nowMs,
            'updatedAt' => $nowMs,
            'user' => $matchedUser
        ]);
        exit;
    }

    // Special Action 0b: Save single user (save_user)
    if ($action === 'save_user') {
        $uId = trim((string)($input['id'] ?? ''));
        $uEmail = trim((string)($input['email'] ?? ''));
        $uMobile = trim((string)($input['mobile_number'] ?? ($input['mobileNumber'] ?? '')));
        $uName = trim((string)($input['name'] ?? ''));
        $uBio = trim((string)($input['bio'] ?? ''));
        $uBal = floatval($input['wallet_balance'] ?? 0);
        $uHwid = isset($input['hwid']) ? (string)$input['hwid'] : '';

        if ($pdo && !empty($uId)) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO registered_users (id, email, mobile_number, name, bio, wallet_balance, hwid)
                    VALUES (:id, :email, :mobile, :name, :bio, :balance, :hwid)
                    ON DUPLICATE KEY UPDATE
                        email = VALUES(email),
                        mobile_number = VALUES(mobile_number),
                        name = VALUES(name),
                        bio = VALUES(bio),
                        wallet_balance = VALUES(wallet_balance)
                ");
                $stmt->execute([
                    ':id' => $uId,
                    ':email' => $uEmail,
                    ':mobile' => $uMobile,
                    ':name' => $uName,
                    ':bio' => $uBio,
                    ':balance' => $uBal,
                    ':hwid' => $uHwid
                ]);
            } catch (Exception $e) {}
        }
        echo json_encode(['success' => true]);
        exit;
    }

    // Special Action 1: Forward User Order directly to Connected Dealer API
    if ($action === 'place_dealer_order') {
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
        $dealerOrderMode = $dealerApi['dealerOrderMode'] ?? 'dealer_live_sync';

        $cleanInput = preg_replace('/^(IMEI:\s*|Account:\s*|WhatsApp:\s*)/i', '', (string)$inputData);
        $parts = explode('|', $cleanInput);
        $cleanInput = trim($parts[0]) ?: (string)$inputData;

        $dealerRefId = 'DLR-' . rand(100000, 999999);
        $dealerReply = '';
        $dealerStatus = ($dealerOrderMode === 'instant_success') ? 'approved' : 'processing';
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
                curl_setopt($ch, CURLOPT_TIMEOUT, 7);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_USERAGENT, 'WowFileWala-AutoAPI/2.0');
                $rawResp = @curl_exec($ch);
                curl_close($ch);
                $forwardedToUrl = true;

                if ($rawResp) {
                    $jsonResp = @json_decode($rawResp, true);
                    if (is_array($jsonResp)) {
                        if (!empty($jsonResp['ERROR'][0])) {
                            $errObj = $jsonResp['ERROR'][0];
                            $dealerStatus = 'rejected';
                            $dealerReply = (string)($errObj['MESSAGE'] ?? $errObj['FULL_DESCRIPTION'] ?? 'Order rejected by Dealer API');
                        } elseif (!empty($jsonResp['error']) && is_string($jsonResp['error'])) {
                            $dealerStatus = 'rejected';
                            $dealerReply = $jsonResp['error'];
                        } elseif (!empty($jsonResp['SUCCESS'][0])) {
                            $sObj = $jsonResp['SUCCESS'][0];
                            if (!empty($sObj['REFERENCEID'])) {
                                $dealerRefId = (string)$sObj['REFERENCEID'];
                            }
                            $parsedSt = parseDealerStatusPhp($sObj['STATUS'] ?? $sObj['status'] ?? null);
                            if ($parsedSt) {
                                $dealerStatus = $parsedSt;
                            } elseif (!empty($sObj['CODE'])) {
                                $dealerStatus = 'approved';
                            } elseif ($dealerOrderMode === 'dealer_live_sync') {
                                $dealerStatus = 'processing';
                            }
                            if (!empty($sObj['CODE'])) {
                                $dealerReply = (string)$sObj['CODE'];
                            } elseif (!empty($sObj['MESSAGE'])) {
                                $dealerReply = (string)$sObj['MESSAGE'];
                            }
                        } else {
                            if (!empty($jsonResp['referenceid']) || !empty($jsonResp['order_id']) || !empty($jsonResp['id'])) {
                                $dealerRefId = (string)($jsonResp['referenceid'] ?? $jsonResp['order_id'] ?? $jsonResp['id']);
                            }
                            $parsedSt = parseDealerStatusPhp($jsonResp['status'] ?? $jsonResp['STATUS'] ?? $jsonResp['order_status'] ?? null);
                            if ($parsedSt) {
                                $dealerStatus = $parsedSt;
                            }
                            if (!empty($jsonResp['code']) || !empty($jsonResp['reply']) || !empty($jsonResp['message']) || !empty($jsonResp['reason'])) {
                                $dealerReply = (string)($jsonResp['code'] ?? $jsonResp['reply'] ?? $jsonResp['message'] ?? $jsonResp['reason']);
                            }
                        }
                    }
                }
            }
        }

        if (empty($dealerReply)) {
            if ($dealerStatus === 'approved') {
                $dealerReply = "[{$apiName}] Order Completed ✅ | Ref ID: #{$dealerRefId} | Input: {$cleanInput}";
            } elseif ($dealerStatus === 'rejected') {
                $dealerReply = "[{$apiName}] Order Rejected by Dealer Team | Ref ID: #{$dealerRefId}";
            } elseif ($dealerStatus === 'processing') {
                $dealerReply = "Order sent to {$apiName} Team (Ref ID: #{$dealerRefId}). Processing in progress - you will be notified automatically as soon as Dealer updates status.";
            } else {
                $dealerReply = "Waiting for {$apiName} Team action (Ref ID: #{$dealerRefId}).";
            }
        }

        echo json_encode([
            'success' => true,
            'status' => $dealerStatus,
            'dealerRefId' => $dealerRefId,
            'forwardedToUrl' => $forwardedToUrl,
            'apiProvider' => "{$apiName} ({$apiType} Auto API 24x7)",
            'reply' => $dealerReply,
            'repliedAt' => ($dealerStatus === 'approved' || $dealerStatus === 'rejected') ? gmdate('Y-m-d\TH:i:s\Z') : null
        ]);
        exit;
    }

    // Special Action 2: Poll / Check Live Order Status from Connected Dealer API (action=getimeiorder)
    if ($action === 'check_dealer_orders') {
        $orders = is_array($input['orders'] ?? null) ? $input['orders'] : [];
        $dealerApi = is_array($input['dealerApi'] ?? null) ? $input['dealerApi'] : [];
        $apiUrl = trim($dealerApi['apiUrl'] ?? '');
        $username = trim($dealerApi['username'] ?? '');
        $apiAccessKey = trim($dealerApi['apiAccessKey'] ?? '');

        if (empty($apiUrl) || !preg_match('/^https?:\/\//i', $apiUrl) || empty($orders) || !function_exists('curl_init')) {
            echo json_encode(['success' => true, 'updates' => []]);
            exit;
        }

        $updates = [];
        $slice = array_slice($orders, 0, 15);
        foreach ($slice as $ord) {
            $orderId = (string)($ord['orderId'] ?? '');
            $fullRefId = (string)($ord['dealerRefId'] ?? $orderId);
            $dealerRefId = preg_replace('/^DLR-/i', '', $fullRefId);
            if (empty($orderId)) continue;

            $xmlParams = "<PARAMETERS><ID>{$dealerRefId}</ID><ORDERID>{$orderId}</ORDERID></PARAMETERS>";
            $postFields = http_build_query([
                'username' => $username,
                'apiaccesskey' => $apiAccessKey,
                'action' => 'getimeiorder',
                'requestformat' => 'JSON',
                'parameters' => $xmlParams,
                'id' => $dealerRefId,
                'referenceid' => $fullRefId,
                'order_id' => $orderId
            ]);

            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'WowFileWala-AutoAPI/2.0');
            $rawResp = @curl_exec($ch);
            curl_close($ch);

            if ($rawResp) {
                $json = @json_decode($rawResp, true);
                if (is_array($json)) {
                    $detectedStatus = null;
                    $detectedReply = '';
                    if (!empty($json['SUCCESS'][0])) {
                        $sObj = $json['SUCCESS'][0];
                        $detectedStatus = parseDealerStatusPhp($sObj['STATUS'] ?? $sObj['status'] ?? null);
                        $detectedReply = trim((string)($sObj['CODE'] ?? $sObj['MESSAGE'] ?? $sObj['REPLY'] ?? ''));
                    } elseif (!empty($json['ERROR'][0])) {
                        $eObj = $json['ERROR'][0];
                        $errMsg = (string)($eObj['MESSAGE'] ?? $eObj['FULL_DESCRIPTION'] ?? '');
                        if (preg_match('/reject|cancel|fail|invalid|not found/i', $errMsg)) {
                            $detectedStatus = 'rejected';
                            $detectedReply = $errMsg;
                        }
                    } else {
                        $detectedStatus = parseDealerStatusPhp($json['status'] ?? $json['STATUS'] ?? $json['order_status'] ?? null);
                        $detectedReply = trim((string)($json['code'] ?? $json['CODE'] ?? $json['reply'] ?? $json['message'] ?? $json['reason'] ?? ''));
                    }

                    if ($detectedStatus) {
                        $updates[] = [
                            'orderId' => $orderId,
                            'dealerRefId' => $fullRefId,
                            'status' => $detectedStatus,
                            'reply' => $detectedReply,
                            'repliedAt' => ($detectedStatus === 'approved' || $detectedStatus === 'rejected') ? gmdate('Y-m-d\TH:i:s\Z') : null
                        ];
                    }
                }
            }
        }

        echo json_encode(['success' => true, 'updates' => $updates]);
        exit;
    }

    // Special Action 3: Direct Dealer Webhook / Callback (GET or POST)
    if ($action === 'dealer_webhook') {
        $params = array_merge($_GET, $_POST, is_array($input) ? $input : []);
        $orderId = preg_replace('/^#/', '', trim((string)($params['order_id'] ?? $params['orderId'] ?? $params['id'] ?? '')));
        $dealerRefId = trim((string)($params['referenceid'] ?? $params['dealerRefId'] ?? $params['ref_id'] ?? ''));
        $rawStatus = $params['status'] ?? $params['STATUS'] ?? $params['order_status'] ?? null;
        $replyText = trim((string)($params['reply'] ?? $params['code'] ?? $params['CODE'] ?? $params['message'] ?? $params['MESSAGE'] ?? $params['reason'] ?? ''));

        $newStatus = parseDealerStatusPhp($rawStatus);
        if ((empty($orderId) && empty($dealerRefId)) || !$newStatus) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Required: order_id (or referenceid) and status']);
            exit;
        }

        $cloudData = [];
        if (file_exists($dataFile)) {
            $cloudData = json_decode(file_get_contents($dataFile), true) ?: [];
        }

        $nowIso = gmdate('Y-m-d\TH:i:s\Z');
        $matchedOrderId = $orderId;
        $targetUserId = '';
        $refundAmount = 0;
        $serviceTitle = 'Order';
        $previousStatus = '';

        if (!empty($cloudData['adminNotifications']) && is_array($cloudData['adminNotifications'])) {
            foreach ($cloudData['adminNotifications'] as &$n) {
                $matchesId = !empty($orderId) && preg_replace('/^#/', '', (string)($n['orderId'] ?? '')) === $orderId;
                $matchesRef = !empty($dealerRefId) && (string)($n['orderDetails']['dealerRefId'] ?? '') === $dealerRefId;
                if ($matchesId || $matchesRef) {
                    $matchedOrderId = (string)($n['orderId'] ?? $orderId);
                    $targetUserId = (string)($n['userId'] ?? '');
                    $previousStatus = (string)($n['status'] ?? 'pending');
                    $serviceTitle = (string)($n['orderDetails']['categoryName'] ?? 'Order');
                    $refundAmount = (float)($n['orderDetails']['totalPrice'] ?? $n['orderDetails']['price'] ?? 0);
                    $n['status'] = $newStatus;
                    if (!empty($replyText)) $n['adminReply'] = $replyText;
                    if ($newStatus === 'rejected') $n['rejectionReason'] = $replyText ?: 'Rejected by Dealer API Team';
                    if ($newStatus === 'approved' || $newStatus === 'rejected') $n['repliedAt'] = $nowIso;
                    $n['read'] = false;
                }
            }
            unset($n);
        }

        if (!empty($cloudData['users']) && is_array($cloudData['users'])) {
            foreach ($cloudData['users'] as &$u) {
                if (!is_array($u)) continue;
                $isOwner = (!empty($targetUserId) && ($u['id'] ?? '') === $targetUserId);
                if (!$isOwner && !empty($u['notifications']) && is_array($u['notifications'])) {
                    foreach ($u['notifications'] as $unCheck) {
                        if ((string)($unCheck['orderId'] ?? '') === $matchedOrderId) {
                            $isOwner = true;
                            break;
                        }
                    }
                }
                if (!$isOwner) continue;

                $walletBal = (float)($u['wallet']['balance'] ?? 0);
                if ($newStatus === 'rejected' && $previousStatus !== 'rejected' && $refundAmount > 0) {
                    $walletBal = round($walletBal + $refundAmount, 2);
                    $u['wallet']['balance'] = $walletBal;
                    $u['walletUpdatedAt'] = round(microtime(true) * 1000);
                    if (!isset($u['transactionHistory']) || !is_array($u['transactionHistory'])) {
                        $u['transactionHistory'] = [];
                    }
                    array_unshift($u['transactionHistory'], [
                        'id' => 'txn-dlr-refund-' . round(microtime(true) * 1000),
                        'timestamp' => $nowIso,
                        'type' => 'refund',
                        'amount' => $refundAmount,
                        'description' => "Auto Refund for Dealer Rejected Order #{$matchedOrderId}: {$serviceTitle}"
                    ]);
                }

                if (!empty($u['notifications']) && is_array($u['notifications'])) {
                    foreach ($u['notifications'] as &$un) {
                        if ((string)($un['orderId'] ?? '') === $matchedOrderId) {
                            $un['status'] = $newStatus;
                            $un['title'] = $newStatus === 'approved'
                                ? "Order #{$matchedOrderId} Success ✅"
                                : ($newStatus === 'rejected' ? "Order #{$matchedOrderId} Rejected ❌" : "Order #{$matchedOrderId} Processing ⏳");
                            if (!empty($replyText)) $un['adminReply'] = $replyText;
                            if ($newStatus === 'rejected') $un['rejectionReason'] = $replyText ?: 'Rejected by Dealer API Team';
                            $un['read'] = false;
                            $un['timestamp'] = $nowIso;
                        }
                    }
                    unset($un);
                }
            }
            unset($u);
        }

        $cloudData['updatedAt'] = round(microtime(true) * 1000);
        file_put_contents($dataFile, json_encode($cloudData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true, 'orderId' => $matchedOrderId, 'status' => $newStatus, 'reply' => $replyText]);
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
            if ($key === 'users' && is_array($input['users'])) {
                $existing['users'] = mergeUsersListPhp(
                    $existing['users'] ?? [],
                    $input['users'],
                    !empty($input['isUserDeletion'])
                );
            } else {
                $existing[$key] = $input[$key];
            }
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

            // Synchronize merged users into registered_users table
            $usersToSave = !empty($existing['users']) && is_array($existing['users']) ? $existing['users'] : [];
            if (!empty($usersToSave)) {
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
                foreach ($usersToSave as $u) {
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
