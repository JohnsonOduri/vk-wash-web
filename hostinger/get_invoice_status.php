<?php
ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$config = require __DIR__ . '/vk_config.php';
$invoice = $_GET['invoice'] ?? '';
$meta = file_exists($config['meta_file']) ? json_decode(file_get_contents($config['meta_file']), true) : [];

if (empty($invoice) || !isset($meta[$invoice])) {
    http_response_code(404);
    echo json_encode(['success'=>false,'error'=>'not_found']);
    exit;
}

$status = $meta[$invoice]['payment_status'] ?? ($meta[$invoice]['status'] ?? 'pending');

echo json_encode([
    'success'=>true,
    'invoice'=>$invoice,
    'status'=>$status,
    'meta' => $meta[$invoice]
]);
