<?php
/**
 * Hostinger MySQL Database Connection Helper
 * Database: u833687569_wowfilewala909
 * User: u833687569_wowfilewala909
 */

$DB_HOST = 'localhost';
$DB_NAME = 'u833687569_wowfilewala909';
$DB_USER = 'u833687569_wowfilewala909';
$DB_PASS = '2WBVSwFhmSzyc7@';

function getDB() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    try {
        $pdo = new PDO("mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4", $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}
?>
